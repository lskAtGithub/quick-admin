import json
import time
import uuid
from datetime import datetime, timedelta

from fastapi import Request
from redis.asyncio.client import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import RedisInitKeyConfig, RET
from app.config.setting import settings
from app.core.base_schema import AuthSchema, JWTPayloadSchema
from app.core.exceptions import CustomException
from app.core.logger import logger
from app.core.redis_crud import RedisCURD
from app.core.security import create_access_token, decode_access_token
from app.modules.system.user.crud import UserCRUD
from app.utils.password_util import PwdUtil

from .schema import CaptchaOutSchema, LoginOutSchema


class AuthService:
    ACCESS_EXPIRE_HOURS = 12
    REFRESH_EXPIRE_HOURS = 24

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

    async def _create_token(self, user, redis: Redis, session_id: str | None = None) -> LoginOutSchema:
        session_id = session_id or str(uuid.uuid4())
        access_expires = timedelta(hours=self.ACCESS_EXPIRE_HOURS)
        refresh_expires = timedelta(hours=self.REFRESH_EXPIRE_HOURS)
        now = datetime.now()

        session_data = {
            "session_id": session_id,
            "user_id": user.id,
            "username": user.username,
            "name": user.name,
            "is_superuser": user.is_superuser,
            "created_at": now.isoformat(),
        }

        session_key = f"{RedisInitKeyConfig.USER_SESSION.key}:{session_id}"
        await RedisCURD(redis).set(
            key=session_key,
            value=json.dumps(session_data),
            expire=int(refresh_expires.total_seconds()),
        )

        access_token = create_access_token(
            JWTPayloadSchema(sub=session_id, is_refresh=False, exp=int((now + access_expires).timestamp()))
        )
        refresh_token = create_access_token(
            JWTPayloadSchema(sub=session_id, is_refresh=True, exp=int((now + refresh_expires).timestamp()))
        )

        crud = RedisCURD(redis)
        await crud.set(
            key=f"{RedisInitKeyConfig.ACCESS_TOKEN.key}:{session_id}",
            value=access_token,
            expire=int(access_expires.total_seconds()),
        )
        await crud.set(
            key=f"{RedisInitKeyConfig.REFRESH_TOKEN.key}:{session_id}",
            value=refresh_token,
            expire=int(refresh_expires.total_seconds()),
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

    async def refresh_token(self, refresh_token: str, redis: Redis) -> LoginOutSchema:
        payload = decode_access_token(refresh_token)
        if not payload.is_refresh:
            raise CustomException(msg="非法凭证，请传入刷新令牌")

        session_id = payload.sub
        crud = RedisCURD(redis)
        session_key = f"{RedisInitKeyConfig.USER_SESSION.key}:{session_id}"
        refresh_key = f"{RedisInitKeyConfig.REFRESH_TOKEN.key}:{session_id}"

        session_info = await crud.get(session_key)
        if not session_info:
            raise CustomException(msg="会话已过期，请重新登录")

        # 轮换校验：与当前会话存储的 refresh token 不一致视为重放，撤销整个会话
        stored_refresh = await crud.get(refresh_key)
        if isinstance(stored_refresh, bytes):
            stored_refresh = stored_refresh.decode()
        if not stored_refresh or stored_refresh != refresh_token:
            await crud.delete(
                session_key,
                refresh_key,
                f"{RedisInitKeyConfig.ACCESS_TOKEN.key}:{session_id}",
            )
            logger.warning(f"检测到疑似 refresh token 重放，已撤销会话: {session_id}")
            raise CustomException(msg="刷新凭证已失效，请重新登录")

        user_id = json.loads(session_info).get("user_id")
        user = await UserCRUD(self.auth, self.db).get(id=user_id)
        if not user:
            raise CustomException(msg="刷新token失败，用户不存在")
        if user.status == 1:
            raise CustomException(msg="用户已被停用")

        await crud.expire(session_key, int(timedelta(hours=self.REFRESH_EXPIRE_HOURS).total_seconds()))
        return await self._create_token(user, redis, session_id=session_id)

    @staticmethod
    async def logout(redis: Redis, token: str) -> bool:
        payload = decode_access_token(token)
        session_id = payload.sub
        if not session_id:
            raise CustomException(msg="无效令牌")

        await RedisCURD(redis).delete(f"{RedisInitKeyConfig.USER_SESSION.key}:{session_id}")
        return True


class CaptchaService:
    PENDING = "pending"
    VERIFIED = "verified"

    @staticmethod
    def _redis_key(captcha_key: str) -> str:
        return f"{RedisInitKeyConfig.CAPTCHA_CODES.key}:{captcha_key}"

    @staticmethod
    async def get_captcha(redis: Redis, request: Request) -> CaptchaOutSchema:
        captcha_key = uuid.uuid4().hex
        await RedisCURD(redis).set(
            key=CaptchaService._redis_key(captcha_key),
            value=json.dumps({"status": CaptchaService.PENDING, "issued_at": time.time()}),
            expire=settings.CAPTCHA_EXPIRE_SECONDS,
        )
        return CaptchaOutSchema(enable=settings.CAPTCHA_ENABLE, key=captcha_key, img_base="")

    @staticmethod
    async def slider_complete(redis: Redis, request: Request, captcha_key: str) -> dict:
        if not captcha_key:
            raise CustomException(msg="验证码标识不能为空")
        raw = await RedisCURD(redis).get(CaptchaService._redis_key(captcha_key))
        if not raw:
            raise CustomException(msg="验证码已过期，请刷新")
        if isinstance(raw, bytes):
            raw = raw.decode()
        state = json.loads(raw)
        if state.get("status") == CaptchaService.VERIFIED:
            raise CustomException(msg="验证码已使用")
        if state.get("status") != CaptchaService.PENDING:
            raise CustomException(msg="验证码状态异常，请刷新重试")
        await RedisCURD(redis).set(
            key=CaptchaService._redis_key(captcha_key),
            value=json.dumps({"status": CaptchaService.VERIFIED, "issued_at": state.get("issued_at")}),
            expire=settings.CAPTCHA_EXPIRE_SECONDS,
        )
        return {"captcha_key": captcha_key, "verified": True}
