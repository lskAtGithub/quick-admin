from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.common.enums import RET
from app.common.response import ErrorResponse
from app.core.logger import logger


class CustomException(Exception):
    """业务异常 — 在代码中主动抛出，会被全局捕获转为统一 JSON 响应"""

    def __init__(self, msg: str = "系统异常", code: int = RET.EXCEPTION.code, status_code: int = 500) -> None:
        super().__init__(msg)
        self.msg = msg
        self.code = code
        self.status_code = status_code


def handle_exception(app: FastAPI) -> None:
    @app.exception_handler(CustomException)
    async def custom_exception_handler(request: Request, exc: CustomException) -> JSONResponse:
        logger.error("[业务异常] {} {} | {}", request.method,
                     request.url.path, exc.msg)
        return ErrorResponse(msg=exc.msg, code=exc.code, status_code=exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        errors = []
        for error in exc.errors():
            loc = " -> ".join(str(x) for x in error["loc"])
            errors.append(f"{loc}: {error['msg']}")
        msg = "; ".join(errors)
        logger.error("[参数校验失败] {} {} | {}", request.method, request.url.path, msg)
        return ErrorResponse(msg=msg, code=RET.ERROR.code, status_code=400)

    @app.exception_handler(Exception)
    async def all_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error("[未捕获异常] {} {} | {}", request.method,
                     request.url.path, exc)
        return ErrorResponse(msg="服务器内部错误", status_code=500)
