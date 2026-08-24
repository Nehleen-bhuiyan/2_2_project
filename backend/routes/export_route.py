from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from config.db import get_db

from middleware.auth import (
    get_current_user,
)

from controllers.export import (
    export_project,
)


router = APIRouter()


@router.post(
    "/projects/{project_id}/export"
)
def export_project_route(
    project_id: str,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        get_current_user
    ),
):
    return export_project(
        db=db,

        project_id=
            project_id,

        user_id=str(
            current_user["id"]
        ),
    )