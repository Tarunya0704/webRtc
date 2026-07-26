"use client";

import { useEffect, useRef, useState } from "react";
import { useSignaling } from "@/hooks/useSignaling";
import { ICE_SERVERS, RemoteParticipant, SignalMessage } from "@/lib/webrtc";

interface UseWebRTCOptions {
  onForceMute?: () => void;
  onRemoved?: () => void;
  onMeetingEnded?: () => void;
}

export function useWebRTC(
  code: string | null,
  participantId: number | null,
  localStream: MediaStream | null,
  options: UseWebRTCOptions = {}
) {
  const [participants, setParticipants] = useState<Record<number, RemoteParticipant>>({});
  const peersRef = useRef<Record<number, RTCPeerConnection>>({});
  const localStreamRef = useRef<MediaStream | null>(localStream);
  localStreamRef.current = localStream;

  const sendRef = useRef<(msg: Record<string, unknown>) => void>(() => {});
  const optionsRef = useRef(options);
  optionsRef.current = options;

  function createPeerConnection(peerId: number): RTCPeerConnection {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current as MediaStream);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendRef.current({ type: "ice-candidate", to: peerId, candidate: event.candidate.toJSON() });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0] ?? null;
      setParticipants((prev) => {
        const existing = prev[peerId];
        if (!existing) return prev;
        return { ...prev, [peerId]: { ...existing, stream } };
      });
    };

    peersRef.current[peerId] = pc;
    return pc;
  }

  function closePeerConnection(peerId: number) {
    const pc = peersRef.current[peerId];
    if (pc) {
      pc.close();
      delete peersRef.current[peerId];
    }
  }

  const handleMessageRef = useRef<(msg: SignalMessage) => void>(() => {});
  handleMessageRef.current = async function handleMessage(msg: SignalMessage) {
    switch (msg.type) {
      case "room-state": {
        const roster: Record<number, RemoteParticipant> = {};
        for (const p of msg.participants) {
          roster[p.id] = {
            id: p.id,
            name: p.name,
            role: p.role,
            muted: p.muted,
            cameraOff: p.camera_off,
            stream: null,
          };
        }
        setParticipants(roster);

        for (const p of msg.participants) {
          const pc = createPeerConnection(p.id);
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendRef.current({ type: "offer", to: p.id, sdp: offer });
          } catch (err) {
            console.error("Failed to create offer for peer", p.id, err);
          }
        }
        break;
      }

      case "participant-joined": {
        const p = msg.participant;
        setParticipants((prev) => ({
          ...prev,
          [p.id]: {
            id: p.id,
            name: p.name,
            role: p.role,
            muted: p.muted,
            cameraOff: p.camera_off,
            stream: null,
          },
        }));
        break;
      }

      case "offer": {
        const pc = peersRef.current[msg.from] ?? createPeerConnection(msg.from);
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendRef.current({ type: "answer", to: msg.from, sdp: answer });
        } catch (err) {
          console.error("Failed to handle offer from", msg.from, err);
        }
        break;
      }

      case "answer": {
        const pc = peersRef.current[msg.from];
        if (pc) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          } catch (err) {
            console.error("Failed to apply answer from", msg.from, err);
          }
        }
        break;
      }

      case "ice-candidate": {
        const pc = peersRef.current[msg.from];
        if (pc && msg.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
          } catch (err) {
            console.error("Failed to add ICE candidate from", msg.from, err);
          }
        }
        break;
      }

      case "media-status": {
        setParticipants((prev) => {
          const existing = prev[msg.from];
          if (!existing) return prev;
          return { ...prev, [msg.from]: { ...existing, muted: msg.muted, cameraOff: msg.camera_off } };
        });
        break;
      }

      case "participant-left": {
        closePeerConnection(msg.participant_id);
        setParticipants((prev) => {
          const next = { ...prev };
          delete next[msg.participant_id];
          return next;
        });
        break;
      }

      case "force-mute": {
        optionsRef.current.onForceMute?.();
        break;
      }

      case "removed": {
        optionsRef.current.onRemoved?.();
        break;
      }

      case "meeting-ended": {
        optionsRef.current.onMeetingEnded?.();
        break;
      }

      default:
        break;
    }
  };

  const { connected, send } = useSignaling(code, participantId, (msg) => handleMessageRef.current(msg));
  sendRef.current = send;

  useEffect(() => {
    return () => {
      Object.keys(peersRef.current).forEach((id) => closePeerConnection(Number(id)));
      peersRef.current = {};
    };
  }, [code, participantId]);

  function sendMediaStatus(muted: boolean, cameraOff: boolean) {
    send({ type: "media-status", muted, camera_off: cameraOff });
  }

  function hostMuteAll() {
    send({ type: "host-mute-all" });
  }

  function hostRemove(targetId: number) {
    send({ type: "host-remove", target: targetId });
  }

  function leave() {
    send({ type: "leave" });
    Object.keys(peersRef.current).forEach((id) => closePeerConnection(Number(id)));
    peersRef.current = {};
  }

  return { participants, connected, sendMediaStatus, hostMuteAll, hostRemove, leave };
}
