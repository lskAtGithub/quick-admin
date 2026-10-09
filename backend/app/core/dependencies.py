from collections.abc import AsyncGenerator

from fastapi import Depends, Request
from redis.asyncio.client import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_db_session
from app.core.security import OAuth2Schema, decode_access_token
from app.core.base_schema import AuthSchema, CoreUserSchema
from app.core.exceptions import CustomException
from app.common.enums import RET


async def db_getter() -> AsyncGenerator[AsyncSession, None]:
    """请求级数据库会话 — 一个请求共享一个事务"""
    async with async_db_session() as session:
        yield session


async def redis_getter(request: Request) -> Redis:
    """从 app.state 获取 Redis 连接"""
    return request.app.state.redis


async def get_current_user(
    token: str = Depends(OAuth2Schema),
) -> AuthSchema:
    """从 JWT 解析当前用户 — 目前只做 token 解析，后续接入 Redis 会话校验"""
    payload = decode_access_token(token)
    if not payload or not payload.sub:
        raise CustomException(
            msg="认证已失效", code=RET.UNAUTHORIZED.code, status_code=401)
    # 目前先返回一个空的 AuthSchema，后续接入 Redis session 后补全用户信息
    return AuthSchema()
