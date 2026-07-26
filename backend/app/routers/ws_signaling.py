from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.database import SessionLocal
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.services import meeting_service
from app.services.signaling_manager import manager

router = APIRouter()

RELAYED_TYPES = {"offer", "answer", "ice-candidate"}


@router.websocket("/ws/meetings/{code}")
async def meeting_socket(websocket: WebSocket, code: str, participant_id: int = Query(...)):
    await websocket.accept()
    db = SessionLocal()
    participant = None

    try:
        meeting = db.query(Meeting).filter(Meeting.code == code).first()
        if meeting:
            participant = (
                db.query(Participant)
                .filter(
                    Participant.id == participant_id,
                    Participant.meeting_id == meeting.id,
                    Participant.left_at.is_(None),
                )
                .first()
            )

        if not meeting or not participant:
            await websocket.send_json({"type": "error", "message": "Invalid meeting or participant"})
            await websocket.close(code=4404)
            return

        manager.connect(
            code, participant.id, websocket, participant.display_name, participant.role.value, participant.is_muted
        )

        roster = manager.get_roster(code, exclude_id=participant.id)
        await websocket.send_json({"type": "room-state", "participants": roster})

        await manager.broadcast(
            code,
            {
                "type": "participant-joined",
                "participant": {
                    "id": participant.id,
                    "name": participant.display_name,
                    "role": participant.role.value,
                    "muted": participant.is_muted,
                    "camera_off": False,
                },
            },
            exclude_id=participant.id,
        )

        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type in RELAYED_TYPES:
                target = data.get("to")
                if target is not None:
                    await manager.send_to(
                        code,
                        int(target),
                        {**data, "from": participant.id},
                    )

            elif msg_type == "media-status":
                muted = bool(data.get("muted", False))
                camera_off = bool(data.get("camera_off", False))
                manager.update_status(code, participant.id, muted, camera_off)
                participant.is_muted = muted
                db.commit()
                await manager.broadcast(
                    code,
                    {"type": "media-status", "from": participant.id, "muted": muted, "camera_off": camera_off},
                    exclude_id=participant.id,
                )

            elif msg_type == "leave":
                break

            else:
                await websocket.send_json({"type": "error", "message": "Unknown message type: {}".format(msg_type)})

    except WebSocketDisconnect:
        pass
    finally:
        if participant:
            manager.disconnect(code, participant.id)
            meeting_service.leave_meeting(db, participant.id, reason="left")
            await manager.broadcast(code, {"type": "participant-left", "participant_id": participant.id})
        db.close()
