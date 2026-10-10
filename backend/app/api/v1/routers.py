from fastapi import APIRouter

from app.modules.system.auth.controller import AuthRouter

api_v1 = APIRouter()
api_v1.include_router(AuthRouter)
