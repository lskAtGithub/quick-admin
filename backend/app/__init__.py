from collections.abc import AsyncGenerator
from typing import Any

from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager

from app.config.setting import settings
from app.core.exceptions import handle_exception
from app.core.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[Any, Any]:
    from app.core.database import create_tables
    await create_tables()
    logger.info("数据库初始化完成")

    logger.info(f"服务启动完成 | http://{settings.SERVER_HOST}:{settings.SERVER_PORT}")
    yield

    from app.core.database import async_engine
    await async_engine.dispose()
    logger.info("数据库连接已关闭")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Quick Admin",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    handle_exception(app)

    from app.core.middlewares import CustomCORSMiddleware, CustomGZipMiddleware
    app.add_middleware(CustomGZipMiddleware)
    app.add_middleware(CustomCORSMiddleware)

    from app.api.v1.routers import api_v1
    app.include_router(api_v1, prefix="/api/v1")

    return app
