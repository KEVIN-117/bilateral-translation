from fastapi import FastAPI
from contextlib import asynccontextmanager
from src.config import settings
from src.ml import inference_model
from src.router import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Cargar el modelo al iniciar
    inference_model.load(settings.model_path)
    yield
    # Limpiar recursos si es necesario al apagar
    inference_model.model = None

app = FastAPI(
    title=settings.app_name,
    version=settings.api_version,
    lifespan=lifespan
)

app.include_router(router)