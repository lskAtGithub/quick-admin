from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.base_schema import AuthSchema
from app.modules.system.menu.model import MenuModel

SHANGHAI_TZ = ZoneInfo("Asia/Shanghai")


class MenuCRUD:
    def __init__(self, auth: AuthSchema, db: AsyncSession) -> None:
        self.auth = auth
        self.db = db

    async def get(self, **kwargs) -> MenuModel | None:
        stmt = select(MenuModel).options(selectinload(MenuModel.parent)).where(MenuModel.is_deleted == False)
        for key, value in kwargs.items():
            if hasattr(MenuModel, key):
                stmt = stmt.where(getattr(MenuModel, key) == value)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_id(self, menu_id: int) -> MenuModel | None:
        return await self.get(id=menu_id)

    async def list(self, page_no: int = 1, page_size: int = 10, **kwargs) -> tuple[list[MenuModel], int]:
        stmt = select(MenuModel).options(selectinload(MenuModel.parent)).where(MenuModel.is_deleted == False)

        for key, value in kwargs.items():
            if value is not None and hasattr(MenuModel, key):
                if key == "name":
                    stmt = stmt.where(MenuModel.name.like(f"%{value}%"))
                else:
                    stmt = stmt.where(getattr(MenuModel, key) == value)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await self.db.execute(count_stmt)).scalar() or 0

        stmt = stmt.order_by(MenuModel.order.asc(), MenuModel.id.asc())
        stmt = stmt.offset((page_no - 1) * page_size).limit(page_size)

        result = await self.db.execute(stmt)
        items = result.scalars().all()
        return list(items), total

    async def list_all(self, **kwargs) -> list[MenuModel]:
        stmt = select(MenuModel).options(selectinload(MenuModel.parent)).where(MenuModel.is_deleted == False)
        for key, value in kwargs.items():
            if value is not None and hasattr(MenuModel, key):
                if key == "name":
                    stmt = stmt.where(MenuModel.name.like(f"%{value}%"))
                else:
                    stmt = stmt.where(getattr(MenuModel, key) == value)
        stmt = stmt.order_by(MenuModel.order.asc(), MenuModel.id.asc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create(self, data: dict) -> MenuModel:
        menu = MenuModel(**data)
        self.db.add(menu)
        await self.db.commit()
        await self.db.refresh(menu)
        stmt = select(MenuModel).options(selectinload(MenuModel.parent)).where(MenuModel.id == menu.id)
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def update(self, menu_id: int, data: dict) -> MenuModel | None:
        stmt = select(MenuModel).options(selectinload(MenuModel.parent)).where(MenuModel.id == menu_id, MenuModel.is_deleted == False)
        result = await self.db.execute(stmt)
        menu = result.scalar_one_or_none()
        if not menu:
            return None
        for key, value in data.items():
            if value is not None and hasattr(menu, key):
                setattr(menu, key, value)
        menu.updated_time = datetime.now(SHANGHAI_TZ)
        await self.db.commit()
        await self.db.refresh(menu)
        stmt2 = select(MenuModel).options(selectinload(MenuModel.parent)).where(MenuModel.id == menu.id)
        result2 = await self.db.execute(stmt2)
        return result2.scalar_one()

    async def delete(self, menu_id: int) -> bool:
        menu = await self.get_by_id(menu_id)
        if not menu:
            return False
        menu.is_deleted = True
        await self.db.commit()
        return True

    async def exists(self, **kwargs) -> bool:
        menu = await self.get(**kwargs)
        return menu is not None
