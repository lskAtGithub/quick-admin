from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.base_schema import PageQuerySchema


class DeptCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=64, description="部门名称")
    code: str = Field(..., min_length=1, max_length=64, description="部门编码")
    order: int = Field(default=999, ge=0, description="排序")
    status: int = Field(default=0, ge=0, le=1, description="状态(0:正常 1:停用)")
    description: str | None = Field(default=None, description="备注")
    parent_id: int | None = Field(default=None, description="父部门ID")

    @field_validator("name", "code", "description", mode="before")
    @classmethod
    def strip_str(cls, v):
        if isinstance(v, str):
            v = v.strip()
        return v or None


class DeptUpdateSchema(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=64, description="部门名称")
    code: str | None = Field(default=None, min_length=1, max_length=64, description="部门编码")
    order: int | None = Field(default=None, ge=0, description="排序")
    status: int | None = Field(default=None, ge=0, le=1, description="状态")
    description: str | None = Field(default=None, description="备注")
    parent_id: int | None = Field(default=None, description="父部门ID")

    @field_validator("name", "code", "description", mode="before")
    @classmethod
    def strip_str(cls, v):
        if isinstance(v, str):
            v = v.strip()
        return v or None


class DeptQuerySchema(PageQuerySchema):
    name: str | None = Field(default=None, description="部门名称")
    status: str | None = Field(default=None, description="状态")

    @field_validator("name", "status", mode="before")
    @classmethod
    def empty_to_none(cls, v):
        return None if v == "" else v


class DeptOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    code: str
    order: int
    status: int
    description: str | None = None
    parent_id: int | None = None
    parent_name: str | None = None
    children: list["DeptOutSchema"] | None = None
