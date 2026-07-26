import enum
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class ParticipantRole(str, enum.Enum):
    host = "host"
    participant = "participant"


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    display_name = Column(String, nullable=False)
    role = Column(Enum(ParticipantRole), nullable=False, default=ParticipantRole.participant)
    is_muted = Column(Boolean, default=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    left_at = Column(DateTime, nullable=True)
    left_reason = Column(String, nullable=True)

    meeting = relationship("Meeting", back_populates="participants")
    user = relationship("User", back_populates="participations")
