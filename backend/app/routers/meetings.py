from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_current_user_optional
from app.database import get_db
from app.models.user import User
from app.schemas.meeting import (
    JoinMeetingRequest,
    JoinMeetingResponse,
    LeaveMeetingRequest,
    MeetingOut,
)
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


@router.post("/instant", response_model=JoinMeetingResponse)
def create_instant_meeting(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    meeting, participant = meeting_service.create_instant_meeting(db, current_user)
    return JoinMeetingResponse(
        meeting=MeetingOut(**meeting_service.to_meeting_out_dict(meeting)),
        participant=participant,
    )


@router.get("/{code}", response_model=MeetingOut)
def get_meeting(code: str, db: Session = Depends(get_db)):
    meeting = meeting_service.get_by_code(db, code)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    return meeting_service.to_meeting_out_dict(meeting)


@router.post("/{code}/join", response_model=JoinMeetingResponse)
def join_meeting(
    code: str,
    payload: JoinMeetingRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    meeting = meeting_service.get_by_code(db, code)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    participant = meeting_service.join_meeting(db, meeting, payload.display_name, current_user)
    return JoinMeetingResponse(
        meeting=MeetingOut(**meeting_service.to_meeting_out_dict(meeting)),
        participant=participant,
    )


@router.post("/{code}/leave", status_code=status.HTTP_204_NO_CONTENT)
def leave_meeting(code: str, payload: LeaveMeetingRequest, db: Session = Depends(get_db)):
    meeting_service.leave_meeting(db, payload.participant_id, reason="left")


@router.post("/{code}/end", status_code=status.HTTP_204_NO_CONTENT)
def end_meeting(
    code: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    meeting = meeting_service.get_by_code(db, code)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    if meeting.host_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the host can end this meeting")
    meeting_service.end_meeting(db, meeting)
