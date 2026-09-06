import api
from fastapi import HTTPException
from api.ai import KeypointsInput
from .service import UserService
from .schema import UserCreate, UserResponse
from .dependency import get_user_service
from fastapi import APIRouter, Depends, status
import numpy as np

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_use(
    data: UserCreate,
    service: UserService = Depends(get_user_service)
):
    return await service.create_user(data)


@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
async def get_user(user_id: int, service: UserService = Depends(get_user_service)):
    return await service.get_user(user_id)

ACTIONS = np.array(['hello', 'thanks', 'iloveyou'])

@router.post("/predict")
def predict(input_data: KeypointsInput):
    if api.model is None:
        raise HTTPException(status_code=500, detail="El modelo no esta cargado")
    
    data = np.array(input_data.sequence)

    if data.shape != (30, 1662):
        raise HTTPException(
            status_code=400, 
            detail=f"Dimensiones incorrectas. Se esperaba (30, 1662), recibido {data.shape}"
        )

    input_tensor = np.expand_dims(data, axis=0)

    predictions = api.model.predict(input_tensor, verbose=0)[0]

    predicted_index = int(np.argmax(predictions))

    predicted_action = ACTIONS[predicted_index]
    confidence = float(predictions[predicted_index])

    return {
        "prediction": predicted_action,
        "confidence": round(confidence, 4),
        "probabilities": {
            action: round(float(prob), 4) 
            for action, prob in zip(ACTIONS, predictions)
        }
    }