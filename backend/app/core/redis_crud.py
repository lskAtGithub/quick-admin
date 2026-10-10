from typing import Any

from fastapi import FastAPI
from redis.asyncio import Redis

from app.config.setting import settings
from app.core.logger import logger


async def redis_connect(app: FastAPI, status: bool) -> Redis | None:
    """创建或关闭 Redis 连接"""
    if status:
        rd = await Redis.from_url(
            url=settings.REDIS_URI,
            encoding="utf-8",
            decode_responses=True,
            protocol=2,
        )
        app.state.redis = rd
        if await rd.ping():
            logger.info("Redis 连接成功")
            return rd
        raise ConnectionError("Redis ping 失败")
    else:
        await app.state.redis.close()


class RedisCURD:
    """Redis 操作封装"""

    def __init__(self, redis: Redis) -> None:
        self.redis = redis

    async def get(self, key: str) -> Any:
        return await self.redis.get(key)

    async def set(self, key: str, value: Any, expire: int | None = None) -> bool:
        if expire:
            await self.redis.set(name=key, value=value, ex=expire)
        else:
            await self.redis.set(name=key, value=value)
        return True

    async def delete(self, *keys: str) -> bool:
        await self.redis.delete(*keys)
        return True

    async def ttl(self, key: str) -> int:
        return await self.redis.ttl(key)

    async def expire(self, key: str, expire: int) -> bool:
        return bool(await self.redis.expire(name=key, time=expire))
