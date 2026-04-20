from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.database import users_collection
from app.models.user import User, UserCreate, UserLogin, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate):
    # Check if user exists
    if users_collection.find_one({"username": user_in.username}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user
    user_dict = {
        "_id": str(uuid.uuid4()),
        "username": user_in.username,
        "email": user_in.email,
        "hashed_password": get_password_hash(user_in.password),
        "is_active": True,
        "is_admin": False,
        "created_at": datetime.utcnow()
    }
    
    users_collection.insert_one(user_dict)
    
    return {
        "id": user_dict["_id"],
        "username": user_dict["username"],
        "is_admin": user_dict["is_admin"],
        "created_at": user_dict["created_at"]
    }

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # OAuth2 standard login (Form data for Swagger and typical OAuth2 clients)
    user = users_collection.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "is_admin": user.get("is_admin", False)},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "username": user["username"],
            "is_admin": user.get("is_admin", False)
        }
    }

# ============ ADMIN MANAGEMENT ============
from app.core.security import get_current_user
from typing import List

@router.get("/users", response_model=List[UserResponse])
async def list_users(current_user: User = Depends(get_current_user)):
    """Liste tous les comptes administrateurs (Sécurisé)"""
    users = []
    for user in users_collection.find():
        users.append({
            "id": str(user["_id"]),
            "username": user["username"],
            "is_admin": user.get("is_admin", False),
            "created_at": user.get("created_at")
        })
    return users

@router.delete("/users/{username}")
async def delete_user(username: str, current_user: User = Depends(get_current_user)):
    """Supprime un compte administrateur (Sécurisé)"""
    if username == current_user.username:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    result = users_collection.delete_one({"username": username})
    if result.deleted_count:
        return {"message": f"User {username} deleted successfully"}
    
    raise HTTPException(status_code=404, detail="User not found")
