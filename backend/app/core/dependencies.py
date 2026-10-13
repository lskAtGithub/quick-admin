import json
from collections.abc import AsyncGenerator

from fastapi import Depends, Request
from redis.asyncio.client import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.common.enums import RET, RedisInitKeyConfig
from app.core.base_schema import AuthSchema, CoreUserSchema, JWTPayloadSchema
from app.core.database import async_db_session
from app.core.exceptions import CustomException
from app.core.redis_crud import RedisCURD
from app.core.security import OAuth2Schema, decode_access_token


async def db_getter() -> AsyncGenerator[AsyncSession, None]:
    async with async_db_session() as session:
        yield session


async def redis_getter(request: Request) -> Redis:
    return request.app.state.redis


async def get_current_user(
    token: str = Depends(OAuth2Schema),
    redis: Redis = Depends(redis_getter),
    db: AsyncSession = Depends(db_getter),
) -> AuthSchema:
    payload = decode_access_token(token)
    if not payload or not payload.sub:
        raise CustomException(msg="认证已失效", code=RET.UNAUTHORIZED.code, status_code=401)

    session_id = payload.sub
    session_key = f"{RedisInitKeyConfig.USER_SESSION.key}:{session_id}"
    raw = await RedisCURD(redis).get(session_key)

    if not raw:
        raise CustomException(msg="会话已过期,请重新登录", code=RET.TOKEN_EXPIRE.code, status_code=401)

    session_data = json.loads(raw)

    user = CoreUserSchema(
        id=session_data.get("user_id", 0),
        username=session_data.get("username"),
        name=session_data.get("name"),
        is_superuser=session_data.get("is_superuser", False),
    )

    permissions: list[str] = []
    if user.is_superuser:
        permissions = ["*"]
    else:
        from app.modules.system.user.model import UserModel
        from app.modules.system.role.model import RoleModel
        from app.modules.system.menu.model import MenuModel

        stmt = (
            select(UserModel)
            .options(
                selectinload(UserModel.roles).selectinload(RoleModel.menus)
            )
            .where(UserModel.id == user.id, UserModel.is_deleted == False)
        )
        result = await db.execute(stmt)
        db_user = result.scalars().first()
        if db_user:
            perm_set: set[str] = set()
            for role in (db_user.roles or []):
                for menu in (role.menus or []):
                    if menu.permission:
                        perm_set.add(menu.permission)
            permissions = list(perm_set)

    return AuthSchema(user=user, permissions=permissions)
