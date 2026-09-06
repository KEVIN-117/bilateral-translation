import tensorflow as tf

model = None

from .router import api_router
from core.config import settings
from fastapi import FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    model = tf.keras.models.load_model(settings.model_path)
    print("Modelo cargado exitosamente.")
    yield
    model = None

def create_app()-> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.api_version,
        lifespan=lifespan
    )

    app.include_router(api_router)
    return app