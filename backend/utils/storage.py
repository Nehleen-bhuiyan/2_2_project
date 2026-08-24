import os
import uuid
import shutil

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

UPLOAD_DIR = os.path.join(
    BASE_DIR,
    "storage",
    "uploads"
)


def save_raw_audio(
    file,
    user_id: str,
    project_id: str,
):
    extension = file.filename.split(".")[-1].lower()

    filename = f"{uuid.uuid4()}.{extension}"

    folder = os.path.join(
        UPLOAD_DIR,
        user_id,
        project_id
    )

    os.makedirs(folder, exist_ok=True)

    file_path = os.path.join(
        folder,
        filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    return file_path