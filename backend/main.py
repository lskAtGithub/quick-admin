import uvicorn

from app.config.setting import settings

if __name__ == "__main__":
    uvicorn.run(
        app="app:create_app",
        factory=True,
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.DEBUG,
    )
