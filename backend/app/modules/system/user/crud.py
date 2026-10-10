from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.base_schema import AuthSchema
from app.modules.system.user.model import UserModel


class UserCRUD:
    def __init__(self, auth: AuthSchema, db: AsyncSession) -> None:
        self.auth = auth
        self.db = db

    async def get(self, **kwargs) -> UserModel | None:
        """按字段查询单个用户"""
        stmt = select(UserModel).where(UserModel.is_deleted == False)
        for key, value in kwargs.items():
            if hasattr(UserModel, key):
                stmt = stmt.where(getattr(UserModel, key) == value)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def create(self, data: dict) -> UserModel:
        user = UserModel(**data)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def exists(self, **kwargs) -> bool:
        """检查用户是否存在"""
        user = await self.get(**kwargs)
        return user is not None
