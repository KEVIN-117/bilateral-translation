from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.config import settings
from src.ml import inference_model
from src.router import router
from src.signs import load_catalog, signs_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Cargar el modelo al iniciar
    inference_model.load()
    # Validar el catálogo al arrancar y no en la primera petición
    load_catalog()
    yield
    # Limpiar recursos si es necesario al apagar
    inference_model.model = None

app = FastAPI(
    title=settings.app_name,
    version=settings.api_version,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(signs_router)