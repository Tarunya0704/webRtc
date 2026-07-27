"use client";

import { useEffect, useRef } from "react";
import { useIsSpeaking } from "@/hooks/useIsSpeaking";

interface VideoTileProps {
  name: string;
  stream: MediaStream | null;
  muted: boolean;
  cameraOff: boolean;
  isLocal?: boolean;
  isHost?: boolean;
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function VideoTile({ name, stream, muted, cameraOff, isLocal, isHost }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isSpeaking = useIsSpeaking(stream, muted);

  // The <video> element stays mounted permanently (never conditionally unmounted) so this
  // effect — and the srcObject it sets — survives camera on/off toggles. Swapping it in and
  // out of the tree based on `cameraOff` used to leave a freshly-mounted <video> with no
  // srcObject whenever `stream` itself hadn't changed identity (e.g. toggling your own
  // camera back on, or a remote peer's stream sitting unchanged while `cameraOff` flipped).
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={`relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-zoom-gray-900 transition-shadow ${
        isSpeaking ? "ring-2 ring-zoom-blue shadow-[0_0_16px_rgba(45,140,255,0.65)]" : ""
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`h-full w-full object-cover [transform:scaleX(-1)] ${
          !cameraOff && stream ? "block" : "hidden"
        }`}
      />

      {(cameraOff || !stream) && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zoom-blue text-lg font-semibold text-white">
          {initialsOf(name || "?")}
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
        {muted && (
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
            <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" fill="currentColor" />
            <path d="M19 11a7 7 0 0 1-14 0M12 18v3" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
            <path d="M4 4l16 16" stroke="#E02828" strokeWidth={2} strokeLinecap="round" />
          </svg>
        )}
        <span className="max-w-[10rem] truncate">
          {name}
          {isLocal ? " (You)" : ""}
        </span>
        {isHost && <span className="rounded bg-zoom-blue px-1 text-[10px] font-semibold">HOST</span>}
      </div>
    </div>
  );
}
