from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.meeting import MeetingOut
from app.services import meeting_service

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


@router.get("/upcoming", response_model=List[MeetingOut])
def upcoming_meetings(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    meetings = meeting_service.get_upcoming_meetings(db, current_user)
    return [meeting_service.to_meeting_out_dict(m) for m in meetings]


@router.get("/recent", response_model=List[MeetingOut])
def recent_meetings(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    meetings = meeting_service.get_recent_meetings(db, current_user)
    return [meeting_service.to_meeting_out_dict(m) for m in meetings]
