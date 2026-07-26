"use client";

import type { RemoteParticipant } from "@/lib/webrtc";

interface ParticipantListProps {
  self: { name: string; muted: boolean; isHost: boolean };
  remoteParticipants: RemoteParticipant[];
  onClose: () => void;
  onRemove?: (participantId: number) => void;
}

export default function ParticipantList({ self, remoteParticipants, onClose, onRemove }: ParticipantListProps) {
  return (
    <aside className="fixed inset-y-0 right-0 z-20 flex w-full flex-col border-l border-zoom-gray-200 bg-white sm:static sm:z-auto sm:w-72">
      <div className="flex items-center justify-between border-b border-zoom-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-zoom-gray-900">
          Participants ({remoteParticipants.length + 1})
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-zoom-gray-600 hover:text-zoom-gray-900"
          aria-label="Close participants panel"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <ul className="flex-1 overflow-y-auto px-2 py-2">
        <li className="flex items-center justify-between rounded-md px-2 py-2 text-sm">
          <span className="truncate text-zoom-gray-900">
            {self.name} (You){self.isHost ? " · Host" : ""}
          </span>
          {self.muted && <span className="text-xs text-zoom-gray-600">Muted</span>}
        </li>
        {remoteParticipants.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm">
            <span className="min-w-0 truncate text-zoom-gray-900">
              {p.name}
              {p.role === "host" ? " · Host" : ""}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              {p.muted && <span className="text-xs text-zoom-gray-600">Muted</span>}
              {onRemove && p.role !== "host" && (
                <button
                  type="button"
                  onClick={() => onRemove(p.id)}
                  className="rounded border border-zoom-gray-200 px-2 py-0.5 text-xs font-medium text-zoom-red transition hover:border-zoom-red"
                >
                  Remove
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
