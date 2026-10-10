from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.base_schema import AuthSchema
from app.modules.system.user.model import UserModel

SHANGHAI_TZ = ZoneInfo("Asia/Shanghai")


class UserCRUD:
    def __init__(self, auth: AuthSchema, db: AsyncSession) -> None:
        self.auth = auth
        self.db = db

    async def get(self, **kwargs) -> UserModel | None:
        stmt = select(UserModel).where(UserModel.is_deleted == False)
        for key, value in kwargs.items():
            if hasattr(UserModel, key):
                stmt = stmt.where(getattr(UserModel, key) == value)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_id(self, user_id: int) -> UserModel | None:
        return await self.get(id=user_id)

    async def list(self, page_no: int = 1, page_size: int = 10, **kwargs) -> tuple[list[UserModel], int]:
        stmt = select(UserModel).where(UserModel.is_deleted == False)

        for key, value in kwargs.items():
            if value is not None and hasattr(UserModel, key):
                if key in ("username", "name"):
                    stmt = stmt.where(getattr(UserModel, key).like(f"%{value}%"))
                else:
                    stmt = stmt.where(getattr(UserModel, key) == value)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await self.db.execute(count_stmt)).scalar() or 0

        stmt = stmt.order_by(UserModel.id.desc())
        stmt = stmt.offset((page_no - 1) * page_size).limit(page_size)

        result = await self.db.execute(stmt)
        items = result.scalars().all()
        return list(items), total

    async def create(self, data: dict) -> UserModel:
        user = UserModel(**data)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update(self, user_id: int, data: dict) -> UserModel | None:
        user = await self.get_by_id(user_id)
        if not user:
            return None
        for key, value in data.items():
            if value is not None and hasattr(user, key):
                setattr(user, key, value)
        user.updated_time = datetime.now(SHANGHAI_TZ)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def delete(self, user_id: int) -> bool:
        user = await self.get_by_id(user_id)
        if not user:
            return False
        user.is_deleted = True
        await self.db.commit()
        return True

    async def exists(self, **kwargs) -> bool:
        user = await self.get(**kwargs)
        return user is not None
