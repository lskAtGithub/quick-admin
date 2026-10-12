from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import RET
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.modules.system.role.crud import RoleCRUD
from app.modules.system.role.schema import RoleCreateSchema, RoleUpdateSchema


class RoleService:
    def __init__(self, auth: AuthSchema, db: AsyncSession) -> None:
        self.auth = auth
        self.db = db

    async def create(self, data: RoleCreateSchema) -> dict:
        crud = RoleCRUD(self.auth, self.db)
        if await crud.exists(code=data.code):
            raise CustomException(msg="角色编码已存在")
        role = await crud.create(data.model_dump(exclude_unset=True))
        return self._to_dict(role)

    async def update(self, role_id: int, data: RoleUpdateSchema) -> dict:
        crud = RoleCRUD(self.auth, self.db)
        update_data = data.model_dump(exclude_unset=True)
        if "code" in update_data and await crud.exists(code=update_data["code"]):
            raise CustomException(msg="角色编码已存在")
        role = await crud.update(role_id, update_data)
        if not role:
            raise CustomException(msg="角色不存在", code=RET.NOT_FOUND.code, status_code=404)
        return self._to_dict(role)

    async def delete(self, role_id: int) -> None:
        crud = RoleCRUD(self.auth, self.db)
        success = await crud.delete(role_id)
        if not success:
            raise CustomException(msg="角色不存在", code=RET.NOT_FOUND.code, status_code=404)

    @staticmethod
    def _to_dict(role) -> dict:
        return {
            "id": role.id,
            "name": role.name,
            "code": role.code,
            "order": role.order,
            "status": role.status,
            "description": role.description,
            "menu_ids": [m.id for m in role.menus] if role.menus else [],
        }
