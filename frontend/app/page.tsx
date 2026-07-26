"use client";

import Navbar from "@/components/Navbar";
import ActionButtons from "@/components/ActionButtons";
import UpcomingMeetings from "@/components/UpcomingMeetings";
import RecentMeetings from "@/components/RecentMeetings";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold text-zoom-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-zoom-gray-600">
          Start an instant meeting, join one, or schedule for later.
        </p>

        <div className="mt-6">
          <ActionButtons />
        </div>

        {isLoading ? (
          <p className="mt-8 text-sm text-zoom-gray-600">Loading your dashboard…</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <UpcomingMeetings />
            <RecentMeetings />
          </div>
        )}
      </main>
    </div>
  );
}
