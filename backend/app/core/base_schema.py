from pydantic import BaseModel, ConfigDict, Field, field_validator


class BaseSchema(BaseModel):
    """通用输出模型"""
    model_config = ConfigDict(from_attributes=True)

    id: int | None = Field(default=None, description="主键ID")
    is_deleted: bool = Field(default=False, description="是否已删除")


class JWTPayloadSchema(BaseModel):
    """JWT 载荷"""
    sub: str = Field(..., description="会话ID")
    is_refresh: bool = Field(default=False, description="是否为刷新令牌")
    exp: int = Field(..., description="过期时间戳")


class JWTOutSchema(BaseModel):
    """JWT 响应"""
    model_config = ConfigDict(from_attributes=True)

    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int


class PageResultSchema(BaseModel):
    """分页结果"""
    page_no: int = 1
    page_size: int = 10
    total: int = 0
    items: list = []


class PageQuerySchema(BaseModel):
    """分页查询基类"""
    page_no: str | int = Field(default=1, description="页码")
    page_size: str | int = Field(default=10, description="每页条数")

    @field_validator("page_no", "page_size", mode="before")
    @classmethod
    def empty_to_default(cls, v, info):
        if v == "" or v is None:
            return cls.model_fields[info.field_name].default
        return int(v)


class CoreUserSchema(BaseModel):
    """认证上下文中的用户信息"""
    model_config = ConfigDict(from_attributes=True)

    id: int = 0
    username: str | None = None
    name: str | None = None
    is_superuser: bool = False


class AuthSchema(BaseModel):
    """权限认证模型 — 贯穿整个请求的认证上下文"""
    model_config = ConfigDict(arbitrary_types_allowed=True)

    user: CoreUserSchema = Field(default_factory=CoreUserSchema)
    permissions: list[str] = Field(default_factory=list)
