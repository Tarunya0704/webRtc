"use client";

import { useRef, useState } from "react";

interface HostControlsProps {
  onMuteAll: () => void;
  onEndMeeting: () => void;
}

export default function HostControls({ onMuteAll, onEndMeeting }: HostControlsProps) {
  const [justMuted, setJustMuted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMuteAll() {
    onMuteAll();
    setJustMuted(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setJustMuted(false), 2000);
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={handleMuteAll}
        className={`flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition ${
          justMuted ? "bg-zoom-green text-white" : "bg-zoom-gray-800 text-white hover:bg-zoom-gray-700"
        }`}
        title="Mute all participants"
      >
        {justMuted ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" fill="currentColor" />
            <path d="M19 11a7 7 0 0 1-14 0M12 18v3" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
            <path d="M4 4l16 16" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          </svg>
        )}
        {justMuted ? "Muted All" : "Mute All"}
      </button>

      <button
        type="button"
        onClick={onEndMeeting}
        className="flex h-11 items-center gap-1.5 rounded-full border border-zoom-red px-4 text-sm font-medium text-zoom-red transition hover:bg-zoom-red hover:text-white"
        title="End meeting for everyone"
      >
        End for All
      </button>
    </div>
  );
}
