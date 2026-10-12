from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import RET
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.modules.system.dict.crud import DictDataCRUD, DictTypeCRUD
from app.modules.system.dict.schema import (
    DictDataCreateSchema,
    DictDataUpdateSchema,
    DictTypeCreateSchema,
    DictTypeUpdateSchema,
)


class DictTypeService:
    def __init__(self, auth: AuthSchema, db: AsyncSession) -> None:
        self.auth = auth
        self.db = db

    async def create(self, data: DictTypeCreateSchema) -> dict:
        crud = DictTypeCRUD(self.auth, self.db)
        if await crud.exists(dict_type=data.dict_type):
            raise CustomException(msg="字典类型已存在")
        obj = await crud.create(data.model_dump(exclude_unset=True))
        return self._to_dict(obj)

    async def update(self, type_id: int, data: DictTypeUpdateSchema) -> dict:
        crud = DictTypeCRUD(self.auth, self.db)
        update_data = data.model_dump(exclude_unset=True)
        if "dict_type" in update_data and await crud.exists(dict_type=update_data["dict_type"]):
            raise CustomException(msg="字典类型已存在")
        obj = await crud.update(type_id, update_data)
        if not obj:
            raise CustomException(msg="字典类型不存在", code=RET.NOT_FOUND.code, status_code=404)
        return self._to_dict(obj)

    async def delete(self, type_id: int) -> None:
        crud = DictTypeCRUD(self.auth, self.db)
        success = await crud.delete(type_id)
        if not success:
            raise CustomException(msg="字典类型不存在", code=RET.NOT_FOUND.code, status_code=404)

    @staticmethod
    def _to_dict(obj) -> dict:
        return {
            "id": obj.id,
            "dict_name": obj.dict_name,
            "dict_type": obj.dict_type,
            "status": obj.status,
            "description": obj.description,
        }


class DictDataService:
    def __init__(self, auth: AuthSchema, db: AsyncSession) -> None:
        self.auth = auth
        self.db = db

    async def create(self, data: DictDataCreateSchema) -> dict:
        crud = DictDataCRUD(self.auth, self.db)
        obj = await crud.create(data.model_dump(exclude_unset=True))
        return self._to_dict(obj)

    async def update(self, data_id: int, data: DictDataUpdateSchema) -> dict:
        crud = DictDataCRUD(self.auth, self.db)
        update_data = data.model_dump(exclude_unset=True)
        obj = await crud.update(data_id, update_data)
        if not obj:
            raise CustomException(msg="字典数据不存在", code=RET.NOT_FOUND.code, status_code=404)
        return self._to_dict(obj)

    async def delete(self, data_id: int) -> None:
        crud = DictDataCRUD(self.auth, self.db)
        success = await crud.delete(data_id)
        if not success:
            raise CustomException(msg="字典数据不存在", code=RET.NOT_FOUND.code, status_code=404)

    async def get_by_type(self, dict_type: str) -> list[dict]:
        crud = DictDataCRUD(self.auth, self.db)
        items = await crud.list_by_type(dict_type)
        return [self._to_dict(item) for item in items]

    @staticmethod
    def _to_dict(obj) -> dict:
        return {
            "id": obj.id,
            "dict_label": obj.dict_label,
            "dict_value": obj.dict_value,
            "dict_sort": obj.dict_sort,
            "status": obj.status,
            "css_class": obj.css_class,
            "list_class": obj.list_class,
            "is_default": obj.is_default,
            "description": obj.description,
            "dict_type": obj.dict_type,
            "dict_type_id": obj.dict_type_id,
        }
