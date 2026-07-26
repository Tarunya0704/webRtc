from dataclasses import dataclass
from typing import Dict, List, Optional

from fastapi import WebSocket


@dataclass
class ConnectionInfo:
    websocket: WebSocket
    display_name: str
    role: str
    muted: bool
    camera_off: bool


class SignalingManager:
    """In-memory registry of live WebSocket connections per meeting room.

    Single-process only (fine for this app's dev/single-worker deployment) —
    a multi-worker deployment would need a shared store (e.g. Redis) instead.
    """

    def __init__(self) -> None:
        self._rooms: Dict[str, Dict[int, ConnectionInfo]] = {}

    def connect(
        self,
        code: str,
        participant_id: int,
        websocket: WebSocket,
        display_name: str,
        role: str,
        muted: bool,
    ) -> None:
        room = self._rooms.setdefault(code, {})
        room[participant_id] = ConnectionInfo(
            websocket=websocket,
            display_name=display_name,
            role=role,
            muted=muted,
            camera_off=False,
        )

    def disconnect(self, code: str, participant_id: int) -> None:
        room = self._rooms.get(code)
        if not room:
            return
        room.pop(participant_id, None)
        if not room:
            self._rooms.pop(code, None)

    def update_status(self, code: str, participant_id: int, muted: bool, camera_off: bool) -> None:
        room = self._rooms.get(code)
        if not room or participant_id not in room:
            return
        room[participant_id].muted = muted
        room[participant_id].camera_off = camera_off

    def get_roster(self, code: str, exclude_id: Optional[int] = None) -> List[dict]:
        room = self._rooms.get(code, {})
        return [
            {
                "id": pid,
                "name": info.display_name,
                "role": info.role,
                "muted": info.muted,
                "camera_off": info.camera_off,
            }
            for pid, info in room.items()
            if pid != exclude_id
        ]

    def room_size(self, code: str) -> int:
        return len(self._rooms.get(code, {}))

    async def send_to(self, code: str, participant_id: int, message: dict) -> None:
        room = self._rooms.get(code)
        if not room or participant_id not in room:
            return
        await room[participant_id].websocket.send_json(message)

    async def broadcast(self, code: str, message: dict, exclude_id: Optional[int] = None) -> None:
        room = self._rooms.get(code, {})
        for pid, info in list(room.items()):
            if pid == exclude_id:
                continue
            try:
                await info.websocket.send_json(message)
            except Exception:
                # Peer socket already gone; its own disconnect handler will clean it up.
                pass


manager = SignalingManager()
