from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.db import get_db
from controllers.register import register_user
from schemas.register import RegisterRequest


router = APIRouter()


@router.post("/register", status_code=201)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    user = register_user(
        db=db,
        name=data.name,
        email=data.email,
        password=data.password
    )

    return {
        "success": True,
        "message": "User registered successfully",
        "user": user
    }