# controllers/project.py

import uuid
import json
from fastapi import HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session


def create_project(
    db: Session,
    user_id: str,
    name: str
):
    project_id = str(uuid.uuid4())

    name = name.strip()

    if not name:
        name = "Untitled Project"

    initial_state = '{"tracks": []}'

    result = db.execute(
        text(
            """
            INSERT INTO projects (
                id,
                user_id,
                name,
                state,
                version
            )
            VALUES (
                :id,
                :user_id,
                :name,
                CAST(:state AS JSONB),
                1
            )
            RETURNING
                id,
                user_id,
                name,
                state,
                version,
                created_at,
                updated_at
            """
        ),
        {
            "id": project_id,
            "user_id": user_id,
            "name": name,
            "state": initial_state,
        }
    ).mappings().first()

    db.commit()

    return {
        "message": "Project created successfully",
        "project": {
            "id": str(result["id"]),
            "name": result["name"],
            "state": result["state"],
            "version": result["version"],
            "created_at": result["created_at"],
            "updated_at": result["updated_at"],
        }
    }

from fastapi import HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session


def get_all_projects(
    db: Session,
    user_id: str
):
    results = db.execute(
        text(
            """
            SELECT
                id,
                name,
                state,
                version,
                created_at,
                updated_at
            FROM projects
            WHERE user_id = :user_id
            ORDER BY updated_at DESC
            """
        ),
        {
            "user_id": user_id
        }
    ).mappings().all()

    projects = []

    for project in results:
        projects.append({
            "id": str(project["id"]),
            "name": project["name"],
            "state": project["state"],
            "version": project["version"],
            "created_at": project["created_at"],
            "updated_at": project["updated_at"],
        })

    return {
        "success": True,
        "projects": projects
    }

def get_project_by_id(
    db: Session,
    user_id: str,
    project_id: str
):
    project = db.execute(
        text(
            """
            SELECT
                id,
                name,
                state,
                version,
                created_at,
                updated_at
            FROM projects
            WHERE id = :project_id
              AND user_id = :user_id
            """
        ),
        {
            "project_id": project_id,
            "user_id": user_id
        }
    ).mappings().first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return {
        "success": True,
        "project": {
            "id": str(project["id"]),
            "name": project["name"],
            "state": project["state"],
            "version": project["version"],
            "created_at": project["created_at"],
            "updated_at": project["updated_at"],
        }
    }



def update_project_state(
    db,
    project_id: str,
    user_id: str,
    state: dict,
):
    result = db.execute(
        text(
            """
            UPDATE projects
            SET
                state = CAST(:state AS JSONB),
                version = version + 1,
                updated_at = NOW()
            WHERE id = :project_id
              AND user_id = :user_id
            RETURNING version
            """
        ),
        {
            "project_id": project_id,
            "user_id": user_id,
            "state": json.dumps(state),
        },
    ).mappings().first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    db.commit()

    return {
        "success": True,
        "version": result["version"],
    }