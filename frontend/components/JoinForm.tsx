"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { extractMeetingCode } from "@/lib/format";
import { setPendingDisplayName } from "@/lib/joinSession";
import { useAuth } from "@/context/AuthContext";

export default function JoinForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [meetingInput, setMeetingInput] = useState("");
  const [displayName, setDisplayName] = useState(user?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const code = extractMeetingCode(meetingInput);
    if (!code) {
      setError("Enter a valid 11-digit Meeting ID or paste an invite link.");
      return;
    }
    if (!displayName.trim()) {
      setError("Enter your name to join.");
      return;
    }

    setIsSubmitting(true);
    try {
      const meeting = await api.getMeeting(code);
      if (meeting.status === "ended") {
        setError("This meeting has already ended.");
        return;
      }
      setPendingDisplayName(code, displayName.trim());
      router.push(`/meeting/${code}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("No meeting found with that ID or link.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-xl border border-zoom-gray-200 bg-white p-6 shadow-card"
    >
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-zoom-gray-800">
          Meeting ID or invite link
        </label>
        <input
          type="text"
          value={meetingInput}
          onChange={(e) => setMeetingInput(e.target.value)}
          placeholder="123 4567 8901 or invite link"
          className="w-full rounded-md border border-zoom-gray-300 px-3 py-2 text-sm outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-zoom-gray-800">Your name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your name"
          className="w-full rounded-md border border-zoom-gray-300 px-3 py-2 text-sm outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
        />
      </div>

      {error && <p className="mb-4 text-sm text-zoom-red">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-zoom-blue py-2.5 text-sm font-semibold text-white transition hover:bg-zoom-blue-dark disabled:opacity-60"
      >
        {isSubmitting ? "Checking…" : "Join"}
      </button>
    </form>
  );
}
