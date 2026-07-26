"use client";

import Link from "next/link";

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M3 7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        fill="currentColor"
      />
      <path d="m16 10 5-3v10l-5-3v-4Z" fill="currentColor" />
    </svg>
  );
}

function JoinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth={1.8} />
      <path
        d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}

function ScheduleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth={1.8}
      />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

export default function ActionButtons() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      <button
        type="button"
        onClick={() =>
          window.alert(
            "Instant meeting creation is coming in the next phase — this button will create a live meeting and drop you straight into the room."
          )
        }
        className="flex flex-col items-center justify-center gap-2 rounded-xl bg-zoom-blue px-4 py-5 text-white shadow-card transition hover:bg-zoom-blue-dark sm:col-span-1"
      >
        <VideoIcon />
        <span className="text-sm font-semibold">New Meeting</span>
      </button>

      <Link
        href="/join"
        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-zoom-gray-200 bg-white px-4 py-5 text-zoom-gray-800 shadow-card transition hover:border-zoom-blue hover:text-zoom-blue"
      >
        <JoinIcon />
        <span className="text-sm font-semibold">Join Meeting</span>
      </Link>

      <Link
        href="/schedule"
        className="col-span-2 flex flex-col items-center justify-center gap-2 rounded-xl border border-zoom-gray-200 bg-white px-4 py-5 text-zoom-gray-800 shadow-card transition hover:border-zoom-blue hover:text-zoom-blue sm:col-span-1"
      >
        <ScheduleIcon />
        <span className="text-sm font-semibold">Schedule</span>
      </Link>
    </div>
  );
}
