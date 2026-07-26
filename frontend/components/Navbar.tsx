"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-30 border-b border-zoom-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-zoom-blue text-white">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M3 7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
                fill="currentColor"
              />
              <path d="m16 10 5-3v10l-5-3v-4Z" fill="currentColor" />
            </svg>
          </span>
          <span className="text-lg font-semibold text-zoom-gray-900">
            Zoom<span className="text-zoom-blue">Clone</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            type="button"
            title="Settings"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-zoom-gray-600 transition hover:bg-zoom-gray-100 sm:flex"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                stroke="currentColor"
                strokeWidth={1.6}
              />
              <path
                d="M19.4 13.5a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19.5a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4.5a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10a1.65 1.65 0 0 0 1-1.51V4.5a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V10a1.65 1.65 0 0 0 1.51 1h.09a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
                stroke="currentColor"
                strokeWidth={1.6}
              />
            </svg>
          </button>

          <div className="flex items-center gap-2 rounded-full border border-zoom-gray-200 py-1 pl-1 pr-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zoom-blue text-xs font-semibold text-white">
              {initials}
            </span>
            <span className="hidden text-sm font-medium text-zoom-gray-800 sm:inline">
              {user?.name ?? "Loading..."}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
