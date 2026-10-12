from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import RET
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.modules.system.dept.crud import DeptCRUD
from app.modules.system.dept.schema import DeptCreateSchema, DeptUpdateSchema


class DeptService:
    def __init__(self, auth: AuthSchema, db: AsyncSession) -> None:
        self.auth = auth
        self.db = db

    async def create(self, data: DeptCreateSchema) -> dict:
        crud = DeptCRUD(self.auth, self.db)
        if await crud.exists(code=data.code):
            raise CustomException(msg="部门编码已存在")
        dept = await crud.create(data.model_dump(exclude_unset=True))
        return self._to_dict(dept)

    async def update(self, dept_id: int, data: DeptUpdateSchema) -> dict:
        crud = DeptCRUD(self.auth, self.db)
        update_data = data.model_dump(exclude_unset=True)
        if "code" in update_data and await crud.exists(code=update_data["code"]):
            raise CustomException(msg="部门编码已存在")
        dept = await crud.update(dept_id, update_data)
        if not dept:
            raise CustomException(msg="部门不存在", code=RET.NOT_FOUND.code, status_code=404)
        return self._to_dict(dept)

    async def delete(self, dept_id: int) -> None:
        crud = DeptCRUD(self.auth, self.db)
        success = await crud.delete(dept_id)
        if not success:
            raise CustomException(msg="部门不存在", code=RET.NOT_FOUND.code, status_code=404)

    async def get_tree(self) -> list[dict]:
        crud = DeptCRUD(self.auth, self.db)
        all_depts = await crud.list_all()
        dept_map = {}
        for d in all_depts:
            item = self._to_dict(d)
            item["children"] = []
            dept_map[d.id] = item

        root_depts = []
        for d in all_depts:
            item = dept_map[d.id]
            if d.parent_id and d.parent_id in dept_map:
                dept_map[d.parent_id]["children"].append(item)
            else:
                root_depts.append(item)

        return root_depts

    @staticmethod
    def _to_dict(dept) -> dict:
        return {
            "id": dept.id,
            "name": dept.name,
            "code": dept.code,
            "order": dept.order,
            "status": dept.status,
            "description": dept.description,
            "parent_id": dept.parent_id,
            "parent_name": dept.parent.name if dept.parent else None,
        }
