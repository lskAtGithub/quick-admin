from fastapi import APIRouter

from app.modules.system.auth.controller import AuthRouter
from app.modules.system.dept.controller import DeptRouter
from app.modules.system.dict.controller import DictDataRouter, DictTypeRouter
from app.modules.system.menu.controller import MenuRouter
from app.modules.system.param.controller import ParamRouter
from app.modules.system.role.controller import RoleRouter
from app.modules.system.user.controller import UserRouter

DOMAIN_CONTROLLERS: dict[str, list[APIRouter]] = {
    "/system": [
        AuthRouter,
        UserRouter,
        RoleRouter,
        MenuRouter,
        DeptRouter,
        DictTypeRouter,
        DictDataRouter,
        ParamRouter,
    ],
}

api_v1 = APIRouter()
for prefix, controllers in DOMAIN_CONTROLLERS.items():
    router = APIRouter(prefix=prefix)
    for controller in controllers:
        router.include_router(controller)
    api_v1.include_router(router)
