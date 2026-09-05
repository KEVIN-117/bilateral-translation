from fastapi import APIRouter
from modules.users.router import router as users_router 
router = APIRouter(
    prefix="/v1",
)

router.include_router(users_router)