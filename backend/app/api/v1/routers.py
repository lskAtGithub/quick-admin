from fastapi import APIRouter

from app.modules.system.auth.controller import AuthRouter
from app.modules.system.dept.controller import DeptRouter
from app.modules.system.dict.controller import DictDataRouter, DictTypeRouter
from app.modules.system.menu.controller import MenuRouter
from app.modules.system.role.controller import RoleRouter
from app.modules.system.user.controller import UserRouter

api_v1 = APIRouter()
api_v1.include_router(AuthRouter)
api_v1.include_router(UserRouter)
api_v1.include_router(MenuRouter)
api_v1.include_router(DeptRouter)
api_v1.include_router(RoleRouter)
api_v1.include_router(DictTypeRouter)
api_v1.include_router(DictDataRouter)
