import json
import uuid
from datetime import datetime, timedelta

from redis.asyncio.client import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import RedisInitKeyConfig, RET
from app.core.base_schema import AuthSchema, JWTPayloadSchema
from app.core.exceptions import CustomException
from app.core.redis_crud import RedisCURD
from app.core.security import create_access_token, decode_access_token
from app.modules.system.user.crud import UserCRUD
from app.utils.password_util import PwdUtil

from .schema import LoginOutSchema


class AuthService:
    def __init__(self, auth: AuthSchema, db: AsyncSession) -> None:
        self.auth = auth
        self.db = db

    async def login(self, username: str, password: str, redis: Redis) -> LoginOutSchema:
        user = await UserCRUD(self.auth, self.db).get(username=username)
        if not user:
            raise CustomException(msg="用户不存在", status_code=401)

        if not PwdUtil.verify_password(password, user.password):
            raise CustomException(msg="密码错误", status_code=401)

        if user.status == 1:
            raise CustomException(msg="用户已被停用", status_code=403)

        return await self._create_token(user, redis)

    async def register(self, username: str, password: str, name: str | None = None) -> dict:
        crud = UserCRUD(self.auth, self.db)
        if await crud.exists(username=username):
            raise CustomException(msg="用户名已存在")

        hashed = PwdUtil.hash_password(password)
        user = await crud.create({
            "username": username,
            "password": hashed,
            "name": name or username,
        })
        return {"id": user.id, "username": user.username, "name": user.name}

    async def _create_token(self, user, redis: Redis) -> LoginOutSchema:
        session_id = str(uuid.uuid4())
        access_expires = timedelta(hours=12)
        refresh_expires = timedelta(hours=24)
        now = datetime.now()

        session_data = {
            "session_id": session_id,
            "user_id": user.id,
            "username": user.username,
            "name": user.name,
            "is_superuser": user.is_superuser,
            "created_at": now.isoformat(),
        }

        await RedisCURD(redis).set(
            key=f"{RedisInitKeyConfig.USER_SESSION.key}:{session_id}",
            value=json.dumps(session_data),
            expire=int(refresh_expires.total_seconds()),
        )

        access_token = create_access_token(
            JWTPayloadSchema(sub=session_id, is_refresh=False, exp=int((now + access_expires).timestamp()))
        )
        refresh_token = create_access_token(
            JWTPayloadSchema(sub=session_id, is_refresh=True, exp=int((now + refresh_expires).timestamp()))
        )

        user_info = {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "is_superuser": user.is_superuser,
        }

        return LoginOutSchema(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=int(access_expires.total_seconds()),
            user_info=user_info,
        )

    @staticmethod
    async def logout(redis: Redis, token: str) -> bool:
        payload = decode_access_token(token)
        session_id = payload.sub
        if not session_id:
            raise CustomException(msg="无效令牌")

        await RedisCURD(redis).delete(f"{RedisInitKeyConfig.USER_SESSION.key}:{session_id}")
        return True
