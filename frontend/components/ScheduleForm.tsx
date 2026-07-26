"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const DURATION_OPTIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "1 hr", value: 60 },
  { label: "1.5 hr", value: 90 },
  { label: "2 hr", value: 120 },
];

function defaultDateTimeLocal(): string {
  const d = new Date(Date.now() + 60 * 60 * 1000); // an hour from now
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ScheduleForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState(defaultDateTimeLocal());
  const [duration, setDuration] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Give your meeting a title.");
      return;
    }
    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      setError("Pick a valid date and time.");
      return;
    }
    if (scheduledDate.getTime() < Date.now() - 60 * 1000) {
      setError("Pick a date and time in the future.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.scheduleMeeting({
        title: title.trim(),
        description: description.trim() || undefined,
        scheduled_at: scheduledDate.toISOString(),
        duration_minutes: duration,
      });
      router.push("/");
    } catch {
      setError("Couldn't schedule the meeting. Please try again.");
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
        <label className="mb-1 block text-sm font-medium text-zoom-gray-800">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Weekly Team Sync"
          className="w-full rounded-md border border-zoom-gray-300 px-3 py-2 text-sm outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-zoom-gray-800">
          Description <span className="text-zoom-gray-600">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What's this meeting about?"
          className="w-full resize-none rounded-md border border-zoom-gray-300 px-3 py-2 text-sm outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zoom-gray-800">Date &amp; time</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full rounded-md border border-zoom-gray-300 px-3 py-2 text-sm outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zoom-gray-800">Duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full rounded-md border border-zoom-gray-300 px-3 py-2 text-sm outline-none focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue"
          >
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-zoom-red">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-zoom-blue py-2.5 text-sm font-semibold text-white transition hover:bg-zoom-blue-dark disabled:opacity-60"
      >
        {isSubmitting ? "Scheduling…" : "Schedule Meeting"}
      </button>
    </form>
  );
}
