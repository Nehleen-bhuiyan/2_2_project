import os
import uuid

import soundfile as sf

from fastapi import HTTPException
from sqlalchemy import text

from dsp.render_project import (
    render_project,
)


def create_project_preview(
    db,
    project_id: str,
    user_id: str,
):
    # ==========================================
    # GET CURRENT PROJECT STATE
    # ==========================================

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

    state = project["state"]

    tracks = state.get(
        "tracks",
        [],
    )

    if not tracks:
        raise HTTPException(
            status_code=400,
            detail="Project has no tracks",
        )

    # ==========================================
    # COLLECT AUDIO IDS
    # ==========================================

    audio_ids = set()

    for track in tracks:
        for clip in track.get(
            "clips",
            [],
        ):
            audio_ids.add(
                clip["audioFileId"]
            )

    # ==========================================
    # LOAD AUDIO RECORDS
    # ==========================================

    audio_records = {}

    for audio_id in audio_ids:

        audio = db.execute(
            text(
                """
                SELECT
                    id,
                    storage_key,
                    sample_rate
                FROM audio_files
                WHERE id = :audio_id
                  AND user_id = :user_id
                """
            ),
            {
                "audio_id": audio_id,
                "user_id": user_id,
            },
        ).mappings().first()

        if not audio:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Audio {audio_id} "
                    f"not found"
                ),
            )

        audio_records[
            str(audio["id"])
        ] = {
            "storage_key":
                audio["storage_key"],

            "sample_rate":
                audio["sample_rate"],
        }

    # ==========================================
    # RENDER PROJECT
    # ==========================================

    try:
        samples, sample_rate = (
            render_project(
                project_state=state,
                audio_records=audio_records,
            )
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    # ==========================================
    # SAVE PREVIEW WAV
    # ==========================================

    backend_dir = os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )

    preview_dir = os.path.join(
        backend_dir,
        "storage",
        "previews",
        user_id,
        project_id,
    )

    os.makedirs(
        preview_dir,
        exist_ok=True,
    )

    filename = (
        f"preview_v"
        f"{project['version']}_"
        f"{uuid.uuid4()}.wav"
    )

    output_path = os.path.join(
        preview_dir,
        filename,
    )

    sf.write(
        output_path,
        samples,
        sample_rate,
    )

    preview_url = (
        "http://127.0.0.1:8000"
        f"/storage/previews/"
        f"{user_id}/"
        f"{project_id}/"
        f"{filename}"
    )

    return {
        "success": True,

        "preview_url":
            preview_url,

        "duration":
            len(samples)
            / sample_rate,

        "sample_rate":
            sample_rate,

        "version":
            project["version"],
    }