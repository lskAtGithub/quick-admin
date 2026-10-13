import json
import re

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.types import ASGIApp

from app.config.setting import settings
from app.common.enums import RET, RedisInitKeyConfig
from app.core.security import decode_access_token


class CustomCORSMiddleware(CORSMiddleware):
    def __init__(self, app: ASGIApp) -> None:
        super().__init__(
            app,
            allow_origins=["*"],
            allow_methods=["*"],
            allow_headers=["*"],
            allow_credentials=True,
        )


class CustomGZipMiddleware(GZipMiddleware):
    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app, minimum_size=1000)


PUBLIC_PATHS = [
    "/api/v1/system/auth/login",
    "/api/v1/system/auth/logout",
    "/api/v1/system/auth/captcha",
    "/api/v1/system/auth/token/refresh",
    "/api/v1/system/user/current/info",
    "/docs",
    "/redoc",
    "/openapi.json",
]


def path_to_permission(path: str, method: str) -> str | None:
    path = re.sub(r"^/api/v1", "", path)
    parts = [p for p in path.strip("/").split("/") if p and not re.match(r"^\d+$|^\{.*\}$", p)]
    if len(parts) < 3:
        return None

    module = parts[0]
    resource = parts[1]
    action = parts[2]

    if method == "GET":
        action = "query"
    elif method == "POST":
        action = "create"
    elif method == "PUT":
        action = "update"
    elif method == "DELETE":
        action = "delete"
    else:
        return None

    return f"{module}:{resource}:{action}"


class PermissionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        if any(path.startswith(p) or path == p for p in PUBLIC_PATHS):
            return await call_next(request)

        if not path.startswith("/api/v1/"):
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return await call_next(request)

        token = auth_header.split(" ", 1)[1]
        payload = decode_access_token(token)
        if not payload or not payload.sub:
            return await call_next(request)

        redis = request.app.state.redis
        session_key = f"{RedisInitKeyConfig.USER_SESSION.key}:{payload.sub}"
        raw = await redis.get(session_key)
        if not raw:
            return await call_next(request)

        session_data = json.loads(raw)
        is_superuser = session_data.get("is_superuser", False)
        if is_superuser:
            return await call_next(request)

        user_id = session_data.get("user_id")
        required_perm = path_to_permission(path, request.method)
        if not required_perm:
            return await call_next(request)

        from app.core.database import async_db_session
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload
        from app.modules.system.user.model import UserModel
        from app.modules.system.role.model import RoleModel

        async with async_db_session() as db:
            stmt = (
                select(UserModel)
                .options(selectinload(UserModel.roles).selectinload(RoleModel.menus))
                .where(UserModel.id == user_id, UserModel.is_deleted == False)
            )
            result = await db.execute(stmt)
            user = result.scalars().first()

        if not user:
            return await call_next(request)

        user_perms: set[str] = set()
        for role in (user.roles or []):
            for menu in (role.menus or []):
                if menu.permission:
                    user_perms.add(menu.permission)

        if required_perm not in user_perms:
            return JSONResponse(
                status_code=403,
                content={
                    "code": RET.FORBIDDEN.code,
                    "msg": f"无权访问 (需要权限: {required_perm})",
                    "data": None,
                },
            )

        return await call_next(request)
