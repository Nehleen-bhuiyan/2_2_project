import json
import uuid

from fastapi import HTTPException
from sqlalchemy import text


# ============================================================
# EFFECTIVE DURATION HELPER
# ============================================================

def calculate_rendered_duration(
    clip: dict,
) -> float:
    """
    Calculate the duration that should be shown
    on the timeline after applying all enabled
    effects.

    source duration:
        sourceEnd - sourceStart

    Effects that change duration:
        slow
        speedUp
        echo
        reverb

    Other effects keep duration unchanged.
    """

    source_start = float(
        clip.get(
            "sourceStart",
            0.0,
        )
    )

    source_end = float(
        clip.get(
            "sourceEnd",
            source_start,
        )
    )


    duration = max(
        0.0,
        source_end -
        source_start,
    )


    effects = clip.get(
        "effects",
        [],
    )


    for effect in effects:

        # Ignore disabled effects
        if not effect.get(
            "enabled",
            True,
        ):
            continue


        effect_type = effect.get(
            "type"
        )


        params = effect.get(
            "parameters",
            {},
        )


        value = params.get(
            "value"
        )


        # ======================================
        # SLOW
        # ======================================

        if effect_type == "slow":

            rate = float(
                value
                if value is not None
                else 0.75
            )


            if rate > 0:
                duration = (
                    duration /
                    rate
                )


        # ======================================
        # SPEED UP
        # ======================================

        elif effect_type == "speedUp":

            rate = float(
                value
                if value is not None
                else 1.25
            )


            if rate > 0:
                duration = (
                    duration /
                    rate
                )


        # ======================================
        # ECHO
        # ======================================

        elif effect_type == "echo":

            delay = float(
                params.get(
                    "delay",
                    0.35,
                )
            )


            repeats = int(
                params.get(
                    "repeats",
                    3,
                )
            )


            duration += (
                delay *
                repeats
            )


        # ======================================
        # REVERB
        # ======================================

        elif effect_type == "reverb":

            tail_duration = float(
                params.get(
                    "duration",
                    1.5,
                )
            )


            duration += (
                tail_duration
            )


    return max(
        0.0,
        duration,
    )


# ============================================================
# INTERNAL: GET PROJECT
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
            "project_id":
                project_id,

            "user_id":
                user_id,
        },
    ).mappings().first()


    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )


    return project


# ============================================================
# INTERNAL: FIND CLIP
# ============================================================

def _find_clip(
    state: dict,
    track_id: str,
    clip_id: str,
):
    for track in state.get(
        "tracks",
        [],
    ):

        if (
            track.get("id")
            != track_id
        ):
            continue


        for clip in track.get(
            "clips",
            [],
        ):

            if (
                clip.get("id")
                == clip_id
            ):
                return (
                    track,
                    clip,
                )


    raise HTTPException(
        status_code=404,
        detail="Clip not found",
    )


# ============================================================
# INTERNAL: SAVE PROJECT
# ============================================================

def _save_project_state(
    db,
    project_id: str,
    user_id: str,
    state: dict,
):
    updated = db.execute(
        text(
            """
            UPDATE projects

            SET
                state =
                    CAST(:state AS JSONB),

                version =
                    version + 1,

                updated_at =
                    NOW()

            WHERE id =
                    :project_id

              AND user_id =
                    :user_id

            RETURNING
                id,
                state,
                version
            """
        ),
        {
            "project_id":
                project_id,

            "user_id":
                user_id,

            "state":
                json.dumps(
                    state
                ),
        },
    ).mappings().first()


    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )


    db.commit()


    return updated


# ============================================================
# ADD / APPLY EFFECT
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
    """
    Add one effect to the selected clip.

    Also recalculates renderedDuration
    so the frontend can immediately resize
    the clip on the timeline.
    """

    # ========================================
    # LOAD PROJECT
    # ========================================

    project = _get_project(
        db,
        project_id,
        user_id,
    )


    state = project[
        "state"
    ]


    # ========================================
    # FIND CLIP
    # ========================================

    _, clip = _find_clip(
        state,
        track_id,
        clip_id,
    )


    # ========================================
    # CREATE EFFECT
    # ========================================

    effect = {
        "id":
            str(
                uuid.uuid4()
            ),

        "type":
            effect_type,

        "enabled":
            True,

        "parameters":
            parameters or {},
    }


    # ========================================
    # ADD EFFECT TO CLIP
    # ========================================

    effects = clip.setdefault(
        "effects",
        [],
    )


    effects.append(
        effect
    )


    # ========================================
    # RECALCULATE RENDERED DURATION
    # ========================================

    clip[
        "renderedDuration"
    ] = calculate_rendered_duration(
        clip
    )


    # ========================================
    # SAVE PROJECT
    # ========================================

    updated_project = (
        _save_project_state(
            db,
            project_id,
            user_id,
            state,
        )
    )


    # ========================================
    # RESPONSE
    # ========================================

    return {
        "success":
            True,

        "effect":
            effect,

        "clip": {
            "id":
                clip["id"],

            "renderedDuration":
                clip[
                    "renderedDuration"
                ],

            "effects":
                clip.get(
                    "effects",
                    [],
                ),
        },

        "project": {
            "id":
                str(
                    updated_project[
                        "id"
                    ]
                ),

            "version":
                updated_project[
                    "version"
                ],

            "state":
                updated_project[
                    "state"
                ],
        },
    }


# ============================================================
# REMOVE EFFECT
# ============================================================

def delete_effect(
    db,
    project_id: str,
    user_id: str,
    track_id: str,
    clip_id: str,
    effect_id: str,
):
    """
    Remove one effect from a clip.

    Then recalculate renderedDuration from
    scratch using the remaining effects.
    """

    # ========================================
    # LOAD PROJECT
    # ========================================

    project = _get_project(
        db,
        project_id,
        user_id,
    )


    state = project[
        "state"
    ]


    # ========================================
    # FIND CLIP
    # ========================================

    _, clip = _find_clip(
        state,
        track_id,
        clip_id,
    )


    current_effects = clip.get(
        "effects",
        [],
    )


    # ========================================
    # REMOVE EFFECT
    # ========================================

    updated_effects = [
        effect

        for effect
        in current_effects

        if effect.get(
            "id"
        ) != effect_id
    ]


    # If length did not change,
    # effect was not found.

    if (
        len(updated_effects)
        ==
        len(current_effects)
    ):
        raise HTTPException(
            status_code=404,
            detail="Effect not found",
        )


    clip[
        "effects"
    ] = updated_effects


    # ========================================
    # RECALCULATE RENDERED DURATION
    # ========================================

    clip[
        "renderedDuration"
    ] = calculate_rendered_duration(
        clip
    )


    # ========================================
    # SAVE PROJECT
    # ========================================

    updated_project = (
        _save_project_state(
            db,
            project_id,
            user_id,
            state,
        )
    )


    # ========================================
    # RESPONSE
    # ========================================

    return {
        "success":
            True,

        "deletedEffectId":
            effect_id,

        "clip": {
            "id":
                clip["id"],

            "renderedDuration":
                clip[
                    "renderedDuration"
                ],

            "effects":
                clip.get(
                    "effects",
                    [],
                ),
        },

        "project": {
            "id":
                str(
                    updated_project[
                        "id"
                    ]
                ),

            "version":
                updated_project[
                    "version"
                ],

            "state":
                updated_project[
                    "state"
                ],
        },
    }