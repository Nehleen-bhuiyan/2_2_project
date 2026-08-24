# routes/audio_route.py

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
)
from sqlalchemy.orm import Session

from config.db import get_db
from middleware.auth import get_current_user

from controllers.audio import (
    upload_project_audio,
    get_audio_file,
)

router = APIRouter()


@router.post("/projects/{project_id}/audio")
def upload_audio_route(
    project_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return upload_project_audio(
        db=db,
        project_id=project_id,
        user_id=str(current_user["id"]),
        file=file,
    )

@router.get("/audio/{audio_id}")
def get_audio_route(
    audio_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_audio_file(
        db=db,
        audio_id=audio_id,
        user_id=str(current_user["id"])
    )