from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.response import SuccessResponse
from app.core.base_schema import AuthSchema, PageResultSchema
from app.core.dependencies import db_getter, get_current_user

from .crud import MenuCRUD
from .schema import MenuCreateSchema, MenuOutSchema, MenuQuerySchema, MenuUpdateSchema
from .service import MenuService

MenuRouter = APIRouter(prefix="/menu", tags=["菜单管理"])


@MenuRouter.get("/tree", summary="菜单树")
async def get_menu_tree(
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    tree = await MenuService(auth, db).get_tree()
    return SuccessResponse(data=tree)


@MenuRouter.get("/list", summary="菜单列表(分页)")
async def get_menu_list(
    query: Annotated[MenuQuerySchema, Depends()],
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    crud = MenuCRUD(auth, db)
    items, total = await crud.list(
        page_no=int(query.page_no),
        page_size=int(query.page_size),
        name=query.name,
        status=int(query.status) if query.status is not None else None,
        type=int(query.type) if query.type is not None else None,
    )
    result = PageResultSchema(
        page_no=int(query.page_no),
        page_size=int(query.page_size),
        total=total,
        items=[MenuService._to_dict(u) for u in items],
    )
    return SuccessResponse(data=result.model_dump())


@MenuRouter.get("/{menu_id}", summary="菜单详情")
async def get_menu_detail(
    menu_id: int,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    menu = await MenuCRUD(auth, db).get_by_id(menu_id)
    if not menu:
        from app.common.enums import RET
        from app.core.exceptions import CustomException
        raise CustomException(msg="菜单不存在", code=RET.NOT_FOUND.code, status_code=404)
    return SuccessResponse(data=MenuService._to_dict(menu))


@MenuRouter.post("", summary="创建菜单")
async def create_menu(
    data: MenuCreateSchema,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await MenuService(auth, db).create(data)
    return SuccessResponse(data=result, msg="创建成功")


@MenuRouter.put("/{menu_id}", summary="更新菜单")
async def update_menu(
    menu_id: int,
    data: MenuUpdateSchema,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await MenuService(auth, db).update(menu_id, data)
    return SuccessResponse(data=result, msg="更新成功")


@MenuRouter.delete("/{menu_id}", summary="删除菜单")
async def delete_menu(
    menu_id: int,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    await MenuService(auth, db).delete(menu_id)
    return SuccessResponse(msg="删除成功")
