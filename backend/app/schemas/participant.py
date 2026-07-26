from pydantic import BaseModel, ConfigDict

from app.models.participant import ParticipantRole


class ParticipantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    display_name: str
    role: ParticipantRole
    is_muted: bool
