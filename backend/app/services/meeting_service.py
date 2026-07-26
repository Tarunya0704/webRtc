import random
from typing import List

from sqlalchemy.orm import Session

from app.config import settings
from app.models.meeting import Meeting, MeetingStatus
from app.models.user import User

CODE_LENGTH = 11
MAX_CODE_ATTEMPTS = 5


def generate_unique_code(db: Session) -> str:
    for _ in range(MAX_CODE_ATTEMPTS):
        code = "".join(random.choices("0123456789", k=CODE_LENGTH))
        exists = db.query(Meeting).filter(Meeting.code == code).first()
        if not exists:
            return code
    raise RuntimeError("Failed to generate a unique meeting code, please retry")


def build_invite_link(code: str) -> str:
    return "{}/meeting/{}".format(settings.frontend_url.rstrip("/"), code)


def to_meeting_out_dict(meeting: Meeting) -> dict:
    return {
        "id": meeting.id,
        "code": meeting.code,
        "title": meeting.title,
        "description": meeting.description,
        "meeting_type": meeting.meeting_type,
        "status": meeting.status,
        "host_id": meeting.host_id,
        "host_name": meeting.host.name if meeting.host else None,
        "scheduled_at": meeting.scheduled_at,
        "duration_minutes": meeting.duration_minutes,
        "started_at": meeting.started_at,
        "ended_at": meeting.ended_at,
        "created_at": meeting.created_at,
        "invite_link": build_invite_link(meeting.code),
    }


def get_upcoming_meetings(db: Session, user: User) -> List[Meeting]:
    return (
        db.query(Meeting)
        .filter(Meeting.host_id == user.id, Meeting.status == MeetingStatus.scheduled)
        .order_by(Meeting.scheduled_at.asc())
        .all()
    )


def get_recent_meetings(db: Session, user: User, limit: int = 10) -> List[Meeting]:
    return (
        db.query(Meeting)
        .filter(Meeting.host_id == user.id, Meeting.status == MeetingStatus.ended)
        .order_by(Meeting.ended_at.desc())
        .limit(limit)
        .all()
    )
