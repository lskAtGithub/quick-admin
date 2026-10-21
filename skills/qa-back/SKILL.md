---
name: qa-back
description: quick-admin 后端（backend，FastAPI + SQLAlchemy async + MySQL + Redis + uv）开发规范与新增业务模块的完整流程，含动工前的多轮需求问询与 PRD 确认门径，覆盖 model/schema/crud/service/controller 五层、DOMAIN_CONTROLLERS 域注册、全局权限中间件契约、菜单权限 SQL 交付、Alembic 迁移与自验。当后续开发者新增、改造后端模块或接口、调整权限与字典数据时使用。
---

# Quick Admin 后端开发规范

面向本项目的开发约定。新增一个业务模块 = 需求确认 → 建模 → Schema → CRUD → Service → Controller 注册 → 权限数据交付 → 校验，按 Step 顺序完成；全程遵守文末红线。

## Step 0：需求澄清与 PRD 确认（动工前强制门径）

用户提出新需求（如"给我做一个商城模块"）时，**禁止直接开始写代码**，必须按"多轮问询 → PRD 确认 → 执行 → 自验"四步走：

1. **多轮问询**：逐轮把下列事项全部问清，未明确的一项不得进入 PRD（优先用结构化提问工具一次问齐）：
   - 所属域与路由前缀：挂现有域（`/system`、`/common`）还是新开域；接口路径是什么。
   - **表名与前缀**：系统域沿用 `sys_` 前缀；**新域的表前缀每次必须问用户**，不得自行发明。
   - 字段清单：每个字段的名称、类型、约束（唯一/非空/默认值）、注释；哪些字段参与列表搜索。
   - 数据形态：平表 / 树形（parent_id 自关联）/ 多对多关联（需中间表）。
   - 接口范围：增删改查、树、分页哪些要哪些不要，逐项确认而非默认全选。
   - 菜单与按钮权限：该模块要在菜单管理落哪些菜单/按钮节点、授权给哪些角色。
   - 是否需要同步交付前端页面（前后端联调顺序）。
2. **输出 PRD**：用下述模板交用户审阅，等待明确确认：

   ```markdown
   # <模块名> 需求确认（PRD）
   ## 需求概述
   [一段话描述模块做什么]
   ## 表设计
   | 字段 | 类型 | 约束 | 注释 | 可搜索 |
   表名 / 前缀 / 数据形态（树形/关联）
   ## 接口清单
   | 动作 | Method | Path | 推导权限码 |
   （权限码按 path_to_permission 规则预填，见 Step 7）
   ## 菜单与权限
   需落库的目录/菜单/按钮节点与 permission 值，交付形式为 SQL 脚本
   ## 验收标准
   [服务可启动 + 各接口 curl 冒烟通过的功能点]
   ```

3. **确认后执行**：用户看过 PRD 并明确回复确认无异议后，才能按 Step 1-7 开始修改代码；PRD 与后续沟通冲突时，以用户最新指示为准。
4. **完成后自验**：按 Step 8 执行，逐条核对 PRD 验收标准，发现问题先修复再交付，交付时说明验证结果。

## 工程与环境

- Python ≥ 3.12，依赖用 **uv** 管理（`pyproject.toml` + `uv.lock`，无 requirements.txt），命令在 `backend/` 目录执行。
- 启动：`uv run python main.py`（工厂模式 `app:create_app`）；环境由 OS 变量 `ENVIRONMENT` 选择 `env/.env.{dev,prod}`；接口文档 `/docs`。
- **运行时数据库以实际生效配置为准**：`env/.env.dev` 不入库，先看它是否存在——存在则按其中 `DATABASE_TYPE`，不存在则回落 `setting.py` 内置默认 **sqlite**；不要凭代码默认值或历史会话断定当前库类型。切换到 MySQL 的步骤见 `backend/README.md` 的「切换到 MySQL」。
- 首次启动自动 `create_tables` 建表并幂等种子超管 `admin`/`admin`（`app/scripts/init_data.py`）。
- 代码风格沿用现有习惯：PEP8 基础、4 空格、`Mapped[]` 类型标注、不强制引入 linter/formatter；注释只在不自解释处写。

## 分层与命名

| 内容 | 位置与形态 |
|---|---|
| 模块五层 | `app/modules/<domain>/<module>/{__init__,model,schema,crud,service,controller}.py`（无持久化实体的模块可省 model/schema/crud 层，参照 param/file 先例）；**`__init__.py` 必须建** |
| 模型 | `<Name>Model(ModelMixin)`，`__tablename__` 系统域用 `sys_` 前缀，每列带 `comment` |
| Schema | `<Name>CreateSchema` / `UpdateSchema` / `QuerySchema(继承 PageQuerySchema)` / `OutSchema(from_attributes)` |
| CRUD | `<Name>CRUD`，构造入参 `(auth, db)` |
| Service | `<Name>Service`，构造入参 `(auth, db)` |
| 路由 | `APIRouter(prefix="/<module>", tags=["<中文名>管理"])`，命名 `<Name>Router` |
| 域注册 | `app/api/v1/routers.py` 的 `DOMAIN_CONTROLLERS` 按域挂入，**不散落注册**；新域同步加前缀分组 |

## Step 1：Model

继承 `ModelMixin`（自带 id / is_deleted / created_time / updated_time），时间统一 `datetime.now(ZoneInfo("Asia/Shanghai"))`：

```python
class <Name>Model(ModelMixin):
    __tablename__ = "sys_<name>"
    __table_args__ = {"comment": "<中文>表"}

    name: Mapped[str] = mapped_column(String(64), nullable=False, comment="名称")
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=999, comment="排序")
    status: Mapped[int] = mapped_column(Integer, default=0, comment="状态(0:正常 1:停用)")
    parent_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("sys_<name>.id", ondelete="SET NULL"), default=None, comment="父ID")

    parent: Mapped["<Name>Model | None"] = relationship(
        back_populates="children", remote_side="<Name>Model.id",
        foreign_keys="<Name>Model.parent_id", uselist=False)
    children: Mapped[list["<Name>Model"] | None] = relationship(
        back_populates="parent", foreign_keys="<Name>Model.parent_id", order_by="<Name>Model.order")
```

树形自关联与多对多（参照 `RoleMenusModel` 中间表形态）的关系，CRUD 查询侧必须显式预加载（见红线 2）。模型有变更时新建模块可靠启动 `create_all` 建表；**改已上线表结构须在发版前补 Alembic 迁移**（Step 7）。

## Step 2：Schema

```python
class <Name>CreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=64, description="名称")
    status: int = Field(default=0, ge=0, le=1, description="状态")

    @field_validator("name", mode="before")
    @classmethod
    def strip_str(cls, v):
        if isinstance(v, str):
            v = v.strip()
        return v or None


class <Name>UpdateSchema(BaseModel):  # 全字段 Optional，exclude_unset 局部更新
    name: str | None = Field(default=None, ...)


class <Name>QuerySchema(PageQuerySchema):  # 继承分页参数 page_no/page_size
    name: str | None = Field(default=None, description="名称")


class <Name>OutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    ...
```

字段名以后端模型为准，字符串入参统一 strip 后空串转 None。

## Step 3：CRUD

方法集固定：`get(**kwargs)` / `get_by_id(id)` / `list(page_no, page_size, **filters)` / `list_all(**filters)` / `create(dict)` / `update(id, dict)` / `delete(id)` / `exists(**kwargs)`。要点：

- **所有查询显式过滤 `Model.is_deleted == False`**（逻辑删除，delete 只置位不物理删）。
- **select 一律 `.options(selectinload(...))` 预加载将要读取的关系**（parent / 多对多）。
- `list` 名称类模糊 `like(f"%{v}%")`、其余等值；排序 `order.asc(), id.asc()`；count 用 `select(func.count()).select_from(stmt.subquery())`。
- **create / update 提交后按 id 重新查询（带预加载）再返回**——直接读 refresh 后的对象拿不到关系。

## Step 4：Service

只放业务规则与编排，不碰 SQL：唯一性校验（`exists(code=...)` 抛 `CustomException`）、树组装（`get_tree` 用 dict 映射挂 children）、`_to_dict` 静态方法输出扁平 dict（读 `dept.parent.name` 这类关系字段依赖 Step 3 已预加载）。异常统一：

```python
raise CustomException(msg="<名称>不存在", code=RET.NOT_FOUND.code, status_code=404)
```

## Step 5：Controller

标准六端点形态（**必须遵守，动词不得自创**，见红线 3）：

```python
<Name>Router = APIRouter(prefix="/<name>", tags=["<中文>管理"])

@<Name>Router.get("/tree", summary="...")          # 树形模块
@<Name>Router.get("/list", summary="...(分页)")     # query: Annotated[<Name>QuerySchema, Depends()]
@<Name>Router.get("/detail/{id}", summary="...")
@<Name>Router.post("/create", summary="...")        # data: <Name>CreateSchema
@<Name>Router.put("/update/{id}", summary="...")    # data: <Name>UpdateSchema
@<Name>Router.delete("/delete", summary="...")      # data: dict，收 {"ids": [...]} 循环删除
```

每个 handler 注入 `db: Annotated[AsyncSession, Depends(db_getter)]` 与 `auth: Annotated[AuthSchema, Depends(get_current_user)]`；返回 `SuccessResponse(data=..., msg="创建成功")`；分页结果装 `PageResultSchema(page_no, page_size, total, items)`。

## Step 6：域注册

`app/api/v1/routers.py`：import `<Name>Router`，挂进 `DOMAIN_CONTROLLERS["/system"]`（或 PRD 确认的新域列表）。前缀拼接后完整路径为 `/api/v1/<domain>/<name>/...`。

## Step 7：权限与菜单数据交付

- 鉴权由全局 `PermissionMiddleware` 按路径推导，规则：去 `/api/v1` 前缀、剔除数字段与 `{占位}` 段后取前三段为 `module:resource:action`，动作按 HTTP 方法映射 **GET→query / POST→create / PUT→update / DELETE→delete**。
- 菜单表 `permission` 字段值必须与推导结果**逐字一致**（如 `system:<name>:query`、`system:<name>:create`），否则误拦合法请求。
- **登录后自描述端点**（当前用户信息、验证码、令牌刷新、字典类型直取等任何登录用户都要访问的接口）必须显式加入 `middlewares.py` 的 `PUBLIC_PATHS` / `PUBLIC_PATH_PREFIXES`，否则低权限账号 403 死循环。
- 新增模块的目录/菜单/按钮节点与角色授权**以 SQL 脚本交付**（建议 `backend/scripts/sql/<module>_menu.sql`），由用户执行落库；不在 `init_data.py` 里加业务菜单种子（该文件仅用于超管账号幂等初始化）。

## Step 8：校验

优先实跑（环境就绪时）：

```bash
uv run python main.py                # 服务启动无报错，/docs 出现新 tag
curl 逐接口冒烟                       # 带 token 走通 CRUD，返回体 code=0
```

外部依赖（MySQL/Redis）不可用而无法实跑时，降级为静态核验：

```bash
uv run python -c "from app import create_app; create_app()"
```

交付时说明跑的是哪一档及结果；并逐条核对 PRD 验收标准。发版前表结构演进统一走 `uv run alembic revision --autogenerate -m "..."` + `uv run alembic upgrade head`。

## 红线（违反必返工）

1. **鉴权走全局中间件按路径推导，不逐接口声明权限依赖**；新增自描述端点必须同步加白名单。
2. **异步 ORM 读取关系前必须显式预加载**（`selectinload`），否则 `MissingGreenlet` 会被兜底成不透明 500。
3. **接口必须使用标准动词端点形态**（tree/list/detail/create/update/delete）；确需自定义动词端点（如 `/enable`）时，必须同步扩展 `path_to_permission` 推导规则或加入白名单，并在 PRD 中先行说明。
4. **响应只走 `SuccessResponse` / `ErrorResponse` + `CustomException` + `RET` 业务码**，不手拼 dict 返回；`code=0` 为成功契约，前端请求层依赖它。
5. **查询不得漏 `is_deleted == False` 过滤**（逻辑删除全局约定）；模型字段、查询参数命名用蛇形，与前端 API 层逐字对齐。
