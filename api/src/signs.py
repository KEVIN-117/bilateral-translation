import json
from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter

from src.config import settings
from src.schemas import Sign, SignRecord, SignsResponse

DATA_FILE = Path(__file__).parent / "data" / "signs.json"

signs_router = APIRouter(prefix="/api/v1", tags=["Dictionary"])


@lru_cache(maxsize=1)
def load_catalog() -> tuple[Sign, ...]:
    """
    Lee y valida el catálogo una sola vez.

    La URL del video se arma aquí y no se guarda en el archivo: mover los
    videos a un CDN es cambiar SIGNS_VIDEO_BASE_URL, sin tocar los datos.
    """
    raw = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    records = [SignRecord.model_validate(item) for item in raw["signs"]]

    ids = [record.id for record in records]
    duplicates = {sign_id for sign_id in ids if ids.count(sign_id) > 1}
    if duplicates:
        raise ValueError(f"Ids duplicados en {DATA_FILE.name}: {sorted(duplicates)}")

    base_url = settings.signs_video_base_url.rstrip("/")

    return tuple(
        Sign(
            id=record.id,
            word=record.word,
            aliases=record.aliases,
            video_url=f"{base_url}/{record.video}",
            description=record.description,
            model_action=record.model_action,
        )
        for record in records
    )


@signs_router.get(
    "/signs",
    response_model=SignsResponse,
    summary="Catálogo de señas soportadas",
)
def list_signs() -> SignsResponse:
    """
    Devuelve todas las señas disponibles con la URL de su video demostrativo.
    """
    signs = load_catalog()
    return SignsResponse(total=len(signs), signs=list(signs))
