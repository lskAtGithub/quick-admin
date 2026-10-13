from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.base_schema import AuthSchema
from app.modules.system.menu.model import MenuModel
from app.modules.system.role.model import RoleMenusModel, RoleModel

SHANGHAI_TZ = ZoneInfo("Asia/Shanghai")


class RoleCRUD:
    def __init__(self, auth: AuthSchema, db: AsyncSession) -> None:
        self.auth = auth
        self.db = db

    async def get(self, **kwargs) -> RoleModel | None:
        stmt = select(RoleModel).options(selectinload(RoleModel.menus)).where(RoleModel.is_deleted == False)
        for key, value in kwargs.items():
            if hasattr(RoleModel, key):
                stmt = stmt.where(getattr(RoleModel, key) == value)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_id(self, role_id: int) -> RoleModel | None:
        stmt = select(RoleModel).where(RoleModel.id == role_id, RoleModel.is_deleted == False)
        stmt = stmt.options(selectinload(RoleModel.menus))
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def list(self, page_no: int = 1, page_size: int = 10, **kwargs) -> tuple[list[RoleModel], int]:
        stmt = select(RoleModel).where(RoleModel.is_deleted == False)

        for key, value in kwargs.items():
            if value is not None and hasattr(RoleModel, key):
                if key == "name":
                    stmt = stmt.where(RoleModel.name.like(f"%{value}%"))
                else:
                    stmt = stmt.where(getattr(RoleModel, key) == value)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await self.db.execute(count_stmt)).scalar() or 0

        stmt = stmt.order_by(RoleModel.order.asc(), RoleModel.id.asc())
        stmt = stmt.options(selectinload(RoleModel.menus))
        stmt = stmt.offset((page_no - 1) * page_size).limit(page_size)

        result = await self.db.execute(stmt)
        items = result.scalars().all()
        return list(items), total

    async def create(self, data: dict) -> RoleModel:
        menu_ids = data.pop("menu_ids", [])
        role = RoleModel(**data)
        if menu_ids:
            stmt = select(MenuModel).where(MenuModel.id.in_(menu_ids))
            result = await self.db.execute(stmt)
            role.menus = list(result.scalars().all())
        self.db.add(role)
        await self.db.commit()
        stmt = select(RoleModel).options(selectinload(RoleModel.menus)).where(RoleModel.id == role.id)
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def update(self, role_id: int, data: dict) -> RoleModel | None:
        role = await self.get_by_id(role_id)
        if not role:
            return None
        menu_ids = data.pop("menu_ids", None)
        for key, value in data.items():
            if value is not None and hasattr(role, key):
                setattr(role, key, value)
        if menu_ids is not None:
            stmt = select(MenuModel).where(MenuModel.id.in_(menu_ids))
            result = await self.db.execute(stmt)
            role.menus = list(result.scalars().all())
        role.updated_time = datetime.now(SHANGHAI_TZ)
        await self.db.commit()
        stmt = select(RoleModel).options(selectinload(RoleModel.menus)).where(RoleModel.id == role.id)
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def delete(self, role_id: int) -> bool:
        role = await self.get(role_id=role_id)
        if not role:
            return False
        role.is_deleted = True
        await self.db.commit()
        return True

    async def exists(self, **kwargs) -> bool:
        role = await self.get(**kwargs)
        return role is not None
