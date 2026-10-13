from typing import Annotated, Literal

from fastapi import APIRouter, File, Query, Request, UploadFile
from fastapi.responses import JSONResponse

from app.common.response import SuccessResponse

from .service import FileService

FileRouter = APIRouter(prefix="/file", tags=["文件管理"])


@FileRouter.post(
    "/upload",
    summary="上传文件",
)
async def upload_controller(
    request: Request,
    file: Annotated[UploadFile, File(description="上传文件")],
    upload_type: Annotated[
        Literal["file", "avatar", "param"] | None,
        Query(description="上传类型: file=通用文件, avatar=头像, param=参数配置"),
    ] = "file",
) -> JSONResponse:
    result = await FileService.upload_service(
        base_url=str(request.base_url),
        file=file,
        upload_type=upload_type or "file",
    )
    return SuccessResponse(data=result, msg="上传文件成功")
