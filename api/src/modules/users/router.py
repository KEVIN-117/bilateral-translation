from .service import UserService
from .schema import UserCreate, UserResponse
from .dependency import get_user_service
from fastapi import APIRouter, Depends, status

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