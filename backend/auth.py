import os
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from dotenv import load_dotenv
import bcrypt

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

bearer_scheme = HTTPBearer()


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def authenticate_admin(username: str, password: str) -> bool:
    """Check credentials against env vars."""
    return username == ADMIN_USERNAME and password == ADMIN_PASSWORD


def create_token(sub: str, role: str) -> str:
    """Create a JWT that expires in TOKEN_EXPIRE_HOURS."""
    payload = {
        "sub": sub,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def get_current_admin(creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    """FastAPI dependency — raises 401 if token is invalid or not admin."""
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
        username: str = payload.get("sub", "")
        if not username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

def get_current_student(creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    """FastAPI dependency — raises 401 if token is invalid."""
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[ALGORITHM])
        role = payload.get("role")
        if role not in ["student", "admin"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student privileges required")
        user_id_str: str = payload.get("sub", "")
        if not user_id_str:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user_id_str
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
