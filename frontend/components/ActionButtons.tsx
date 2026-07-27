"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setJoinedState } from "@/lib/joinSession";

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
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
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
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
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
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

function CircleAction({
  icon,
  label,
  colorClass,
  onClick,
  href,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  colorClass: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}) {
  const circle = (
    <span
      className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-card transition sm:h-[72px] sm:w-[72px] ${colorClass} ${
        disabled ? "opacity-70" : ""
      }`}
    >
      {icon}
    </span>
  );

  const content = (
    <div className="flex flex-col items-center gap-2">
      {circle}
      <span className="text-sm font-medium text-zoom-gray-800">{label}</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex flex-col items-center">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className="flex flex-col items-center">
      {content}
    </button>
  );
}

export default function ActionButtons() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  async function handleNewMeeting() {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const { meeting, participant } = await api.createInstantMeeting();
      setJoinedState(meeting.code, { participantId: participant.id, displayName: participant.display_name });
      router.push(`/meeting/${meeting.code}`);
    } catch (err) {
      console.error("Failed to create instant meeting", err);
      window.alert("Couldn't start a meeting right now. Please try again.");
      setIsCreating(false);
    }
  }

  return (
    <div className="flex items-start justify-center gap-8 sm:gap-12">
      <CircleAction
        icon={<VideoIcon />}
        label={isCreating ? "Starting…" : "New Meeting"}
        colorClass="bg-orange-500 hover:bg-orange-600"
        onClick={handleNewMeeting}
        disabled={isCreating}
      />
      <CircleAction icon={<JoinIcon />} label="Join" colorClass="bg-zoom-blue hover:bg-zoom-blue-dark" href="/join" />
      <CircleAction
        icon={<ScheduleIcon />}
        label="Schedule"
        colorClass="bg-zoom-blue hover:bg-zoom-blue-dark"
        href="/schedule"
      />
    </div>
  );
}
