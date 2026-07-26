"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { formatMeetingCode } from "@/lib/format";
import {
  clearJoinedState,
  consumePendingDisplayName,
  getJoinedState,
  setJoinedState,
} from "@/lib/joinSession";
import { useAuth } from "@/context/AuthContext";
import { useWebRTC } from "@/hooks/useWebRTC";
import type { Meeting, Participant } from "@/lib/types";
import VideoTile from "@/components/meeting/VideoTile";
import Controls from "@/components/meeting/Controls";
import ParticipantList from "@/components/meeting/ParticipantList";

type RoomPhase = "checking" | "not-found" | "meeting-ended" | "lobby" | "connecting" | "in-call" | "left";

export default function MeetingRoomPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const router = useRouter();
  const { user } = useAuth();

  const [phase, setPhase] = useState<RoomPhase>("checking");
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);

  const rtc = useWebRTC(phase === "in-call" ? code : null, participant?.id ?? null, localStream);

  // Resolve entry point: already-joined (New Meeting), pending name (from /join), or fresh lobby.
  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      try {
        const meetingData = await api.getMeeting(code);
        if (cancelled) return;
        setMeeting(meetingData);

        if (meetingData.status === "ended") {
          setPhase("meeting-ended");
          return;
        }

        const joined = getJoinedState(code);
        if (joined) {
          setParticipant({ id: joined.participantId, display_name: joined.displayName, role: "host", is_muted: false });
          setDisplayName(joined.displayName);
          setPhase("connecting");
          return;
        }

        const pendingName = consumePendingDisplayName(code);
        setDisplayName(pendingName || user?.name || "");
        setPhase("lobby");
      } catch (err) {
        if (!cancelled) {
          setPhase(err instanceof ApiError && err.status === 404 ? "not-found" : "not-found");
        }
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Acquire camera/mic for the lobby preview (and keep it for the call once joined).
  useEffect(() => {
    if (phase !== "lobby" || localStream) return;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        setLocalStream(stream);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't access your camera/microphone. Check browser permissions and try again.");
      });

    return () => {
      cancelled = true;
    };
  }, [phase, localStream]);

  // "connecting" path: participant already exists server-side (host via New Meeting) — just grab media and go live.
  useEffect(() => {
    if (phase !== "connecting") return;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        setLocalStream(stream);
        setPhase("in-call");
      })
      .catch(() => {
        if (!cancelled) {
          setError("Couldn't access your camera/microphone. Check browser permissions and try again.");
          setPhase("lobby");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [phase]);

  useEffect(() => {
    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleJoinFromLobby() {
    if (!displayName.trim()) {
      setError("Enter your name to join.");
      return;
    }
    setError(null);
    try {
      const res = await api.joinMeeting(code, displayName.trim());
      setJoinedState(code, { participantId: res.participant.id, displayName: displayName.trim() });
      setParticipant(res.participant);
      setPhase("in-call");
    } catch (err) {
      if (err instanceof ApiError && err.status === 410) {
        setPhase("meeting-ended");
      } else {
        setError("Couldn't join the meeting. Please try again.");
      }
    }
  }

  function toggleMute() {
    const next = !isMuted;
    setIsMuted(next);
    localStream?.getAudioTracks().forEach((t) => (t.enabled = !next));
    if (phase === "in-call") rtc.sendMediaStatus(next, isCameraOff);
  }

  function toggleCamera() {
    const next = !isCameraOff;
    setIsCameraOff(next);
    localStream?.getVideoTracks().forEach((t) => (t.enabled = !next));
    if (phase === "in-call") rtc.sendMediaStatus(isMuted, next);
  }

  function handleLeave() {
    rtc.leave();
    localStream?.getTracks().forEach((t) => t.stop());
    clearJoinedState(code);
    setPhase("left");
    router.push("/");
  }

  const remoteParticipants = useMemo(() => Object.values(rtc.participants), [rtc.participants]);
  const isHost = participant?.role === "host";

  if (phase === "checking") {
    return <CenteredMessage title="Loading meeting…" />;
  }

  if (phase === "not-found") {
    return <CenteredMessage title="Meeting not found" subtitle="Double-check the Meeting ID or invite link." />;
  }

  if (phase === "meeting-ended") {
    return <CenteredMessage title="This meeting has ended" subtitle="Ask the host for a new invite link." />;
  }

  if (phase === "lobby" || phase === "connecting") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zoom-gray-900 px-4 py-10 text-white">
        <h1 className="mb-1 text-lg font-semibold">{meeting?.title}</h1>
        <p className="mb-6 font-mono text-sm text-zoom-gray-300">
          {meeting ? formatMeetingCode(meeting.code) : ""}
        </p>

        <div className="w-full max-w-md">
          <VideoTile name={displayName || "You"} stream={localStream} muted={isMuted} cameraOff={isCameraOff} isLocal />

          <div className="mt-3 flex justify-center gap-3">
            <button
              type="button"
              onClick={toggleMute}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                isMuted ? "bg-zoom-red text-white" : "bg-zoom-gray-800 text-white hover:bg-zoom-gray-700"
              }`}
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button
              type="button"
              onClick={toggleCamera}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                isCameraOff ? "bg-zoom-red text-white" : "bg-zoom-gray-800 text-white hover:bg-zoom-gray-700"
              }`}
            >
              {isCameraOff ? "Start Video" : "Stop Video"}
            </button>
          </div>

          {phase === "lobby" && (
            <>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="mt-4 w-full rounded-md border border-zoom-gray-700 bg-zoom-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-zoom-blue"
              />
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              <button
                type="button"
                onClick={handleJoinFromLobby}
                className="mt-4 w-full rounded-md bg-zoom-blue py-2.5 text-sm font-semibold text-white transition hover:bg-zoom-blue-dark"
              >
                Join Meeting
              </button>
            </>
          )}

          {phase === "connecting" && (
            <p className="mt-4 text-center text-sm text-zoom-gray-300">Connecting…</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-zoom-gray-900 text-white">
      <header className="flex items-center justify-between border-b border-zoom-gray-800 px-4 py-2.5">
        <div>
          <p className="text-sm font-semibold">{meeting?.title}</p>
          <p className="font-mono text-xs text-zoom-gray-400">{meeting ? formatMeetingCode(meeting.code) : ""}</p>
        </div>
        <button
          type="button"
          onClick={() => meeting && navigator.clipboard.writeText(meeting.invite_link)}
          className="rounded-md border border-zoom-gray-700 px-3 py-1.5 text-xs font-medium text-zoom-gray-200 hover:border-zoom-blue hover:text-zoom-blue"
        >
          Copy Invite Link
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <VideoTile
              name={displayName || "You"}
              stream={localStream}
              muted={isMuted}
              cameraOff={isCameraOff}
              isLocal
              isHost={isHost}
            />
            {remoteParticipants.map((p) => (
              <VideoTile
                key={p.id}
                name={p.name}
                stream={p.stream}
                muted={p.muted}
                cameraOff={p.cameraOff}
                isHost={p.role === "host"}
              />
            ))}
          </div>
        </main>

        {showParticipants && (
          <ParticipantList
            self={{ name: displayName, muted: isMuted, isHost }}
            remoteParticipants={remoteParticipants}
            onClose={() => setShowParticipants(false)}
          />
        )}
      </div>

      <Controls
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onLeave={handleLeave}
        participantCount={remoteParticipants.length + 1}
        onToggleParticipants={() => setShowParticipants((v) => !v)}
      />
    </div>
  );
}

function CenteredMessage({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zoom-gray-900 px-4 text-center text-white">
      <h1 className="text-lg font-semibold">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-zoom-gray-400">{subtitle}</p>}
    </div>
  );
}
