from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.common.response import SuccessResponse

ParamRouter = APIRouter(prefix="/param", tags=["参数管理"])


@ParamRouter.get("/info", summary="获取初始化参数(临时)")
async def get_init_config() -> JSONResponse:
    return SuccessResponse(data=[])
