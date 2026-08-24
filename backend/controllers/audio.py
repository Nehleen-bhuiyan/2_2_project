

import uuid
import json

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from utils.storage import save_raw_audio
from utils.audio_metadata import get_audio_metadata


def upload_project_audio(
    db: Session,
    project_id: str,
    user_id: str,
    file,
):
    # ------------------------------------------------
    # 1. Verify project belongs to logged-in user
    # ------------------------------------------------

    project = db.execute(
        text(
            """
            SELECT id, state, version
            FROM projects
            WHERE id = :project_id
              AND user_id = :user_id
            """
        ),
        {
            "project_id": project_id,
            "user_id": user_id,
        }
    ).mappings().first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # ------------------------------------------------
    # 2. Save uploaded file locally
    # ------------------------------------------------

    file_path = save_raw_audio(
        file=file,
        user_id=user_id,
        project_id=project_id,
    )

    # ------------------------------------------------
    # 3. Extract metadata
    # ------------------------------------------------

    metadata = get_audio_metadata(file_path)

    # ------------------------------------------------
    # 4. Create audio_files row
    # ------------------------------------------------

    audio_id = str(uuid.uuid4())

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
                'RAW',
                :project_version,
                :duration,
                :sample_rate,
                :channels,
                :format,
                FALSE
            )
            """
        ),
        {
            "id": audio_id,
            "user_id": user_id,
            "project_id": project_id,
            "storage_key": file_path,
            "original_name": file.filename,
            "project_version": project["version"],
            "duration": metadata["duration"],
            "sample_rate": metadata["sample_rate"],
            "channels": metadata["channels"],
            "format": metadata["format"],
        }
    )

    # ------------------------------------------------
    # 5. Load current project state
    # ------------------------------------------------

    state = project["state"]

    # Depending on driver/config, JSONB may already be dict.
    if isinstance(state, str):
        state = json.loads(state)

    if not state:
        state = {
            "tracks": []
        }

    if "tracks" not in state:
        state["tracks"] = []

    # ------------------------------------------------
    # 6. Create Track object
    # ------------------------------------------------

    track_id = str(uuid.uuid4())

    track_number = len(state["tracks"]) + 1

    new_track = {
        "id": track_id,
        "name": f"Track {track_number}",
        "position": len(state["tracks"]),
        "volume": 1.0,
        "muted": False,
        "solo": False,
        "clips": []
    }

    # ------------------------------------------------
    # 7. Create Clip object
    # ------------------------------------------------

    clip_id = str(uuid.uuid4())

    new_clip = {
        "id": clip_id,

        "audioFileId": audio_id,

        "originalName": file.filename,
        "sourceStart": 0.0,
        "sourceEnd": metadata["duration"],

        "timelineStart": 0.0,

        "volume": 1.0,
        "fadeIn": 0.0,
        "fadeOut": 0.0,

        "effects": []
    }

    # Add clip to track
    new_track["clips"].append(new_clip)

    # Add track to project
    state["tracks"].append(new_track)

    # ------------------------------------------------
    # 8. Increment project version
    # ------------------------------------------------

    new_version = project["version"] + 1

    # ------------------------------------------------
    # 9. Save updated JSONB state
    # ------------------------------------------------

    db.execute(
        text(
            """
            UPDATE projects
            SET state = CAST(:state AS JSONB),
                version = :version,
                updated_at = NOW()
            WHERE id = :project_id
              AND user_id = :user_id
            """
        ),
        {
            "state": json.dumps(state),
            "version": new_version,
            "project_id": project_id,
            "user_id": user_id,
        }
    )

    # ------------------------------------------------
    # 10. Commit everything together
    # ------------------------------------------------

    db.commit()

    # ------------------------------------------------
    # 11. Return audio + updated project state
    # ------------------------------------------------

    return {
        "success": True,

        "audio": {
            "id": audio_id,
            "original_name": file.filename,
            "storage_key": file_path,
            "duration": metadata["duration"],
            "sample_rate": metadata["sample_rate"],
            "channels": metadata["channels"],
            "format": metadata["format"],
        },

        "track": new_track,

        "project": {
            "id": project_id,
            "version": new_version,
            "state": state,
        }
    }


def get_audio_file(
    db,
    audio_id: str,
    user_id: str
):
    audio = db.execute(
        text(
            """
            SELECT
                id,
                project_id,
                storage_key,
                original_name,
                duration,
                sample_rate,
                channels,
                format,
                file_type
            FROM audio_files
            WHERE id = :audio_id
              AND user_id = :user_id
            """
        ),
        {
            "audio_id": audio_id,
            "user_id": user_id,
        }
    ).mappings().first()

    if not audio:
        raise HTTPException(
            status_code=404,
            detail="Audio file not found"
        )

    return {
        "success": True,
        "audio": {
            "id": str(audio["id"]),
            "project_id": str(audio["project_id"]),
            "storage_key": audio["storage_key"],
            "original_name": audio["original_name"],
            "duration": audio["duration"],
            "sample_rate": audio["sample_rate"],
            "channels": audio["channels"],
            "format": audio["format"],
            "file_type": audio["file_type"],
        }
    }