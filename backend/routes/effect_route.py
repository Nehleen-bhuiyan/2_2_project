from typing import Any

from fastapi import (
    APIRouter,
    Depends,
)

from pydantic import BaseModel
from sqlalchemy.orm import Session

from config.db import get_db

from middleware.auth import (
    get_current_user,
)

from controllers.effect import (
    add_effect,
    update_effect,
    toggle_effect,
    delete_effect,
    reorder_effects,
)


router = APIRouter()


# ============================================================
# REQUEST MODELS
# ============================================================
from pydantic import (
    BaseModel,
    Field,
)

class AddEffectRequest(BaseModel):
    type: str

    parameters: dict[
        str,
        Any
    ] = Field(
        default_factory=dict
    )


class UpdateEffectRequest(BaseModel):
    parameters: dict[
        str,
        Any
    ]


class ToggleEffectRequest(BaseModel):
    enabled: bool


class ReorderEffectsRequest(BaseModel):
    effect_ids: list[str]


# ============================================================
# ADD EFFECT
# ============================================================

@router.post(
    "/projects/{project_id}/tracks/{track_id}/clips/{clip_id}/effects"
)
def add_effect_route(
    project_id: str,
    track_id: str,
    clip_id: str,
    data: AddEffectRequest,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        get_current_user
    ),
):
    return add_effect(
        db=db,

        project_id=
            project_id,

        user_id=str(
            current_user["id"]
        ),

        track_id=
            track_id,

        clip_id=
            clip_id,

        effect_type=
            data.type,

        parameters=
            data.parameters,
    )


# ============================================================
# UPDATE EFFECT
# ============================================================

@router.patch(
    "/projects/{project_id}/tracks/{track_id}/clips/{clip_id}/effects/{effect_id}"
)
def update_effect_route(
    project_id: str,
    track_id: str,
    clip_id: str,
    effect_id: str,
    data: UpdateEffectRequest,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        get_current_user
    ),
):
    return update_effect(
        db=db,

        project_id=
            project_id,

        user_id=str(
            current_user["id"]
        ),

        track_id=
            track_id,

        clip_id=
            clip_id,

        effect_id=
            effect_id,

        parameters=
            data.parameters,
    )


# ============================================================
# ENABLE / DISABLE EFFECT
# ============================================================

@router.patch(
    "/projects/{project_id}/tracks/{track_id}/clips/{clip_id}/effects/{effect_id}/enabled"
)
def toggle_effect_route(
    project_id: str,
    track_id: str,
    clip_id: str,
    effect_id: str,
    data: ToggleEffectRequest,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        get_current_user
    ),
):
    return toggle_effect(
        db=db,

        project_id=
            project_id,

        user_id=str(
            current_user["id"]
        ),

        track_id=
            track_id,

        clip_id=
            clip_id,

        effect_id=
            effect_id,

        enabled=
            data.enabled,
    )


# ============================================================
# DELETE EFFECT
# ============================================================

@router.delete(
    "/projects/{project_id}/tracks/{track_id}/clips/{clip_id}/effects/{effect_id}"
)
def delete_effect_route(
    project_id: str,
    track_id: str,
    clip_id: str,
    effect_id: str,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        get_current_user
    ),
):
    return delete_effect(
        db=db,

        project_id=
            project_id,

        user_id=str(
            current_user["id"]
        ),

        track_id=
            track_id,

        clip_id=
            clip_id,

        effect_id=
            effect_id,
    )


# ============================================================
# REORDER EFFECTS
# ============================================================

@router.patch(
    "/projects/{project_id}/tracks/{track_id}/clips/{clip_id}/effects/reorder"
)
def reorder_effects_route(
    project_id: str,
    track_id: str,
    clip_id: str,
    data: ReorderEffectsRequest,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        get_current_user
    ),
):
    return reorder_effects(
        db=db,

        project_id=
            project_id,

        user_id=str(
            current_user["id"]
        ),

        track_id=
            track_id,

        clip_id=
            clip_id,

        effect_ids=
            data.effect_ids,
    )