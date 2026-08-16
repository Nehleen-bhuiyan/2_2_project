# controllers/login.py

from fastapi import HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from utils.password import verify_password
from utils.jwt import create_access_token


def login_user(
    db: Session,
    email: str,
    password: str,
):
    email = email.strip().lower()

    result = db.execute(
        text(
            """
            SELECT id, email, name, password_hash
            FROM users
            WHERE email = :email
            """
        ),
        {
            "email": email
        }
    ).mappings().first()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(
        password,
        result["password_hash"],
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(
        str(result["id"])
    )
    print(token)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(result["id"]),
            "email": result["email"],
            "name": result["name"],
        },
    }