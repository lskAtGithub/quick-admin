from fastapi import APIRouter

api_v1 = APIRouter()

# 后续业务模块的 router 在这里注册，例如：
# from app.modules.system.auth.controller import AuthRouter
# api_v1.include_router(AuthRouter)
