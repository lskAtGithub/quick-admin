from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import ModelMixin


class UserModel(ModelMixin):
    """用户表"""
    __tablename__ = "sys_user"
    __table_args__ = {"comment": "用户表"}

    username: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, comment="用户名")
    password: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="密码(哈希)")
    name: Mapped[str | None] = mapped_column(
        String(64), nullable=True, comment="昵称")
    mobile: Mapped[str | None] = mapped_column(
        String(20), nullable=True, comment="手机号")
    email: Mapped[str | None] = mapped_column(
        String(128), nullable=True, comment="邮箱")
    avatar: Mapped[str | None] = mapped_column(
        String(255), nullable=True, comment="头像URL")
    is_superuser: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="是否超级管理员")
    status: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False, comment="状态(0:正常 1:停用)")
