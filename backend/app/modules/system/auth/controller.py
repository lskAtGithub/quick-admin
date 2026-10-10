from typing import Annotated

from fastapi import APIRouter, Body, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.response import ErrorResponse, SuccessResponse
from app.core.dependencies import db_getter
from app.core.base_schema import AuthSchema

from .schema import LoginOutSchema, LoginSchema, RegisterSchema
from .service import AuthService

AuthRouter = APIRouter(prefix="/auth", tags=["认证"])


@AuthRouter.post("/login", summary="登录")
async def login(
    db: Annotated[AsyncSession, Depends(db_getter)],
    data: LoginSchema,
) -> JSONResponse:
    auth = AuthSchema()
    result: LoginOutSchema = await AuthService(auth, db).login(username=data.username, password=data.password)
    return SuccessResponse(data=result.model_dump(), msg="登录成功")


@AuthRouter.post("/register", summary="注册")
async def register(
    db: Annotated[AsyncSession, Depends(db_getter)],
    data: RegisterSchema,
) -> JSONResponse:
    auth = AuthSchema()
    result = await AuthService(auth, db).register(username=data.username, password=data.password, name=data.name)
    return SuccessResponse(data=result, msg="注册成功")
