from pydantic import BaseModel, ConfigDict, Field


class CaptchaOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    enable: bool = Field(default=True, description="是否启用验证码")
    key: str = Field(..., description="验证码唯一标识")
    img_base: str = Field(default="", description="Base64编码的验证码图片")


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
