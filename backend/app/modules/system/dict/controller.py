from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.response import SuccessResponse
from app.core.base_schema import AuthSchema, PageResultSchema
from app.core.dependencies import db_getter, get_current_user

from .crud import DictDataCRUD, DictTypeCRUD
from .schema import (
    DictDataCreateSchema,
    DictDataQuerySchema,
    DictDataUpdateSchema,
    DictTypeCreateSchema,
    DictTypeQuerySchema,
    DictTypeUpdateSchema,
)
from .service import DictDataService, DictTypeService

DictTypeRouter = APIRouter(prefix="/dict/type", tags=["字典类型"])
DictDataRouter = APIRouter(prefix="/dict/data", tags=["字典数据"])


@DictTypeRouter.get("/list", summary="字典类型列表(分页)")
async def get_dict_type_list(
    query: Annotated[DictTypeQuerySchema, Depends()],
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    crud = DictTypeCRUD(auth, db)
    items, total = await crud.list(
        page_no=int(query.page_no),
        page_size=int(query.page_size),
        dict_name=query.dict_name,
        dict_type=query.dict_type,
        status=int(query.status) if query.status is not None else None,
    )
    result = PageResultSchema(
        page_no=int(query.page_no),
        page_size=int(query.page_size),
        total=total,
        items=[DictTypeService._to_dict(t) for t in items],
    )
    return SuccessResponse(data=result.model_dump())


@DictTypeRouter.get("/{type_id}", summary="字典类型详情")
async def get_dict_type_detail(
    type_id: int,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    obj = await DictTypeCRUD(auth, db).get_by_id(type_id)
    if not obj:
        from app.common.enums import RET
        from app.core.exceptions import CustomException
        raise CustomException(msg="字典类型不存在", code=RET.NOT_FOUND.code, status_code=404)
    return SuccessResponse(data=DictTypeService._to_dict(obj))


@DictTypeRouter.post("", summary="创建字典类型")
async def create_dict_type(
    data: DictTypeCreateSchema,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await DictTypeService(auth, db).create(data)
    return SuccessResponse(data=result, msg="创建成功")


@DictTypeRouter.put("/{type_id}", summary="更新字典类型")
async def update_dict_type(
    type_id: int,
    data: DictTypeUpdateSchema,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await DictTypeService(auth, db).update(type_id, data)
    return SuccessResponse(data=result, msg="更新成功")


@DictTypeRouter.delete("/{type_id}", summary="删除字典类型")
async def delete_dict_type(
    type_id: int,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    await DictTypeService(auth, db).delete(type_id)
    return SuccessResponse(msg="删除成功")


@DictDataRouter.get("/list", summary="字典数据列表(分页)")
async def get_dict_data_list(
    query: Annotated[DictDataQuerySchema, Depends()],
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    crud = DictDataCRUD(auth, db)
    items, total = await crud.list(
        page_no=int(query.page_no),
        page_size=int(query.page_size),
        dict_label=query.dict_label,
        dict_type=query.dict_type,
        status=int(query.status) if query.status is not None else None,
    )
    result = PageResultSchema(
        page_no=int(query.page_no),
        page_size=int(query.page_size),
        total=total,
        items=[DictDataService._to_dict(d) for d in items],
    )
    return SuccessResponse(data=result.model_dump())


@DictDataRouter.get("/type/{dict_type}", summary="根据字典类型查询数据")
async def get_dict_data_by_type(
    dict_type: str,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await DictDataService(auth, db).get_by_type(dict_type)
    return SuccessResponse(data=result)


@DictDataRouter.get("/{data_id}", summary="字典数据详情")
async def get_dict_data_detail(
    data_id: int,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    obj = await DictDataCRUD(auth, db).get_by_id(data_id)
    if not obj:
        from app.common.enums import RET
        from app.core.exceptions import CustomException
        raise CustomException(msg="字典数据不存在", code=RET.NOT_FOUND.code, status_code=404)
    return SuccessResponse(data=DictDataService._to_dict(obj))


@DictDataRouter.post("", summary="创建字典数据")
async def create_dict_data(
    data: DictDataCreateSchema,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await DictDataService(auth, db).create(data)
    return SuccessResponse(data=result, msg="创建成功")


@DictDataRouter.put("/{data_id}", summary="更新字典数据")
async def update_dict_data(
    data_id: int,
    data: DictDataUpdateSchema,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    result = await DictDataService(auth, db).update(data_id, data)
    return SuccessResponse(data=result, msg="更新成功")


@DictDataRouter.delete("/{data_id}", summary="删除字典数据")
async def delete_dict_data(
    data_id: int,
    db: Annotated[AsyncSession, Depends(db_getter)],
    auth: Annotated[AuthSchema, Depends(get_current_user)],
) -> JSONResponse:
    await DictDataService(auth, db).delete(data_id)
    return SuccessResponse(msg="删除成功")
