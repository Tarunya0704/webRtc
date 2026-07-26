import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class MeetingType(str, enum.Enum):
    instant = "instant"
    scheduled = "scheduled"


class MeetingStatus(str, enum.Enum):
    scheduled = "scheduled"
    active = "active"
    ended = "ended"


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(11), unique=True, index=True, nullable=False)
    title = Column(String, nullable=False, default="Instant Meeting")
    description = Column(String, nullable=True)
    meeting_type = Column(Enum(MeetingType), nullable=False)
    status = Column(Enum(MeetingStatus), nullable=False, default=MeetingStatus.scheduled)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scheduled_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    host = relationship("User", back_populates="meetings_hosted")
    participants = relationship(
        "Participant", back_populates="meeting", cascade="all, delete-orphan"
    )
