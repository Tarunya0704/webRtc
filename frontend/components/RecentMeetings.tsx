"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Meeting } from "@/lib/types";
import MeetingCard from "@/components/MeetingCard";

export default function RecentMeetings() {
  const [meetings, setMeetings] = useState<Meeting[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .recentMeetings()
      .then(setMeetings)
      .catch(() => setError("Couldn't load recent meetings."));
  }, []);

  return (
    <section className="rounded-xl border border-zoom-gray-200 bg-white p-4 shadow-card sm:p-5">
      <h2 className="mb-3 text-base font-semibold text-zoom-gray-900">Recent Meetings</h2>

      {error && <p className="text-sm text-zoom-red">{error}</p>}

      {!error && meetings === null && (
        <p className="text-sm text-zoom-gray-600">Loading…</p>
      )}

      {meetings !== null && meetings.length === 0 && (
        <p className="text-sm text-zoom-gray-600">No meetings yet.</p>
      )}

      {meetings && meetings.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}
    </section>
  );
}
