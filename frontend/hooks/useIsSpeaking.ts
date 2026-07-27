"use client";

import { useEffect, useRef, useState } from "react";

const SPEAKING_THRESHOLD = 12; // 0-255 scale from the analyser
const POLL_MS = 150;

/** Samples the audio track's volume to drive a "someone is speaking" indicator. */
export function useIsSpeaking(stream: MediaStream | null, muted: boolean): boolean {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!stream || muted || stream.getAudioTracks().length === 0) {
      setIsSpeaking(false);
      return;
    }

    let audioContext: AudioContext | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    try {
      audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      intervalId = setInterval(() => {
        analyser.getByteFrequencyData(data);
        const average = data.reduce((sum, value) => sum + value, 0) / data.length;
        if (!cancelled) setIsSpeaking(average > SPEAKING_THRESHOLD);
      }, POLL_MS);
    } catch (err) {
      console.error("Speaking detection unavailable", err);
    }

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      audioContext?.close().catch(() => {});
      setIsSpeaking(false);
    };
  }, [stream, muted]);

  return isSpeaking;
}
