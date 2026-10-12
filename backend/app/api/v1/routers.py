from fastapi import APIRouter

from app.modules.system.auth.controller import AuthRouter
from app.modules.system.dept.controller import DeptRouter
from app.modules.system.menu.controller import MenuRouter
from app.modules.system.user.controller import UserRouter

api_v1 = APIRouter()
api_v1.include_router(AuthRouter)
api_v1.include_router(UserRouter)
api_v1.include_router(MenuRouter)
api_v1.include_router(DeptRouter)
