from datetime import datetime

import jwt
from fastapi import Request
from fastapi.security import OAuth2PasswordBearer

from app.config.setting import settings
from app.core.base_schema import JWTPayloadSchema
from app.core.exceptions import CustomException
from app.common.enums import RET


class CustomOAuth2PasswordBearer(OAuth2PasswordBearer):
    """自定义 Bearer Token 提取 — 从 Authorization 头取 token"""

    async def __call__(self, request: Request) -> str | None:
        from fastapi.security.utils import get_authorization_scheme_param
        authorization = request.headers.get("Authorization")
        scheme, token = get_authorization_scheme_param(authorization)
        if not authorization or scheme.lower() != "bearer":
            raise CustomException(
                msg="认证失败,请重新登录", code=RET.TOKEN_EXPIRE.code, status_code=401)
        return token


OAuth2Schema = CustomOAuth2PasswordBearer(tokenUrl="system/auth/login")


def create_access_token(payload: JWTPayloadSchema) -> str:
    """生成 JWT"""
    payload_dict = payload.model_dump()
    if isinstance(payload_dict.get("exp"), datetime):
        payload_dict["exp"] = int(payload_dict["exp"].timestamp())
    return jwt.encode(payload=payload_dict, key=settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> JWTPayloadSchema:
    """解析 JWT"""
    try:
        payload = jwt.decode(jwt=token, key=settings.SECRET_KEY,
                             algorithms=[settings.ALGORITHM])
        return JWTPayloadSchema(**payload)
    except jwt.ExpiredSignatureError:
        raise CustomException(
            msg="认证已过期,请重新登录", code=RET.TOKEN_EXPIRE.code, status_code=401)
    except (jwt.InvalidSignatureError, jwt.DecodeError):
        raise CustomException(
            msg="无效认证,请重新登录", code=RET.TOKEN_EXPIRE.code, status_code=401)
