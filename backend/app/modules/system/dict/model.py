from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base_model import ModelMixin

if TYPE_CHECKING:
    from app.modules.system.dict.model import DictDataModel


class DictTypeModel(ModelMixin):
    __tablename__ = "sys_dict_type"
    __table_args__ = {"comment": "字典类型表"}

    dict_name: Mapped[str] = mapped_column(String(100), nullable=False, comment="字典名称")
    dict_type: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, comment="字典类型")
    status: Mapped[int] = mapped_column(Integer, default=0, comment="状态(0:正常 1:停用)")
    description: Mapped[str | None] = mapped_column(Text, comment="备注")

    dict_data_list: Mapped[list["DictDataModel"] | None] = relationship("DictDataModel", back_populates="dict_type_obj")


class DictDataModel(ModelMixin):
    __tablename__ = "sys_dict_data"
    __table_args__ = {"comment": "字典数据表"}

    dict_label: Mapped[str] = mapped_column(String(255), nullable=False, comment="字典标签")
    dict_value: Mapped[str] = mapped_column(String(255), nullable=False, comment="字典键值")
    dict_sort: Mapped[int] = mapped_column(Integer, default=0, comment="排序")
    status: Mapped[int] = mapped_column(Integer, default=0, comment="状态(0:正常 1:停用)")
    css_class: Mapped[str | None] = mapped_column(String(255), comment="样式属性")
    list_class: Mapped[str | None] = mapped_column(String(255), comment="表格回显样式")
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, comment="是否默认")
    description: Mapped[str | None] = mapped_column(Text, comment="备注")
    dict_type: Mapped[str] = mapped_column(String(255), nullable=False, comment="字典类型")
    dict_type_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("sys_dict_type.id", ondelete="CASCADE"), nullable=False, comment="字典类型ID")

    dict_type_obj: Mapped[DictTypeModel] = relationship("DictTypeModel", back_populates="dict_data_list")
