from typing import Annotated

from fastapi import APIRouter, Body, Depends, Request
from fastapi.responses import JSONResponse
from redis.asyncio.client import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.response import SuccessResponse
from app.core.base_schema import AuthSchema
from app.core.dependencies import db_getter, get_current_user, redis_getter

from .schema import CaptchaOutSchema, LoginOutSchema, LoginSchema, RegisterSchema
from .service import AuthService, CaptchaService

AuthRouter = APIRouter(prefix="/auth", tags=["认证"])


@AuthRouter.get("/captcha/get", summary="获取验证码")
async def get_captcha(
    request: Request,
    redis: Annotated[Redis, Depends(redis_getter)],
) -> JSONResponse:
    result: CaptchaOutSchema = await CaptchaService.get_captcha(redis=redis, request=request)
    return SuccessResponse(data=result.model_dump(), msg="获取验证码成功")


@AuthRouter.post("/captcha/slider/complete", summary="滑块验证完成")
async def slider_complete(
    request: Request,
    redis: Annotated[Redis, Depends(redis_getter)],
    data: dict,
) -> JSONResponse:
    captcha_key = data.get("captcha_key", "")
    result = await CaptchaService.slider_complete(redis=redis, request=request, captcha_key=captcha_key)
    return SuccessResponse(data=result, msg="验证成功")


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


@AuthRouter.post("/token/refresh", summary="刷新token")
async def refresh_token(
    db: Annotated[AsyncSession, Depends(db_getter)],
    redis: Annotated[Redis, Depends(redis_getter)],
    payload: Annotated[str, Body(description="刷新token参数")],
) -> JSONResponse:
    auth = AuthSchema()
    result = await AuthService(auth, db).refresh_token(refresh_token=payload, redis=redis)
    return SuccessResponse(data=result.model_dump(), msg="刷新成功")


@AuthRouter.post("/logout", summary="退出登录")
async def logout(
    request: Request,
    redis: Annotated[Redis, Depends(redis_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    await AuthService.logout(redis=redis, token=token)
    return SuccessResponse(msg="退出成功")
