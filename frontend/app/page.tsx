"use client";

import Navbar from "@/components/Navbar";
import Clock from "@/components/Clock";
import ActionButtons from "@/components/ActionButtons";
import UpcomingMeetings from "@/components/UpcomingMeetings";
import RecentMeetings from "@/components/RecentMeetings";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Clock />
        {user && <p className="mt-2 text-center text-sm text-zoom-gray-600">Welcome back, {user.name}.</p>}

        <div className="mt-8">
          <ActionButtons />
        </div>

        {isLoading ? (
          <p className="mt-10 text-sm text-zoom-gray-600">Loading your dashboard…</p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <UpcomingMeetings />
            <RecentMeetings />
          </div>
        )}
      </main>
    </div>
  );
}
