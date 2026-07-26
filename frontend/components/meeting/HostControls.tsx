"use client";

interface HostControlsProps {
  onMuteAll: () => void;
}

export default function HostControls({ onMuteAll }: HostControlsProps) {
  return (
    <button
      type="button"
      onClick={onMuteAll}
      className="flex h-11 items-center gap-1.5 rounded-full bg-zoom-gray-800 px-4 text-sm font-medium text-white transition hover:bg-zoom-gray-700"
      title="Mute all participants"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" fill="currentColor" />
        <path d="M19 11a7 7 0 0 1-14 0M12 18v3" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
        <path d="M4 4l16 16" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      </svg>
      Mute All
    </button>
  );
}
