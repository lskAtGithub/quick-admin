import os
from functools import lru_cache
from pathlib import Path
from token import NAME
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.config.path_conf import ENV_DIR


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_DIR / f".env.{os.getenv('ENVIRONMENT', 'dev')}",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True
    )

    # 环境
    ENVIRONMENT: str = "dev"

    # 服务器
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8001
    DEBUG: bool = True

    # JWT
    SECRET_KEY: str = "secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_SECONDS: int = 60 * 60 * 12

    # 数据库
    DATABASE_TYPE: Literal["mysql", "postgres", "sqlite"] = "sqlite"
    DATABASE_HOST: str = "localhost"
    DATABASE_PORT: int = 3306
    DATABASE_USER: str = "root"
    DATABASE_PASSWORD: str = ""
    DATABASE_NAME: str = "quickadmin"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB_NAME: int = 1
    REDIS_PASSWORD: str = ""

    # 日志
    LOGGER_LEVEL: str = "DEBUG"

    @property
    def ASYNC_DB_URI(self) -> str:
        if self.DATABASE_TYPE == "sqlite":
            name = self.DATABASE_NAME if self.DATABASE_NAME.endswith(
                ".db") else f"{self.DATABASE_NAME}.db"
            return f"sqlite+aiosqlite:///{name}"
        elif self.DATABASE_TYPE == "mysql":
            return f"mysql+aiomysql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}?charset=utf8mb4"
        else:
            return f"postgresql+asyncpg://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"

    @property
    def REDIS_URI(self) -> str:
        auth = f":{self.REDIS_PASSWORD}@" if self.REDIS_PASSWORD else ""
        return f"redis://{auth}{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB_NAME}"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
