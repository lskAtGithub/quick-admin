from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base_model import ModelMixin


class MenuModel(ModelMixin):
    __tablename__ = "sys_menu"
    __table_args__ = {"comment": "菜单表"}

    name: Mapped[str] = mapped_column(String(64), nullable=False, comment="菜单名称")
    type: Mapped[int] = mapped_column(Integer, nullable=False, default=2, comment="类型(1:目录 2:菜单 3:按钮 4:外链)")
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=999, comment="排序")
    permission: Mapped[str | None] = mapped_column(String(100), comment="权限标识")
    icon: Mapped[str | None] = mapped_column(String(50), comment="图标")
    route_name: Mapped[str | None] = mapped_column(String(100), comment="路由名称")
    route_path: Mapped[str | None] = mapped_column(String(200), comment="路由路径")
    component_path: Mapped[str | None] = mapped_column(String(200), comment="组件路径")
    redirect: Mapped[str | None] = mapped_column(String(200), comment="重定向")
    hidden: Mapped[bool] = mapped_column(Boolean, default=False, comment="是否隐藏")
    keep_alive: Mapped[bool] = mapped_column(Boolean, default=True, comment="是否缓存")
    parent_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("sys_menu.id", ondelete="SET NULL"), default=None, comment="父菜单ID")
    status: Mapped[int] = mapped_column(Integer, default=0, comment="状态(0:正常 1:停用)")

    parent: Mapped["MenuModel | None"] = relationship(
        back_populates="children", remote_side="MenuModel.id",
        foreign_keys="MenuModel.parent_id", uselist=False)
    children: Mapped[list["MenuModel"] | None] = relationship(
        back_populates="parent", foreign_keys="MenuModel.parent_id", order_by="MenuModel.order")
