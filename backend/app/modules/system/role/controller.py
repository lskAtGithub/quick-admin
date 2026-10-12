from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.response import SuccessResponse
from app.core.base_schema import AuthSchema, PageResultSchema
from app.core.dependencies import db_getter, get_current_user

from .crud import RoleCRUD
from .schema import RoleCreateSchema, RoleQuerySchema, RoleUpdateSchema
from .service import RoleService

RoleRouter = APIRouter(prefix="/role", tags=["角色管理"])


@RoleRouter.get("/list", summary="角色列表(分页)")
async def get_role_list(
    query: Annotated[RoleQuerySchema, Depends()],
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    crud = RoleCRUD(auth, db)
    items, total = await crud.list(
        page_no=int(query.page_no),
        page_size=int(query.page_size),
        name=query.name,
        code=query.code,
        status=int(query.status) if query.status is not None else None,
    )
    result = PageResultSchema(
        page_no=int(query.page_no),
        page_size=int(query.page_size),
        total=total,
        items=[RoleService._to_dict(r) for r in items],
    )
    return SuccessResponse(data=result.model_dump())


@RoleRouter.get("/{role_id}", summary="角色详情")
async def get_role_detail(
    role_id: int,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    role = await RoleCRUD(auth, db).get_by_id(role_id)
    if not role:
        from app.common.enums import RET
        from app.core.exceptions import CustomException
        raise CustomException(msg="角色不存在", code=RET.NOT_FOUND.code, status_code=404)
    return SuccessResponse(data=RoleService._to_dict(role))


@RoleRouter.post("", summary="创建角色")
async def create_role(
    data: RoleCreateSchema,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await RoleService(auth, db).create(data)
    return SuccessResponse(data=result, msg="创建成功")


@RoleRouter.put("/{role_id}", summary="更新角色")
async def update_role(
    role_id: int,
    data: RoleUpdateSchema,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await RoleService(auth, db).update(role_id, data)
    return SuccessResponse(data=result, msg="更新成功")


@RoleRouter.delete("/{role_id}", summary="删除角色")
async def delete_role(
    role_id: int,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    await RoleService(auth, db).delete(role_id)
    return SuccessResponse(msg="删除成功")
