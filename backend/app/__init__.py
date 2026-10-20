from collections.abc import AsyncGenerator
from typing import Any

from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from fastapi.staticfiles import StaticFiles

from app.config.path_conf import STATIC_DIR
from app.config.setting import settings
from app.core.exceptions import handle_exception
from app.core.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[Any, Any]:
    from app.modules.system.dept.model import DeptModel
    from app.modules.system.dict.model import DictDataModel, DictTypeModel
    from app.modules.system.menu.model import MenuModel
    from app.modules.system.role.model import RoleModel, RoleMenusModel, UserRolesModel
    from app.modules.system.user.model import UserModel
    from app.core.database import create_tables
    await create_tables()
    logger.info("数据库初始化完成")

    from app.scripts.init_data import init_admin_user, init_business_data
    await init_admin_user()
    await init_business_data()

    from app.core.redis_crud import redis_connect
    await redis_connect(app, status=True)
    logger.info("Redis 连接完成")

    logger.info(f"服务启动完成 | http://{settings.SERVER_HOST}:{settings.SERVER_PORT}")
    yield

    await redis_connect(app, status=False)
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

    from app.core.middlewares import CustomCORSMiddleware, CustomGZipMiddleware, PermissionMiddleware
    app.add_middleware(PermissionMiddleware)
    app.add_middleware(CustomGZipMiddleware)
    app.add_middleware(CustomCORSMiddleware)

    from app.api.v1.routers import api_v1
    app.include_router(api_v1, prefix="/api/v1")

    STATIC_DIR.mkdir(parents=True, exist_ok=True)
    app.mount(path=settings.STATIC_URL, app=StaticFiles(directory=STATIC_DIR), name="static")

    return app
