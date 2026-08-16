import uuid

from fastapi import HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from utils.password import hash_password


def register_user(
    db: Session,
    name: str,
    email: str,
    password: str
):
    # Normalize email
    email = email.strip().lower()

    # Check whether user already exists
    existing_user = db.execute(
        text(
            """
            SELECT id
            FROM users
            WHERE email = :email
            """
        ),
        {
            "email": email
        }
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = hash_password(password)

    # Generate UUID
    user_id = str(uuid.uuid4())

    # Insert user
    db.execute(
        text(
            """
            INSERT INTO users (
                id,
                email,
                password_hash,
                name
            )
            VALUES (
                :id,
                :email,
                :password_hash,
                :name
            )
            """
        ),
        {
            "id": user_id,
            "email": email,
            "password_hash": hashed_password,
            "name": name
        }
    )

    db.commit()

    return {
        "id": user_id,
        "email": email,
        "name": name
    }