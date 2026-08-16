# routes/login_route.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.db import get_db
from controllers.login import login_user
from schemas.login import LoginRequest


router = APIRouter()


@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    result = login_user(
        db=db,
        email=data.email,
        password=data.password,
    )

    return {
        "success": True,
        "message": "Login successful",
        **result,
    }