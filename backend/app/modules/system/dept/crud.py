from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.base_schema import AuthSchema
from app.modules.system.dept.model import DeptModel

SHANGHAI_TZ = ZoneInfo("Asia/Shanghai")


class DeptCRUD:
    def __init__(self, auth: AuthSchema, db: AsyncSession) -> None:
        self.auth = auth
        self.db = db

    async def get(self, **kwargs) -> DeptModel | None:
        stmt = select(DeptModel).options(selectinload(DeptModel.parent)).where(DeptModel.is_deleted == False)
        for key, value in kwargs.items():
            if hasattr(DeptModel, key):
                stmt = stmt.where(getattr(DeptModel, key) == value)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_id(self, dept_id: int) -> DeptModel | None:
        return await self.get(id=dept_id)

    async def list(self, page_no: int = 1, page_size: int = 10, **kwargs) -> tuple[list[DeptModel], int]:
        stmt = select(DeptModel).options(selectinload(DeptModel.parent)).where(DeptModel.is_deleted == False)

        for key, value in kwargs.items():
            if value is not None and hasattr(DeptModel, key):
                if key == "name":
                    stmt = stmt.where(DeptModel.name.like(f"%{value}%"))
                else:
                    stmt = stmt.where(getattr(DeptModel, key) == value)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await self.db.execute(count_stmt)).scalar() or 0

        stmt = stmt.order_by(DeptModel.order.asc(), DeptModel.id.asc())
        stmt = stmt.offset((page_no - 1) * page_size).limit(page_size)

        result = await self.db.execute(stmt)
        items = result.scalars().all()
        return list(items), total

    async def list_all(self, **kwargs) -> list[DeptModel]:
        stmt = select(DeptModel).options(selectinload(DeptModel.parent)).where(DeptModel.is_deleted == False)
        for key, value in kwargs.items():
            if value is not None and hasattr(DeptModel, key):
                if key == "name":
                    stmt = stmt.where(DeptModel.name.like(f"%{value}%"))
                else:
                    stmt = stmt.where(getattr(DeptModel, key) == value)
        stmt = stmt.order_by(DeptModel.order.asc(), DeptModel.id.asc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create(self, data: dict) -> DeptModel:
        dept = DeptModel(**data)
        self.db.add(dept)
        await self.db.commit()
        stmt = select(DeptModel).options(selectinload(DeptModel.parent)).where(DeptModel.id == dept.id)
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def update(self, dept_id: int, data: dict) -> DeptModel | None:
        stmt = select(DeptModel).options(selectinload(DeptModel.parent)).where(DeptModel.id == dept_id, DeptModel.is_deleted == False)
        result = await self.db.execute(stmt)
        dept = result.scalar_one_or_none()
        if not dept:
            return None
        for key, value in data.items():
            if value is not None and hasattr(dept, key):
                setattr(dept, key, value)
        dept.updated_time = datetime.now(SHANGHAI_TZ)
        await self.db.commit()
        stmt2 = select(DeptModel).options(selectinload(DeptModel.parent)).where(DeptModel.id == dept.id)
        result2 = await self.db.execute(stmt2)
        return result2.scalar_one()

    async def delete(self, dept_id: int) -> bool:
        dept = await self.get_by_id(dept_id)
        if not dept:
            return False
        dept.is_deleted = True
        await self.db.commit()
        return True

    async def exists(self, **kwargs) -> bool:
        dept = await self.get(**kwargs)
        return dept is not None
