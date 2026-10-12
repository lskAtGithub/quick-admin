from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import RET
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.modules.system.menu.crud import MenuCRUD
from app.modules.system.menu.schema import MenuCreateSchema, MenuOutSchema, MenuUpdateSchema


class MenuService:
    def __init__(self, auth: AuthSchema, db: AsyncSession) -> None:
        self.auth = auth
        self.db = db

    async def create(self, data: MenuCreateSchema) -> dict:
        crud = MenuCRUD(self.auth, self.db)
        menu = await crud.create(data.model_dump(exclude_unset=True))
        return self._to_dict(menu)

    async def update(self, menu_id: int, data: MenuUpdateSchema) -> dict:
        crud = MenuCRUD(self.auth, self.db)
        update_data = data.model_dump(exclude_unset=True)
        menu = await crud.update(menu_id, update_data)
        if not menu:
            raise CustomException(msg="菜单不存在", code=RET.NOT_FOUND.code, status_code=404)
        return self._to_dict(menu)

    async def delete(self, menu_id: int) -> None:
        crud = MenuCRUD(self.auth, self.db)
        success = await crud.delete(menu_id)
        if not success:
            raise CustomException(msg="菜单不存在", code=RET.NOT_FOUND.code, status_code=404)

    async def get_tree(self) -> list[dict]:
        crud = MenuCRUD(self.auth, self.db)
        all_menus = await crud.list_all()
        menu_map = {}
        for m in all_menus:
            item = self._to_dict(m)
            item["children"] = []
            menu_map[m.id] = item

        root_menus = []
        for m in all_menus:
            item = menu_map[m.id]
            if m.parent_id and m.parent_id in menu_map:
                menu_map[m.parent_id]["children"].append(item)
            else:
                root_menus.append(item)

        return root_menus

    @staticmethod
    def _to_dict(menu) -> dict:
        return {
            "id": menu.id,
            "name": menu.name,
            "type": menu.type,
            "order": menu.order,
            "permission": menu.permission,
            "icon": menu.icon,
            "route_name": menu.route_name,
            "route_path": menu.route_path,
            "component_path": menu.component_path,
            "redirect": menu.redirect,
            "hidden": menu.hidden,
            "keep_alive": menu.keep_alive,
            "parent_id": menu.parent_id,
            "status": menu.status,
            "parent_name": menu.parent.name if menu.parent else None,
        }
