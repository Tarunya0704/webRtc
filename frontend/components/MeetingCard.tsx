"use client";

import { formatDateTime, formatDuration, formatMeetingCode } from "@/lib/format";
import type { Meeting } from "@/lib/types";

export default function MeetingCard({ meeting }: { meeting: Meeting }) {
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
        <button
          type="button"
          onClick={copyInviteLink}
          className="shrink-0 rounded-md border border-zoom-gray-200 px-3 py-1.5 text-xs font-semibold text-zoom-gray-700 transition hover:border-zoom-blue hover:text-zoom-blue"
        >
          Copy Link
        </button>
      ) : (
        <span className="shrink-0 rounded-full bg-zoom-gray-100 px-3 py-1 text-xs font-medium text-zoom-gray-600">
          Ended
        </span>
      )}
    </div>
  );
}
