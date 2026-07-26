"use client";

import type { ReactNode } from "react";

interface ControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onLeave: () => void;
  participantCount: number;
  onToggleParticipants?: () => void;
  hostControls?: ReactNode;
}

function MicIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" fill="currentColor" />
      <path d="M19 11a7 7 0 0 1-14 0M12 18v3" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
      {off && <path d="M4 4l16 16" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />}
    </svg>
  );
}

function CameraIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M3 7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        fill="currentColor"
      />
      <path d="m16 10 5-3v10l-5-3v-4Z" fill="currentColor" />
      {off && <path d="M2 2l20 20" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />}
    </svg>
  );
}

export default function Controls({
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onLeave,
  participantCount,
  onToggleParticipants,
  hostControls,
}: ControlsProps) {
  return (
    <div className="flex items-center justify-start gap-2 overflow-x-auto border-t border-zoom-gray-800 bg-zoom-gray-900 px-3 py-3 sm:justify-center sm:gap-3 sm:px-4">
      <button
        type="button"
        onClick={onToggleMute}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
          isMuted ? "bg-zoom-red text-white" : "bg-zoom-gray-800 text-white hover:bg-zoom-gray-700"
        }`}
        title={isMuted ? "Unmute" : "Mute"}
      >
        <MicIcon off={isMuted} />
      </button>

      <button
        type="button"
        onClick={onToggleCamera}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
          isCameraOff ? "bg-zoom-red text-white" : "bg-zoom-gray-800 text-white hover:bg-zoom-gray-700"
        }`}
        title={isCameraOff ? "Start Video" : "Stop Video"}
      >
        <CameraIcon off={isCameraOff} />
      </button>

      {onToggleParticipants && (
        <button
          type="button"
          onClick={onToggleParticipants}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-zoom-gray-800 px-4 text-sm font-medium text-white transition hover:bg-zoom-gray-700"
          title="Participants"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
            />
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth={1.8} />
          </svg>
          {participantCount}
        </button>
      )}

      {hostControls && <span className="shrink-0">{hostControls}</span>}

      <button
        type="button"
        onClick={onLeave}
        className="ml-2 flex h-11 shrink-0 items-center rounded-full bg-zoom-red px-5 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        Leave
      </button>
    </div>
  );
}
