from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.response import SuccessResponse
from app.core.base_schema import AuthSchema, PageResultSchema
from app.core.dependencies import db_getter, get_current_user

from .crud import UserCRUD
from .schema import UserCreateSchema, UserOutSchema, UserQuerySchema, UserUpdateSchema
from .service import UserService

UserRouter = APIRouter(prefix="/user", tags=["用户管理"])


@UserRouter.get("/current/info", summary="获取当前用户信息")
async def get_current_user_info(
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    user = await UserCRUD(auth, db).get_by_id(auth.user.id)
    if not user:
        from app.common.enums import RET
        from app.core.exceptions import CustomException
        raise CustomException(msg="用户不存在", code=RET.NOT_FOUND.code, status_code=404)
    user_service = UserService(auth, db)
    data = UserService._to_dict(user)
    data["menus"] = await user_service.get_user_menus(user)
    return SuccessResponse(data=data)


@UserRouter.get("/list", summary="用户列表")
async def get_user_list(
    query: Annotated[UserQuerySchema, Depends()],
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    crud = UserCRUD(auth, db)
    items, total = await crud.list(
        page_no=int(query.page_no),
        page_size=int(query.page_size),
        username=query.username,
        name=query.name,
        mobile=query.mobile,
        status=int(query.status) if query.status is not None else None,
        dept_id=int(query.dept_id) if query.dept_id is not None else None,
    )
    result = PageResultSchema(
        page_no=int(query.page_no),
        page_size=int(query.page_size),
        total=total,
        items=[UserService._to_dict(u) for u in items],
    )
    return SuccessResponse(data=result.model_dump())


@UserRouter.get("/detail/{user_id}", summary="用户详情")
async def get_user_detail(
    user_id: int,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    user = await UserCRUD(auth, db).get_by_id(user_id)
    if not user:
        from app.common.enums import RET
        from app.core.exceptions import CustomException
        raise CustomException(msg="用户不存在", code=RET.NOT_FOUND.code, status_code=404)
    return SuccessResponse(data=UserService._to_dict(user))


@UserRouter.post("/create", summary="创建用户")
async def create_user(
    data: UserCreateSchema,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await UserService(auth, db).create(data)
    return SuccessResponse(data=result, msg="创建成功")


@UserRouter.put("/update/{user_id}", summary="更新用户")
async def update_user(
    user_id: int,
    data: UserUpdateSchema,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await UserService(auth, db).update(user_id, data)
    return SuccessResponse(data=result, msg="更新成功")


@UserRouter.delete("/delete", summary="删除用户")
async def delete_user(
    data: dict,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    ids = data.get("ids", [])
    for user_id in ids:
        await UserService(auth, db).delete(user_id)
    return SuccessResponse(msg="删除成功")
