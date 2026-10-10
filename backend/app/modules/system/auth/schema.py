from pydantic import BaseModel, Field


class LoginSchema(BaseModel):
    """登录请求"""
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")


class LoginOutSchema(BaseModel):
    """登录响应"""
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int
    user_info: dict


class RegisterSchema(BaseModel):
    """注册请求"""
    username: str = Field(..., min_length=3, max_length=32, description="用户名")
    password: str = Field(..., min_length=6, max_length=128, description="密码")
    name: str | None = Field(default=None, max_length=64, description="昵称")
