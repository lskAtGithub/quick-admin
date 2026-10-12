from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.base_schema import PageQuerySchema


class RoleCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=64, description="角色名称")
    code: str = Field(..., min_length=1, max_length=64, description="角色编码")
    order: int = Field(default=999, ge=0, description="排序")
    status: int = Field(default=0, ge=0, le=1, description="状态(0:正常 1:停用)")
    description: str | None = Field(default=None, description="备注")
    menu_ids: list[int] = Field(default_factory=list, description="菜单ID列表")

    @field_validator("name", "code", "description", mode="before")
    @classmethod
    def strip_str(cls, v):
        if isinstance(v, str):
            v = v.strip()
        return v or None


class RoleUpdateSchema(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=64, description="角色名称")
    code: str | None = Field(default=None, min_length=1, max_length=64, description="角色编码")
    order: int | None = Field(default=None, ge=0, description="排序")
    status: int | None = Field(default=None, ge=0, le=1, description="状态")
    description: str | None = Field(default=None, description="备注")
    menu_ids: list[int] | None = Field(default=None, description="菜单ID列表")

    @field_validator("name", "code", "description", mode="before")
    @classmethod
    def strip_str(cls, v):
        if isinstance(v, str):
            v = v.strip()
        return v or None


class RoleQuerySchema(PageQuerySchema):
    name: str | None = Field(default=None, description="角色名称")
    code: str | None = Field(default=None, description="角色编码")
    status: str | None = Field(default=None, description="状态")

    @field_validator("name", "code", "status", mode="before")
    @classmethod
    def empty_to_none(cls, v):
        return None if v == "" else v


class RoleOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    code: str
    order: int
    status: int
    description: str | None = None
    menu_ids: list[int] = []
