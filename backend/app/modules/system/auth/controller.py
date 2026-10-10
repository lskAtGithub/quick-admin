from typing import Annotated

from fastapi import APIRouter, Body, Depends
from fastapi.responses import JSONResponse
from redis.asyncio.client import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.response import SuccessResponse
from app.core.base_schema import AuthSchema
from app.core.dependencies import db_getter, get_current_user, redis_getter

from .schema import LoginOutSchema, LoginSchema, RegisterSchema
from .service import AuthService

AuthRouter = APIRouter(prefix="/auth", tags=["认证"])


@AuthRouter.post("/login", summary="登录")
async def login(
    db: Annotated[AsyncSession, Depends(db_getter)],
    redis: Annotated[Redis, Depends(redis_getter)],
    data: LoginSchema,
) -> JSONResponse:
    auth = AuthSchema()
    result: LoginOutSchema = await AuthService(auth, db).login(username=data.username, password=data.password, redis=redis)
    return SuccessResponse(data=result.model_dump(), msg="登录成功")


@AuthRouter.post("/register", summary="注册")
async def register(
    db: Annotated[AsyncSession, Depends(db_getter)],
    data: RegisterSchema,
) -> JSONResponse:
    auth = AuthSchema()
    result = await AuthService(auth, db).register(username=data.username, password=data.password, name=data.name)
    return SuccessResponse(data=result, msg="注册成功")


@AuthRouter.post("/logout", summary="退出登录")
async def logout(
    redis: Annotated[Redis, Depends(redis_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
    token: Annotated[str, Body(embed=True)],
) -> JSONResponse:
    await AuthService.logout(redis=redis, token=token)
    return SuccessResponse(msg="退出成功")
