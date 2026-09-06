from fastapi import APIRouter
from src.schemas import KeypointsInput, PredictionResponse
from src.ml import inference_model

router = APIRouter(prefix="/api/v1", tags=["Prediction"])

@router.post("/predict", response_model=PredictionResponse)
def predict_action(input_data: KeypointsInput):
    """
    Recibe una secuencia de keypoints y devuelve la seña predicha.
    """
    return inference_model.predict(input_data)
