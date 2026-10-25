from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import uuid
import os

from app.database.database import get_db
from app.database.models import User
from app.schemas.schemas import UserCreate, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Security Configurations
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super_secure_random_jwt_secret_key_change_in_production_32chars")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/signup", response_model=dict)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        id=f"user_{uuid.uuid4().hex[:12]}",
        name=user.name,
        email=user.email,
        password_hash=get_password_hash(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.id})
    return {"token": f"Bearer {access_token}", "user": UserResponse.model_validate(new_user)}

@router.post("/login", response_model=dict)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.id}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"token": f"Bearer {access_token}", "user": UserResponse.model_validate(user)}