# routes/user_route.py

from fastapi import APIRouter, Depends

from middleware.auth import get_current_user


router = APIRouter()


@router.get("/me")
def get_me(
    current_user = Depends(get_current_user)
):
    return {
        "success": True,
        "user": current_user
    }