import random
from datetime import datetime
from typing import List, Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.models.meeting import Meeting, MeetingStatus, MeetingType
from app.models.participant import Participant, ParticipantRole
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


def get_by_code(db: Session, code: str) -> Optional[Meeting]:
    return db.query(Meeting).filter(Meeting.code == code).first()


def create_instant_meeting(db: Session, host: User) -> Tuple[Meeting, Participant]:
    now = datetime.utcnow()
    meeting = Meeting(
        code=generate_unique_code(db),
        title="{}'s Meeting".format(host.name),
        meeting_type=MeetingType.instant,
        status=MeetingStatus.active,
        host_id=host.id,
        started_at=now,
        created_at=now,
    )
    db.add(meeting)
    db.flush()

    participant = Participant(
        meeting_id=meeting.id,
        user_id=host.id,
        display_name=host.name,
        role=ParticipantRole.host,
        joined_at=now,
    )
    db.add(participant)
    db.commit()
    db.refresh(meeting)
    db.refresh(participant)
    return meeting, participant


def join_meeting(
    db: Session, meeting: Meeting, display_name: str, user: Optional[User]
) -> Participant:
    if meeting.status == MeetingStatus.ended:
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="This meeting has ended")

    if meeting.status == MeetingStatus.scheduled:
        meeting.status = MeetingStatus.active
        meeting.started_at = datetime.utcnow()

    role = (
        ParticipantRole.host
        if user is not None and user.id == meeting.host_id
        else ParticipantRole.participant
    )

    participant = Participant(
        meeting_id=meeting.id,
        user_id=user.id if user else None,
        display_name=display_name,
        role=role,
        joined_at=datetime.utcnow(),
    )
    db.add(participant)
    db.commit()
    db.refresh(meeting)
    db.refresh(participant)
    return participant


def leave_meeting(db: Session, participant_id: int, reason: str = "left") -> None:
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant or participant.left_at is not None:
        return

    participant.left_at = datetime.utcnow()
    participant.left_reason = reason
    db.commit()

    remaining = (
        db.query(Participant)
        .filter(Participant.meeting_id == participant.meeting_id, Participant.left_at.is_(None))
        .count()
    )
    if remaining == 0:
        meeting = db.query(Meeting).filter(Meeting.id == participant.meeting_id).first()
        if meeting and meeting.status != MeetingStatus.ended:
            meeting.status = MeetingStatus.ended
            meeting.ended_at = datetime.utcnow()
            db.commit()


def end_meeting(db: Session, meeting: Meeting) -> None:
    now = datetime.utcnow()
    meeting.status = MeetingStatus.ended
    meeting.ended_at = now
    db.query(Participant).filter(
        Participant.meeting_id == meeting.id, Participant.left_at.is_(None)
    ).update({"left_at": now, "left_reason": "host_ended"}, synchronize_session=False)
    db.commit()
