import json
import uuid

from fastapi import HTTPException
from sqlalchemy import text


# ============================================================
# INTERNAL HELPER
# ============================================================

def _get_project(
    db,
    project_id: str,
    user_id: str,
):
    project = db.execute(
        text(
            """
            SELECT
                id,
                state,
                version
            FROM projects
            WHERE id = :project_id
              AND user_id = :user_id
            """
        ),
        {
            "project_id": project_id,
            "user_id": user_id,
        },
    ).mappings().first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return project


def _save_project_state(
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
            RETURNING
                id,
                version,
                state
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

    return result


def _find_clip(
    state,
    track_id: str,
    clip_id: str,
):
    tracks = state.get(
        "tracks",
        [],
    )

    for track in tracks:
        if track.get("id") != track_id:
            continue

        for clip in track.get(
            "clips",
            [],
        ):
            if clip.get("id") == clip_id:
                return track, clip

    raise HTTPException(
        status_code=404,
        detail="Clip not found",
    )


# ============================================================
# ADD EFFECT
# ============================================================

def add_effect(
    db,
    project_id: str,
    user_id: str,
    track_id: str,
    clip_id: str,
    effect_type: str,
    parameters: dict | None = None,
):
    project = _get_project(
        db,
        project_id,
        user_id,
    )

    state = project["state"]

    _, clip = _find_clip(
        state,
        track_id,
        clip_id,
    )

    effect = {
        "id": str(
            uuid.uuid4()
        ),
        "type": effect_type,
        "enabled": True,
        "parameters":
            parameters or {},
    }

    effects = clip.setdefault(
        "effects",
        [],
    )

    effects.append(
        effect
    )

    updated_project = (
        _save_project_state(
            db,
            project_id,
            user_id,
            state,
        )
    )

    return {
        "success": True,
        "effect": effect,
        "project": {
            "id":
                str(
                    updated_project["id"]
                ),
            "version":
                updated_project["version"],
            "state":
                updated_project["state"],
        },
    }


# ============================================================
# UPDATE EFFECT PARAMETERS
# ============================================================

def update_effect(
    db,
    project_id: str,
    user_id: str,
    track_id: str,
    clip_id: str,
    effect_id: str,
    parameters: dict,
):
    project = _get_project(
        db,
        project_id,
        user_id,
    )

    state = project["state"]

    _, clip = _find_clip(
        state,
        track_id,
        clip_id,
    )

    effects = clip.get(
        "effects",
        [],
    )

    found = False

    for effect in effects:
        if effect.get("id") == effect_id:
            effect["parameters"] = (
                parameters
            )

            found = True
            break

    if not found:
        raise HTTPException(
            status_code=404,
            detail="Effect not found",
        )

    updated_project = (
        _save_project_state(
            db,
            project_id,
            user_id,
            state,
        )
    )

    return {
        "success": True,
        "project": {
            "id":
                str(
                    updated_project["id"]
                ),
            "version":
                updated_project["version"],
            "state":
                updated_project["state"],
        },
    }


# ============================================================
# TOGGLE EFFECT
# ============================================================

def toggle_effect(
    db,
    project_id: str,
    user_id: str,
    track_id: str,
    clip_id: str,
    effect_id: str,
    enabled: bool,
):
    project = _get_project(
        db,
        project_id,
        user_id,
    )

    state = project["state"]

    _, clip = _find_clip(
        state,
        track_id,
        clip_id,
    )

    effects = clip.get(
        "effects",
        [],
    )

    found = False

    for effect in effects:
        if effect.get("id") == effect_id:
            effect["enabled"] = (
                enabled
            )

            found = True
            break

    if not found:
        raise HTTPException(
            status_code=404,
            detail="Effect not found",
        )

    updated_project = (
        _save_project_state(
            db,
            project_id,
            user_id,
            state,
        )
    )

    return {
        "success": True,
        "project": {
            "id":
                str(
                    updated_project["id"]
                ),
            "version":
                updated_project["version"],
            "state":
                updated_project["state"],
        },
    }


# ============================================================
# DELETE EFFECT
# ============================================================

def delete_effect(
    db,
    project_id: str,
    user_id: str,
    track_id: str,
    clip_id: str,
    effect_id: str,
):
    project = _get_project(
        db,
        project_id,
        user_id,
    )

    state = project["state"]

    _, clip = _find_clip(
        state,
        track_id,
        clip_id,
    )

    effects = clip.get(
        "effects",
        [],
    )

    updated_effects = [
        effect
        for effect in effects
        if effect.get("id")
        != effect_id
    ]

    if (
        len(updated_effects)
        ==
        len(effects)
    ):
        raise HTTPException(
            status_code=404,
            detail="Effect not found",
        )

    clip["effects"] = (
        updated_effects
    )

    updated_project = (
        _save_project_state(
            db,
            project_id,
            user_id,
            state,
        )
    )

    return {
        "success": True,
        "project": {
            "id":
                str(
                    updated_project["id"]
                ),
            "version":
                updated_project["version"],
            "state":
                updated_project["state"],
        },
    }


# ============================================================
# REORDER EFFECTS
# ============================================================

def reorder_effects(
    db,
    project_id: str,
    user_id: str,
    track_id: str,
    clip_id: str,
    effect_ids: list[str],
):
    project = _get_project(
        db,
        project_id,
        user_id,
    )

    state = project["state"]

    _, clip = _find_clip(
        state,
        track_id,
        clip_id,
    )

    effects = clip.get(
        "effects",
        [],
    )

    effect_map = {
        effect["id"]: effect
        for effect in effects
    }

    if (
        set(effect_ids)
        !=
        set(effect_map.keys())
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Effect list does not "
                "match current clip effects"
            ),
        )

    clip["effects"] = [
        effect_map[effect_id]
        for effect_id
        in effect_ids
    ]

    updated_project = (
        _save_project_state(
            db,
            project_id,
            user_id,
            state,
        )
    )

    return {
        "success": True,
        "project": {
            "id":
                str(
                    updated_project["id"]
                ),
            "version":
                updated_project["version"],
            "state":
                updated_project["state"],
        },
    }