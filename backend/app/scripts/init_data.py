from sqlalchemy import func, select

from app.core.database import async_db_session
from app.core.logger import logger
from app.modules.system.dept.model import DeptModel
from app.modules.system.dict.model import DictDataModel, DictTypeModel
from app.modules.system.menu.model import MenuModel
from app.modules.system.user.model import UserModel
from app.utils.password_util import PwdUtil

# 默认超级管理员（仅用于首次初始化，上线后应尽快改密）
DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_PASSWORD = "admin"

MENU_TYPE_CATALOG = 1
MENU_TYPE_MENU = 2
MENU_TYPE_BUTTON = 3

# 权限码必须与 core/middlewares.py 的 path_to_permission 推导结果逐字一致：
# 菜单节点持 query，按钮持 create/update/delete，查询动作不在两处重复
BUTTON_ACTIONS = ("create", "update", "delete")

# 菜单树：目录下挂菜单，菜单下挂按钮；名称存 i18n key，前端经 formatMenuTitle 解析
DEFAULT_MENUS: list[dict] = [
    {
        "name": "menus.system.title",
        "icon": "ri:settings-2-line",
        "route_name": "SystemModule",
        "route_path": "/system",
        "redirect": "/system/user",
        "order": 1,
        # (名称, 路由名, 路由路径, 组件路径, 图标, 排序, 权限资源前缀)
        "children": [
            ("menus.system.user.title", "SystemUser", "user", "module_system/user/index", "ri:user-line", 1, "system:user"),
            ("menus.system.role.title", "SystemRole", "role", "module_system/role/index", "ri:team-line", 2, "system:role"),
            ("menus.system.menu.title", "SystemMenu", "menu", "module_system/menu/index", "ri:menu-line", 3, "system:menu"),
            ("menus.system.dept.title", "SystemDept", "dept", "module_system/dept/index", "ri:node-tree", 4, "system:dept"),
            ("menus.system.dict.title", "SystemDict", "dict", "module_system/dict/index", "ri:book-2-line", 5, "system:dict"),
        ],
    },
]

# 个人中心性别下拉取自 sys_user_sex
DEFAULT_DICT_TYPES: list[dict] = [
    {
        "dict_name": "性别",
        "dict_type": "sys_user_sex",
        "items": (("男", "0", 0), ("女", "1", 1), ("保密", "2", 2)),
    },
]

DEFAULT_DEPTS: list[tuple] = [("总公司", "dept_root", 1)]


async def _has_rows(session, model) -> bool:
    """表内是否有任意行（含软删），有则视为用户已在自行维护，不再写种子"""
    return bool((await session.execute(select(func.count()).select_from(model))).scalar())


async def init_admin_user() -> None:
    """若不存在任何超级管理员，则创建默认 admin/admin 账号。幂等。"""
    async with async_db_session() as session:
        stmt = select(UserModel).where(UserModel.username == DEFAULT_ADMIN_USERNAME)
        exists = (await session.execute(stmt)).scalars().first()
        if exists:
            return

        admin = UserModel(
            username=DEFAULT_ADMIN_USERNAME,
            password=PwdUtil.hash_password(DEFAULT_ADMIN_PASSWORD),
            name="超级管理员",
            is_superuser=True,
            status=0,
            gender="1",
        )
        session.add(admin)
        await session.commit()
        logger.warning(
            f"已初始化默认超级管理员账号：{DEFAULT_ADMIN_USERNAME}/{DEFAULT_ADMIN_PASSWORD}（请尽快修改密码）"
        )


async def init_default_menus() -> None:
    """若菜单表为空，则写入默认菜单树与按钮权限。幂等。"""
    async with async_db_session() as session:
        if await _has_rows(session, MenuModel):
            return

        for catalog in DEFAULT_MENUS:
            parent = MenuModel(
                name=catalog["name"], type=MENU_TYPE_CATALOG, order=catalog["order"],
                icon=catalog["icon"], route_name=catalog["route_name"],
                route_path=catalog["route_path"], redirect=catalog["redirect"],
                hidden=False, keep_alive=True, status=0,
            )
            session.add(parent)
            await session.flush()

            for name, route_name, route_path, component_path, icon, order, perm in catalog["children"]:
                menu = MenuModel(
                    name=name, type=MENU_TYPE_MENU, order=order, permission=f"{perm}:query",
                    icon=icon, route_name=route_name, route_path=route_path,
                    component_path=component_path, hidden=False, keep_alive=True,
                    parent_id=parent.id, status=0,
                )
                session.add(menu)
                await session.flush()

                for btn_order, action in enumerate(BUTTON_ACTIONS, start=1):
                    session.add(MenuModel(
                        name=f"menus.actions.{action}", type=MENU_TYPE_BUTTON, order=btn_order,
                        permission=f"{perm}:{action}", hidden=False, keep_alive=True,
                        parent_id=menu.id, status=0,
                    ))

        await session.commit()
        logger.info("已初始化默认菜单与按钮权限")


async def init_default_dicts() -> None:
    """若字典类型表为空，则写入默认字典。幂等。"""
    async with async_db_session() as session:
        if await _has_rows(session, DictTypeModel):
            return

        for type_conf in DEFAULT_DICT_TYPES:
            dict_type = DictTypeModel(
                dict_name=type_conf["dict_name"], dict_type=type_conf["dict_type"], status=0)
            session.add(dict_type)
            await session.flush()

            for label, value, sort in type_conf["items"]:
                session.add(DictDataModel(
                    dict_label=label, dict_value=value, dict_sort=sort, status=0,
                    dict_type=type_conf["dict_type"], dict_type_id=dict_type.id,
                ))

        await session.commit()
        logger.info("已初始化默认字典数据")


async def init_default_depts() -> None:
    """若部门表为空，则写入根部门。幂等。"""
    async with async_db_session() as session:
        if await _has_rows(session, DeptModel):
            return

        for name, code, order in DEFAULT_DEPTS:
            session.add(DeptModel(name=name, code=code, order=order, status=0))

        await session.commit()
        logger.info("已初始化默认部门")


async def init_business_data() -> None:
    """业务初始数据（菜单/字典/部门），需在全新空库上使超管登录后即有完整侧边菜单"""
    await init_default_menus()
    await init_default_dicts()
    await init_default_depts()

