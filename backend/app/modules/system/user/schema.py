from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator

from app.core.base_schema import PageQuerySchema


class UserCreateSchema(BaseModel):
    username: str = Field(..., min_length=3, max_length=32, description="用户名")
    password: str = Field(..., min_length=6, max_length=128, description="密码")
    name: str | None = Field(default=None, max_length=64, description="昵称")
    mobile: str | None = Field(default=None, description="手机号")
    email: str | None = Field(default=None, description="邮箱")
    is_superuser: bool = Field(default=False, description="是否超级管理员")
    status: int = Field(default=0, description="状态(0:正常 1:停用)")


class UserUpdateSchema(BaseModel):
    name: str | None = Field(default=None, max_length=64, description="昵称")
    mobile: str | None = Field(default=None, description="手机号")
    email: str | None = Field(default=None, description="邮箱")
    avatar: str | None = Field(default=None, description="头像URL")
    is_superuser: bool | None = Field(default=None, description="是否超级管理员")
    status: int | None = Field(default=None, description="状态(0:正常 1:停用)")


class UserQuerySchema(PageQuerySchema):
    username: str | None = Field(default=None, description="用户名(模糊)")
    name: str | None = Field(default=None, description="昵称(模糊)")
    status: str | None = Field(default=None, description="状态")

    @field_validator("username", "name", "status", mode="before")
    @classmethod
    def empty_str_to_none(cls, v):
        return None if v == "" else v


class UserOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    name: str | None = None
    mobile: str | None = None
    email: str | None = None
    avatar: str | None = None
    is_superuser: bool
    status: int
    created_time: datetime | None = None
    updated_time: datetime | None = None

    @field_serializer("created_time", "updated_time")
    def format_datetime(self, v: datetime | None) -> str | None:
        if v is None:
            return None
        return v.strftime("%Y-%m-%d %H:%M:%S")
