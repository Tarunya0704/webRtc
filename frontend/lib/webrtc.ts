import type { ParticipantRole } from "@/lib/types";

export const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

export type SignalMessage =
  | { type: "room-state"; participants: RosterEntry[] }
  | { type: "participant-joined"; participant: RosterEntry }
  | { type: "offer"; from: number; to: number; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; from: number; to: number; sdp: RTCSessionDescriptionInit }
  | { type: "ice-candidate"; from: number; to: number; candidate: RTCIceCandidateInit }
  | { type: "media-status"; from: number; muted: boolean; camera_off: boolean }
  | { type: "participant-left"; participant_id: number }
  | { type: "force-mute" }
  | { type: "removed" }
  | { type: "error"; message: string };

export interface RosterEntry {
  id: number;
  name: string;
  role: ParticipantRole;
  muted: boolean;
  camera_off: boolean;
}

export interface RemoteParticipant {
  id: number;
  name: string;
  role: ParticipantRole;
  muted: boolean;
  cameraOff: boolean;
  stream: MediaStream | null;
}

export function buildSignalingUrl(code: string, participantId: number): string {
  const base = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
  return `${base}/ws/meetings/${code}?participant_id=${participantId}`;
}
