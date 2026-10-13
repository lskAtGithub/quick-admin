from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import RET
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.modules.system.menu.service import MenuService
from app.modules.system.user.crud import UserCRUD
from app.modules.system.user.schema import UserCreateSchema, UserOutSchema, UserUpdateSchema
from app.utils.password_util import PwdUtil


class UserService:
    def __init__(self, auth: AuthSchema, db: AsyncSession) -> None:
        self.auth = auth
        self.db = db

    async def create(self, data: UserCreateSchema) -> dict:
        crud = UserCRUD(self.auth, self.db)
        if await crud.exists(username=data.username):
            raise CustomException(msg="用户名已存在")

        hashed = PwdUtil.hash_password(data.password)
        user = await crud.create({
            "username": data.username,
            "password": hashed,
            "name": data.name,
            "mobile": data.mobile,
            "email": data.email,
            "is_superuser": data.is_superuser,
            "status": data.status,
            "dept_id": data.dept_id,
        })
        return self._to_dict(user)

    async def update(self, user_id: int, data: UserUpdateSchema) -> dict:
        crud = UserCRUD(self.auth, self.db)
        update_data = data.model_dump(exclude_unset=True)
        user = await crud.update(user_id, update_data)
        if not user:
            raise CustomException(msg="用户不存在", code=RET.NOT_FOUND.code, status_code=404)
        return self._to_dict(user)

    async def delete(self, user_id: int) -> None:
        crud = UserCRUD(self.auth, self.db)
        success = await crud.delete(user_id)
        if not success:
            raise CustomException(msg="用户不存在", code=RET.NOT_FOUND.code, status_code=404)

    async def get_user_menus(self, user) -> list[dict]:
        menu_service = MenuService(self.auth, self.db)
        all_menus = await menu_service.get_tree()
        if user.is_superuser:
            return all_menus
        allowed_ids = set()
        for role in (user.roles or []):
            for menu in (role.menus or []):
                allowed_ids.add(menu.id)
        return self._filter_menu_tree(all_menus, allowed_ids)

    def _filter_menu_tree(self, menus: list[dict], allowed_ids: set[int]) -> list[dict]:
        result = []
        for menu in menus:
            children = self._filter_menu_tree(menu.get("children") or [], allowed_ids)
            if menu["id"] in allowed_ids or children:
                item = {**menu, "children": children}
                result.append(item)
        return result

    @staticmethod
    def _to_dict(user) -> dict:
        from datetime import datetime
        from zoneinfo import ZoneInfo
        SHANGHAI_TZ = ZoneInfo("Asia/Shanghai")
        return {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "mobile": user.mobile,
            "email": user.email,
            "avatar": user.avatar,
            "is_superuser": user.is_superuser,
            "status": user.status,
            "dept_id": user.dept_id,
            "dept_name": user.dept.name if user.dept else None,
            "created_time": user.created_time.strftime("%Y-%m-%d %H:%M:%S") if user.created_time else None,
            "updated_time": user.updated_time.strftime("%Y-%m-%d %H:%M:%S") if user.updated_time else None,
        }
