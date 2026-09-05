from .router import api_router
from core.config import settings
from fastapi import FastAPI

def create_app()-> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.api_version
    )

    app.include_router(api_router)
    return app