from pydantic import BaseModel, ConfigDict, Field


class UserCreateSchema(BaseModel):
    """创建用户请求"""
    username: str = Field(..., min_length=3, max_length=32, description="用户名")
    password: str = Field(..., min_length=6, max_length=128, description="密码")
    name: str | None = Field(default=None, max_length=64, description="昵称")
    mobile: str | None = Field(default=None, description="手机号")
    is_superuser: bool = Field(default=False, description="是否超级管理员")


class UserOutSchema(BaseModel):
    """用户输出"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    name: str | None = None
    mobile: str | None = None
    email: str | None = None
    avatar: str | None = None
    is_superuser: bool
    status: int
