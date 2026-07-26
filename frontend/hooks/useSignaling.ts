"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildSignalingUrl, SignalMessage } from "@/lib/webrtc";

export function useSignaling(
  code: string | null,
  participantId: number | null,
  onMessage: (msg: SignalMessage) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!code || !participantId) return;

    const ws = new WebSocket(buildSignalingUrl(code, participantId));
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SignalMessage;
        onMessageRef.current(data);
      } catch (err) {
        console.error("Failed to parse signaling message", err);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setConnected(false);
    };
  }, [code, participantId]);

  const send = useCallback((message: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }, []);

  return { connected, send };
}
