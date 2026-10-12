from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.base_schema import PageQuerySchema


class MenuCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=64, description="菜单名称")
    type: int = Field(..., ge=1, le=4, description="类型(1:目录 2:菜单 3:按钮 4:外链)")
    order: int = Field(default=999, ge=0, description="排序")
    permission: str | None = Field(default=None, max_length=100, description="权限标识")
    icon: str | None = Field(default=None, max_length=50, description="图标")
    route_name: str | None = Field(default=None, max_length=100, description="路由名称")
    route_path: str | None = Field(default=None, max_length=200, description="路由路径")
    component_path: str | None = Field(default=None, max_length=200, description="组件路径")
    redirect: str | None = Field(default=None, max_length=200, description="重定向")
    hidden: bool = Field(default=False, description="是否隐藏")
    keep_alive: bool = Field(default=True, description="是否缓存")
    parent_id: int | None = Field(default=None, description="父菜单ID")
    status: int = Field(default=0, ge=0, le=1, description="状态(0:正常 1:停用)")

    @field_validator("name", "icon", "permission", "route_name", "route_path",
                     "component_path", "redirect", mode="before")
    @classmethod
    def strip_str(cls, v):
        if isinstance(v, str):
            v = v.strip()
        return v or None


class MenuUpdateSchema(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=64, description="菜单名称")
    type: int | None = Field(default=None, ge=1, le=4, description="类型")
    order: int | None = Field(default=None, ge=0, description="排序")
    permission: str | None = Field(default=None, max_length=100, description="权限标识")
    icon: str | None = Field(default=None, max_length=50, description="图标")
    route_name: str | None = Field(default=None, max_length=100, description="路由名称")
    route_path: str | None = Field(default=None, max_length=200, description="路由路径")
    component_path: str | None = Field(default=None, max_length=200, description="组件路径")
    redirect: str | None = Field(default=None, max_length=200, description="重定向")
    hidden: bool | None = Field(default=None, description="是否隐藏")
    keep_alive: bool | None = Field(default=None, description="是否缓存")
    parent_id: int | None = Field(default=None, description="父菜单ID")
    status: int | None = Field(default=None, ge=0, le=1, description="状态")

    @field_validator("name", "icon", "permission", "route_name", "route_path",
                     "component_path", "redirect", mode="before")
    @classmethod
    def strip_str(cls, v):
        if isinstance(v, str):
            v = v.strip()
        return v or None


class MenuQuerySchema(PageQuerySchema):
    name: str | None = Field(default=None, description="菜单名称")
    status: str | None = Field(default=None, description="状态")
    type: str | None = Field(default=None, description="类型")

    @field_validator("name", "status", "type", mode="before")
    @classmethod
    def empty_to_none(cls, v):
        return None if v == "" else v


class MenuOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: int
    order: int
    permission: str | None = None
    icon: str | None = None
    route_name: str | None = None
    route_path: str | None = None
    component_path: str | None = None
    redirect: str | None = None
    hidden: bool
    keep_alive: bool
    parent_id: int | None = None
    status: int
    parent_name: str | None = None
    children: list["MenuOutSchema"] | None = None
