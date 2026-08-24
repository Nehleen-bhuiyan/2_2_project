import os
import shutil
import uuid

import soundfile as sf

from fastapi import HTTPException
from sqlalchemy import text

from dsp.render_project import render_project


def export_project(
    db,
    project_id: str,
    user_id: str,
):
    # ==========================================
    # GET PROJECT
    # ==========================================

    project = db.execute(
        text(
            """
            SELECT
                id,
                state,
                version,
                name
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
    # COLLECT AUDIO FILE IDS
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
                detail=f"Audio {audio_id} not found",
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
    # RENDER FINAL PROJECT
    # ==========================================

    try:
        samples, sample_rate = render_project(
            project_state=state,
            audio_records=audio_records,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


    # ==========================================
    # PATHS
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

    final_dir = os.path.join(
        backend_dir,
        "storage",
        "finals",
        user_id,
        project_id,
    )

    os.makedirs(
        final_dir,
        exist_ok=True,
    )


    # ==========================================
    # OPTIONAL:
    # REMOVE PREVIOUS FINAL FILE
    # ==========================================

    for filename in os.listdir(
        final_dir
    ):
        file_path = os.path.join(
            final_dir,
            filename,
        )

        if os.path.isfile(
            file_path
        ):
            os.remove(
                file_path
            )


    # ==========================================
    # SAVE FINAL WAV
    # ==========================================

    final_filename = (
        f"final_v{project['version']}_"
        f"{uuid.uuid4()}.wav"
    )

    final_path = os.path.join(
        final_dir,
        final_filename,
    )

    sf.write(
        final_path,
        samples,
        sample_rate,
    )


    # ==========================================
    # DELETE ALL PREVIEWS
    # ==========================================

    if os.path.exists(
        preview_dir
    ):
        shutil.rmtree(
            preview_dir
        )

    # Recreate empty folder only if you want.
    # Not necessary.
    #
    # os.makedirs(
    #     preview_dir,
    #     exist_ok=True,
    # )


    # ==========================================
    # DELETE PREVIEW DATABASE ROWS
    # ==========================================

    db.execute(
        text(
            """
            DELETE FROM audio_files
            WHERE project_id = :project_id
              AND user_id = :user_id
              AND file_type = 'PREVIEW'
            """
        ),
        {
            "project_id": project_id,
            "user_id": user_id,
        },
    )


    # ==========================================
    # REMOVE OLD FINAL DB ROW
    # ==========================================

    db.execute(
        text(
            """
            DELETE FROM audio_files
            WHERE project_id = :project_id
              AND user_id = :user_id
              AND file_type = 'FINAL'
            """
        ),
        {
            "project_id": project_id,
            "user_id": user_id,
        },
    )


    # ==========================================
    # SAVE FINAL AUDIO RECORD
    # ==========================================

    final_id = str(
        uuid.uuid4()
    )

    db.execute(
        text(
            """
            INSERT INTO audio_files (
                id,
                user_id,
                project_id,
                storage_key,
                original_name,
                file_type,
                project_version,
                duration,
                sample_rate,
                channels,
                format,
                is_final
            )
            VALUES (
                :id,
                :user_id,
                :project_id,
                :storage_key,
                :original_name,
                'FINAL',
                :project_version,
                :duration,
                :sample_rate,
                :channels,
                :format,
                TRUE
            )
            """
        ),
        {
            "id": final_id,
            "user_id": user_id,
            "project_id": project_id,
            "storage_key": final_path,
            "original_name":
                f"{project['name']}.wav",
            "project_version":
                project["version"],
            "duration":
                len(samples)
                / sample_rate,
            "sample_rate":
                sample_rate,
            "channels":
                samples.shape[1],
            "format":
                "wav",
        },
    )

    db.commit()


    # ==========================================
    # RETURN URL
    # ==========================================

    final_url = (
        "http://127.0.0.1:8000"
        f"/storage/finals/"
        f"{user_id}/"
        f"{project_id}/"
        f"{final_filename}"
    )

    return {
        "success": True,

        "audio": {
            "id": final_id,

            "url":
                final_url,

            "duration":
                len(samples)
                / sample_rate,

            "sample_rate":
                sample_rate,

            "channels":
                samples.shape[1],

            "format":
                "wav",

            "is_final":
                True,

            "project_version":
                project["version"],
        },
    }