from fastapi import HTTPException, status

from .model import User
from .repository import UserRepository
from .schema import UserCreate
from security.password import hash_password


class UserService:

    def __init__(
        self,
        repository: UserRepository,
    ):
        self.repository = repository

    async def create_user(
        self,
        data: UserCreate,
    ) -> User:

        existing_user = await self.repository.get_by_email(
            data.email
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        user = User(
            username=data.username,
            email=data.email,
            password_hash=hash_password(data.password),
        )

        return await self.repository.create(user)

    async def get_user(
        self,
        user_id: int,
    ) -> User:

        user = await self.repository.get_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        return user