from sqlalchemy.ext.asyncio import AsyncSession

from app.common.enums import RET
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
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
        })
        return UserOutSchema.model_validate(user).model_dump()

    async def update(self, user_id: int, data: UserUpdateSchema) -> dict:
        crud = UserCRUD(self.auth, self.db)
        update_data = data.model_dump(exclude_unset=True)
        user = await crud.update(user_id, update_data)
        if not user:
            raise CustomException(msg="用户不存在", code=RET.NOT_FOUND.code, status_code=404)
        return UserOutSchema.model_validate(user).model_dump()

    async def delete(self, user_id: int) -> None:
        crud = UserCRUD(self.auth, self.db)
        success = await crud.delete(user_id)
        if not success:
            raise CustomException(msg="用户不存在", code=RET.NOT_FOUND.code, status_code=404)
