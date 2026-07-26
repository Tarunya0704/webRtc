"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime, formatDuration, formatMeetingCode } from "@/lib/format";
import type { Meeting } from "@/lib/types";
import { api } from "@/lib/api";
import { setJoinedState } from "@/lib/joinSession";
import { useAuth } from "@/context/AuthContext";

export default function MeetingCard({ meeting }: { meeting: Meeting }) {
  const router = useRouter();
  const { user } = useAuth();
  const [isStarting, setIsStarting] = useState(false);
  const isUpcoming = meeting.status === "scheduled";
  const timestamp = isUpcoming ? meeting.scheduled_at : meeting.ended_at;

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(meeting.invite_link);
      window.alert("Invite link copied to clipboard.");
    } catch {
      window.prompt("Copy invite link:", meeting.invite_link);
    }
  }

  async function startMeeting() {
    if (isStarting || !user) return;
    setIsStarting(true);
    try {
      const { participant } = await api.startMeeting(meeting.code, user.name);
      setJoinedState(meeting.code, { participantId: participant.id, displayName: participant.display_name });
      router.push(`/meeting/${meeting.code}`);
    } catch {
      window.alert("Couldn't start the meeting. Please try again.");
      setIsStarting(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-zoom-gray-200 bg-white px-4 py-3 shadow-card">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-zoom-gray-900">{meeting.title}</p>
        <p className="mt-0.5 text-xs text-zoom-gray-600">
          {timestamp ? formatDateTime(timestamp) : "—"}
          {meeting.duration_minutes ? ` · ${formatDuration(meeting.duration_minutes)}` : ""}
        </p>
        <p className="mt-1 font-mono text-xs text-zoom-gray-600">
          {formatMeetingCode(meeting.code)}
        </p>
      </div>

      {isUpcoming ? (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={copyInviteLink}
            className="rounded-md border border-zoom-gray-200 px-3 py-1.5 text-xs font-semibold text-zoom-gray-700 transition hover:border-zoom-blue hover:text-zoom-blue"
          >
            Copy Link
          </button>
          <button
            type="button"
            onClick={startMeeting}
            disabled={isStarting}
            className="rounded-md bg-zoom-blue px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zoom-blue-dark disabled:opacity-60"
          >
            {isStarting ? "Starting…" : "Start"}
          </button>
        </div>
      ) : (
        <span className="shrink-0 rounded-full bg-zoom-gray-100 px-3 py-1 text-xs font-medium text-zoom-gray-600">
          Ended
        </span>
      )}
    </div>
  );
}
