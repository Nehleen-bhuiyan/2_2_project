from pydantic import BaseModel, Field
from typing import Any

class CreateProjectRequest(BaseModel):
    name: str = Field(
        default="Untitled Project",
        min_length=1,
        max_length=255
    )

class UpdateProjectStateRequest(BaseModel):
    state: dict[str, Any]