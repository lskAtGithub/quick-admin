from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.response import SuccessResponse
from app.core.base_schema import AuthSchema, PageResultSchema
from app.core.dependencies import db_getter, get_current_user

from .crud import DeptCRUD
from .schema import DeptCreateSchema, DeptOutSchema, DeptQuerySchema, DeptUpdateSchema
from .service import DeptService

DeptRouter = APIRouter(prefix="/dept", tags=["部门管理"])


@DeptRouter.get("/tree", summary="部门树")
async def get_dept_tree(
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    tree = await DeptService(auth, db).get_tree()
    return SuccessResponse(data=tree)


@DeptRouter.get("/list", summary="部门列表(分页)")
async def get_dept_list(
    query: Annotated[DeptQuerySchema, Depends()],
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    crud = DeptCRUD(auth, db)
    items, total = await crud.list(
        page_no=int(query.page_no),
        page_size=int(query.page_size),
        name=query.name,
        status=int(query.status) if query.status is not None else None,
    )
    result = PageResultSchema(
        page_no=int(query.page_no),
        page_size=int(query.page_size),
        total=total,
        items=[DeptService._to_dict(u) for u in items],
    )
    return SuccessResponse(data=result.model_dump())


@DeptRouter.get("/detail/{dept_id}", summary="部门详情")
async def get_dept_detail(
    dept_id: int,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    dept = await DeptCRUD(auth, db).get_by_id(dept_id)
    if not dept:
        from app.common.enums import RET
        from app.core.exceptions import CustomException
        raise CustomException(msg="部门不存在", code=RET.NOT_FOUND.code, status_code=404)
    return SuccessResponse(data=DeptService._to_dict(dept))


@DeptRouter.post("/create", summary="创建部门")
async def create_dept(
    data: DeptCreateSchema,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await DeptService(auth, db).create(data)
    return SuccessResponse(data=result, msg="创建成功")


@DeptRouter.put("/update/{dept_id}", summary="更新部门")
async def update_dept(
    dept_id: int,
    data: DeptUpdateSchema,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await DeptService(auth, db).update(dept_id, data)
    return SuccessResponse(data=result, msg="更新成功")


@DeptRouter.delete("/delete", summary="删除部门")
async def delete_dept(
    data: dict,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    ids = data.get("ids", [])
    for dept_id in ids:
        await DeptService(auth, db).delete(dept_id)
    return SuccessResponse(msg="删除成功")
