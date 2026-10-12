from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base_model import MappedBase, ModelMixin

if TYPE_CHECKING:
    from app.modules.system.menu.model import MenuModel
    from app.modules.system.user.model import UserModel


class UserRolesModel(MappedBase):
    __tablename__ = "sys_user_roles"
    __table_args__ = {"comment": "用户角色关联表"}

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("sys_user.id", ondelete="CASCADE"), primary_key=True, comment="用户ID")
    role_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("sys_role.id", ondelete="CASCADE"), primary_key=True, comment="角色ID")


class RoleMenusModel(MappedBase):
    __tablename__ = "sys_role_menus"
    __table_args__ = {"comment": "角色菜单关联表"}

    role_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("sys_role.id", ondelete="CASCADE"), primary_key=True, comment="角色ID")
    menu_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("sys_menu.id", ondelete="CASCADE"), primary_key=True, comment="菜单ID")


class RoleModel(ModelMixin):
    __tablename__ = "sys_role"
    __table_args__ = {"comment": "角色表"}

    name: Mapped[str] = mapped_column(String(64), nullable=False, comment="角色名称")
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, comment="角色编码")
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=999, comment="排序")
    status: Mapped[int] = mapped_column(Integer, default=0, comment="状态(0:正常 1:停用)")
    description: Mapped[str | None] = mapped_column(Text, comment="备注")

    menus: Mapped[list["MenuModel"]] = relationship(
        secondary="sys_role_menus", back_populates="roles", order_by="MenuModel.order")
    users: Mapped[list["UserModel"]] = relationship(
        secondary="sys_user_roles", back_populates="roles")
