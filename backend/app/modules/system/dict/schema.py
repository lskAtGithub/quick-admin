from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.base_schema import PageQuerySchema


class DictTypeCreateSchema(BaseModel):
    dict_name: str = Field(..., min_length=1, max_length=100, description="字典名称")
    dict_type: str = Field(..., min_length=1, max_length=255, description="字典类型")
    status: int = Field(default=0, ge=0, le=1, description="状态(0:正常 1:停用)")
    description: str | None = Field(default=None, description="备注")

    @field_validator("dict_name", "dict_type", "description", mode="before")
    @classmethod
    def strip_str(cls, v):
        if isinstance(v, str):
            v = v.strip()
        return v or None


class DictTypeUpdateSchema(BaseModel):
    dict_name: str | None = Field(default=None, min_length=1, max_length=100, description="字典名称")
    dict_type: str | None = Field(default=None, min_length=1, max_length=255, description="字典类型")
    status: int | None = Field(default=None, ge=0, le=1, description="状态")
    description: str | None = Field(default=None, description="备注")

    @field_validator("dict_name", "dict_type", "description", mode="before")
    @classmethod
    def strip_str(cls, v):
        if isinstance(v, str):
            v = v.strip()
        return v or None


class DictTypeQuerySchema(PageQuerySchema):
    dict_name: str | None = Field(default=None, description="字典名称")
    dict_type: str | None = Field(default=None, description="字典类型")
    status: str | None = Field(default=None, description="状态")

    @field_validator("dict_name", "dict_type", "status", mode="before")
    @classmethod
    def empty_to_none(cls, v):
        return None if v == "" else v


class DictTypeOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    dict_name: str
    dict_type: str
    status: int
    description: str | None = None


class DictDataCreateSchema(BaseModel):
    dict_label: str = Field(..., min_length=1, max_length=255, description="字典标签")
    dict_value: str = Field(..., min_length=1, max_length=255, description="字典键值")
    dict_sort: int = Field(default=0, ge=0, description="排序")
    status: int = Field(default=0, ge=0, le=1, description="状态(0:正常 1:停用)")
    css_class: str | None = Field(default=None, description="样式属性")
    list_class: str | None = Field(default=None, description="表格回显样式")
    is_default: bool = Field(default=False, description="是否默认")
    description: str | None = Field(default=None, description="备注")
    dict_type: str = Field(..., description="字典类型")
    dict_type_id: int = Field(..., description="字典类型ID")

    @field_validator("dict_label", "dict_value", "css_class", "list_class", "description", mode="before")
    @classmethod
    def strip_str(cls, v):
        if isinstance(v, str):
            v = v.strip()
        return v or None


class DictDataUpdateSchema(BaseModel):
    dict_label: str | None = Field(default=None, min_length=1, max_length=255, description="字典标签")
    dict_value: str | None = Field(default=None, min_length=1, max_length=255, description="字典键值")
    dict_sort: int | None = Field(default=None, ge=0, description="排序")
    status: int | None = Field(default=None, ge=0, le=1, description="状态")
    css_class: str | None = Field(default=None, description="样式属性")
    list_class: str | None = Field(default=None, description="表格回显样式")
    is_default: bool | None = Field(default=None, description="是否默认")
    description: str | None = Field(default=None, description="备注")

    @field_validator("dict_label", "dict_value", "css_class", "list_class", "description", mode="before")
    @classmethod
    def strip_str(cls, v):
        if isinstance(v, str):
            v = v.strip()
        return v or None


class DictDataQuerySchema(PageQuerySchema):
    dict_label: str | None = Field(default=None, description="字典标签")
    dict_type: str | None = Field(default=None, description="字典类型")
    status: str | None = Field(default=None, description="状态")

    @field_validator("dict_label", "dict_type", "status", mode="before")
    @classmethod
    def empty_to_none(cls, v):
        return None if v == "" else v


class DictDataOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    dict_label: str
    dict_value: str
    dict_sort: int
    status: int
    css_class: str | None = None
    list_class: str | None = None
    is_default: bool
    description: str | None = None
    dict_type: str
    dict_type_id: int
