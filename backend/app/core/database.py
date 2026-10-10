from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config.setting import settings
from app.core.logger import logger

async_engine = create_async_engine(
    url=settings.ASYNC_DB_URI,
    echo=settings.DEBUG,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=3600,
    connect_args={"connect_timeout": 10},
)

async_db_session = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def create_tables() -> None:
    """根据 ORM 模型创建所有表"""
    from app.core.base_model import MappedBase
    async with async_engine.begin() as conn:
        await conn.run_sync(MappedBase.metadata.create_all)
    logger.info("数据库表初始化完成")
