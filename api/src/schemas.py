from typing import List, Dict
from pydantic import BaseModel, ConfigDict, Field

class KeypointsInput(BaseModel):
    sequence: List[List[float]] = Field(..., description="Array of shape (30, 1662) representing keypoints")

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    probabilities: Dict[str, float]


class SignRecord(BaseModel):
    """Una seña tal como está escrita en src/data/signs.json."""

    model_config = ConfigDict(protected_namespaces=())

    id: str = Field(..., description="Identificador estable, sin tildes ni espacios")
    word: str = Field(..., description="Palabra tal como se le muestra al usuario")
    aliases: List[str] = Field(default_factory=list, description="Sinónimos que resuelven a esta seña")
    video: str = Field(..., description="Nombre del archivo de video, sin ruta")
    description: str = Field(..., description="Cómo se ejecuta la seña")
    model_action: str | None = Field(
        default=None,
        alias="modelAction",
        description="Etiqueta equivalente en ACTIONS del modelo LSTM, o null si aún no la reconoce",
    )


class Sign(BaseModel):
    """Una seña tal como la devuelve la API, con la URL de video ya resuelta."""

    model_config = ConfigDict(protected_namespaces=())

    id: str
    word: str
    aliases: List[str]
    video_url: str = Field(..., serialization_alias="videoUrl")
    description: str
    model_action: str | None = Field(default=None, serialization_alias="modelAction")


class SignsResponse(BaseModel):
    total: int = Field(..., description="Cantidad de señas en el catálogo")
    signs: List[Sign]
