from fastapi import UploadFile

from app.core.base_schema import UploadResponseSchema
from app.utils.upload_util import UploadUtil


class FileService:
    @staticmethod
    async def upload_service(base_url: str, file: UploadFile, upload_type: str) -> UploadResponseSchema:
        file_name, file_path, file_url = await UploadUtil.upload_file(
            file=file,
            base_url=base_url,
            upload_type=upload_type,
        )
        return UploadResponseSchema(
            file_name=file_name,
            file_path=str(file_path),
            file_url=file_url,
        )
