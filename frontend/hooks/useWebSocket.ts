"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Client, IMessage, IFrame } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const WS_URL = API_URL + "/ws";

/** Build a native WebSocket URL from the HTTP API URL */
function buildNativeWsUrl(httpUrl: string): string {
  return httpUrl.replace(/^http/, "ws") + "/ws";
}

interface UseWebSocketOptions {
  /** The STOMP topic to subscribe to, e.g. "/topic/contracts/5/messages" */
  topic: string;
  /** Called when a message arrives on the subscribed topic */
  onMessage: (payload: unknown) => void;
  /** Whether the hook should connect (set false to disable) */
  enabled?: boolean;
}

export function useWebSocket({
  topic,
  onMessage,
  enabled = true,
}: UseWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const onMessageRef = useRef(onMessage);
  const [connected, setConnected] = useState(false);

  // Keep callback ref fresh without re-subscribing
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const disconnect = useCallback(() => {
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
    }
    clientRef.current = null;
    setConnected(false);
  }, []);

  useEffect(() => {
    if (!enabled || !topic) return;

    const client = new Client({
      // Prefer native WebSocket (sends cookies reliably cross-origin).
      // Fall back to SockJS if native WS fails.
      brokerURL: buildNativeWsUrl(API_URL),
      webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(topic, (message: IMessage) => {
          try {
            const body = JSON.parse(message.body);
            onMessageRef.current(body);
          } catch {
            onMessageRef.current(message.body);
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame: IFrame) => {
        console.error("STOMP error:", frame.headers["message"]);
        setConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      if (client.active) {
        client.deactivate();
      }
      setConnected(false);
    };
  }, [topic, enabled]);

  return { connected, disconnect };
}
