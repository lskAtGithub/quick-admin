from sqlalchemy import select

from app.core.database import async_db_session
from app.core.logger import logger
from app.modules.system.user.model import UserModel
from app.utils.password_util import PwdUtil

# 默认超级管理员（仅用于首次初始化，上线后应尽快改密）
DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_PASSWORD = "admin"


async def init_admin_user() -> None:
    """若不存在任何超级管理员，则创建默认 admin/admin 账号。幂等。"""
    async with async_db_session() as session:
        stmt = select(UserModel).where(UserModel.username == DEFAULT_ADMIN_USERNAME)
        exists = (await session.execute(stmt)).scalars().first()
        if exists:
            return

        admin = UserModel(
            username=DEFAULT_ADMIN_USERNAME,
            password=PwdUtil.hash_password(DEFAULT_ADMIN_PASSWORD),
            name="超级管理员",
            is_superuser=True,
            status=0,
            gender="1",
        )
        session.add(admin)
        await session.commit()
        logger.warning(
            f"已初始化默认超级管理员账号：{DEFAULT_ADMIN_USERNAME}/{DEFAULT_ADMIN_PASSWORD}（请尽快修改密码）"
        )
