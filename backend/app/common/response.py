from typing import Any

from fastapi import status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.common.enums import RET


class ResponseSchema(BaseModel):
    code: int = Field(default=RET.OK.code, description="业务状态码")
    msg: str = Field(default=RET.OK.msg, description="响应消息")
    data: Any | None = Field(default=None, description="响应数据")
    success: bool = Field(default=True, description="是否成功")


class SuccessResponse(JSONResponse):
    def __init__(self, data: Any = None, msg: str = RET.OK.msg, code: int = RET.OK.code) -> None:
        content = ResponseSchema(
            code=code, msg=msg, data=data, success=True).model_dump()
        super().__init__(content=jsonable_encoder(content), status_code=status.HTTP_200_OK)


class ErrorResponse(JSONResponse):
    def __init__(self, msg: str = RET.ERROR.msg, code: int = RET.ERROR.code, status_code: int = status.HTTP_400_BAD_REQUEST) -> None:
        content = ResponseSchema(
            code=code, msg=msg, data=None, success=False).model_dump()
        super().__init__(content=jsonable_encoder(content), status_code=status_code)
