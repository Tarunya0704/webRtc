from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.meeting import MeetingStatus, MeetingType
from app.schemas.participant import ParticipantOut


class MeetingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    title: str
    description: Optional[str] = None
    meeting_type: MeetingType
    status: MeetingStatus
    host_id: int
    host_name: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: datetime
    invite_link: str = ""


class ScheduleMeetingRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    scheduled_at: datetime
    duration_minutes: int = Field(gt=0, le=1440)


class JoinMeetingRequest(BaseModel):
    display_name: str = Field(min_length=1, max_length=100)


class JoinMeetingResponse(BaseModel):
    meeting: MeetingOut
    participant: ParticipantOut


class LeaveMeetingRequest(BaseModel):
    participant_id: int
