from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select

from app.auth import create_access_token, hash_password, verify_password
from app.db.database import SessionLocal
from app.models import User
from app.routers.common import commit_and_refresh

router = APIRouter(prefix="/auth")
READ_MODEL_CONFIG = ConfigDict(from_attributes=True)


class UserCredentials(BaseModel):
    username: str
    password: str


class UserRead(BaseModel):
    id: int
    username: str

    model_config = READ_MODEL_CONFIG


class AuthTokenRead(BaseModel):
    access_token: str
    token_type: str
    user: UserRead


@router.post("/signup", response_model=AuthTokenRead, status_code=201)
def signup(credentials: UserCredentials):
    username = credentials.username.strip()
    if not username or not credentials.password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    with SessionLocal() as session:
        existing_user = session.scalar(select(User).where(User.username == username))
        if existing_user is not None:
            raise HTTPException(status_code=400, detail="Username already exists")

        user = User(
            username=username,
            password_hash=hash_password(credentials.password),
        )
        session.add(user)
        commit_and_refresh(session, user)

    return AuthTokenRead(
        access_token=create_access_token(str(user.id)),
        token_type="bearer",
        user=user,
    )


@router.post("/login", response_model=AuthTokenRead)
def login(credentials: UserCredentials):
    username = credentials.username.strip()
    if not username or not credentials.password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    with SessionLocal() as session:
        user = session.scalar(select(User).where(User.username == username))
        if user is None or not verify_password(credentials.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid username or password")

    return AuthTokenRead(
        access_token=create_access_token(str(user.id)),
        token_type="bearer",
        user=user,
    )
