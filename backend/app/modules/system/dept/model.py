from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base_model import ModelMixin

if TYPE_CHECKING:
    from app.modules.system.user.model import UserModel


class DeptModel(ModelMixin):
    __tablename__ = "sys_dept"
    __table_args__ = {"comment": "部门表"}

    name: Mapped[str] = mapped_column(String(64), nullable=False, comment="部门名称")
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, comment="部门编码")
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=999, comment="排序")
    status: Mapped[int] = mapped_column(Integer, default=0, comment="状态(0:正常 1:停用)")
    description: Mapped[str | None] = mapped_column(Text, comment="备注")
    parent_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("sys_dept.id", ondelete="SET NULL"), default=None, comment="父部门ID")

    parent: Mapped["DeptModel | None"] = relationship(
        back_populates="children", remote_side="DeptModel.id",
        foreign_keys="DeptModel.parent_id", uselist=False)
    children: Mapped[list["DeptModel"] | None] = relationship(
        back_populates="parent", foreign_keys="DeptModel.parent_id", order_by="DeptModel.order")
    users: Mapped[list["UserModel"] | None] = relationship(back_populates="dept", foreign_keys="UserModel.dept_id")
