from typing import List, Dict
from pydantic import BaseModel, Field

class KeypointsInput(BaseModel):
    sequence: List[List[float]] = Field(..., description="Array of shape (30, 1662) representing keypoints")

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    probabilities: Dict[str, float]
