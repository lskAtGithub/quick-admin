from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.base_schema import AuthSchema
from app.modules.system.dict.model import DictDataModel, DictTypeModel

SHANGHAI_TZ = ZoneInfo("Asia/Shanghai")


class DictTypeCRUD:
    def __init__(self, auth: AuthSchema, db: AsyncSession) -> None:
        self.auth = auth
        self.db = db

    async def get(self, **kwargs) -> DictTypeModel | None:
        stmt = select(DictTypeModel).where(DictTypeModel.is_deleted == False)
        for key, value in kwargs.items():
            if hasattr(DictTypeModel, key):
                stmt = stmt.where(getattr(DictTypeModel, key) == value)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_id(self, type_id: int) -> DictTypeModel | None:
        return await self.get(id=type_id)

    async def list(self, page_no: int = 1, page_size: int = 10, **kwargs) -> tuple[list[DictTypeModel], int]:
        stmt = select(DictTypeModel).where(DictTypeModel.is_deleted == False)

        for key, value in kwargs.items():
            if value is not None and hasattr(DictTypeModel, key):
                if key in ("dict_name", "dict_type"):
                    stmt = stmt.where(getattr(DictTypeModel, key).like(f"%{value}%"))
                else:
                    stmt = stmt.where(getattr(DictTypeModel, key) == value)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await self.db.execute(count_stmt)).scalar() or 0

        stmt = stmt.order_by(DictTypeModel.id.asc())
        stmt = stmt.offset((page_no - 1) * page_size).limit(page_size)

        result = await self.db.execute(stmt)
        items = result.scalars().all()
        return list(items), total

    async def create(self, data: dict) -> DictTypeModel:
        obj = DictTypeModel(**data)
        self.db.add(obj)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def update(self, type_id: int, data: dict) -> DictTypeModel | None:
        obj = await self.get_by_id(type_id)
        if not obj:
            return None
        for key, value in data.items():
            if value is not None and hasattr(obj, key):
                setattr(obj, key, value)
        obj.updated_time = datetime.now(SHANGHAI_TZ)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def delete(self, type_id: int) -> bool:
        obj = await self.get_by_id(type_id)
        if not obj:
            return False
        obj.is_deleted = True
        await self.db.commit()
        return True

    async def exists(self, **kwargs) -> bool:
        obj = await self.get(**kwargs)
        return obj is not None


class DictDataCRUD:
    def __init__(self, auth: AuthSchema, db: AsyncSession) -> None:
        self.auth = auth
        self.db = db

    async def get(self, **kwargs) -> DictDataModel | None:
        stmt = select(DictDataModel).where(DictDataModel.is_deleted == False)
        for key, value in kwargs.items():
            if hasattr(DictDataModel, key):
                stmt = stmt.where(getattr(DictDataModel, key) == value)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_id(self, data_id: int) -> DictDataModel | None:
        return await self.get(id=data_id)

    async def list(self, page_no: int = 1, page_size: int = 10, **kwargs) -> tuple[list[DictDataModel], int]:
        stmt = select(DictDataModel).where(DictDataModel.is_deleted == False)

        for key, value in kwargs.items():
            if value is not None and hasattr(DictDataModel, key):
                if key == "dict_label":
                    stmt = stmt.where(DictDataModel.dict_label.like(f"%{value}%"))
                else:
                    stmt = stmt.where(getattr(DictDataModel, key) == value)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await self.db.execute(count_stmt)).scalar() or 0

        stmt = stmt.order_by(DictDataModel.dict_sort.asc(), DictDataModel.id.asc())
        stmt = stmt.offset((page_no - 1) * page_size).limit(page_size)

        result = await self.db.execute(stmt)
        items = result.scalars().all()
        return list(items), total

    async def list_by_type(self, dict_type: str) -> list[DictDataModel]:
        stmt = select(DictDataModel).where(
            DictDataModel.is_deleted == False,
            DictDataModel.dict_type == dict_type,
        ).order_by(DictDataModel.dict_sort.asc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create(self, data: dict) -> DictDataModel:
        obj = DictDataModel(**data)
        self.db.add(obj)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def update(self, data_id: int, data: dict) -> DictDataModel | None:
        obj = await self.get_by_id(data_id)
        if not obj:
            return None
        for key, value in data.items():
            if value is not None and hasattr(obj, key):
                setattr(obj, key, value)
        obj.updated_time = datetime.now(SHANGHAI_TZ)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def delete(self, data_id: int) -> bool:
        obj = await self.get_by_id(data_id)
        if not obj:
            return False
        obj.is_deleted = True
        await self.db.commit()
        return True

    async def exists(self, **kwargs) -> bool:
        obj = await self.get(**kwargs)
        return obj is not None
