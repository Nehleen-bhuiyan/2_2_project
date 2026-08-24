from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.db import get_db
from middleware.auth import get_current_user

from controllers.project import (
    create_project,
    get_all_projects,
    get_project_by_id,
    update_project_state
)

from schemas.project import (
    CreateProjectRequest,
    UpdateProjectStateRequest,
)



router = APIRouter()


@router.post("/projects")
def create_project_route(
    data: CreateProjectRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return create_project(
        db=db,
        user_id=str(current_user["id"]),
        name=data.name
    )


@router.get("/projects")
def get_projects_route(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_all_projects(
        db=db,
        user_id=str(current_user["id"])
    )


@router.get("/projects/{project_id}")
def get_project_route(
    project_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_project_by_id(
        db=db,
        user_id=str(current_user["id"]),
        project_id=project_id
    )

@router.patch("/projects/{project_id}/state")
def update_project_state_route(
    project_id: str,
    data: UpdateProjectStateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return update_project_state(
        db=db,
        project_id=project_id,
        user_id=str(current_user["id"]),
        state=data.state,
    )