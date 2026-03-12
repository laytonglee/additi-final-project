"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { Client, IMessage, IFrame } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "@/store/auth";

const WS_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080") + "/ws";

export interface TypingUser {
  userId: number;
  userName: string;
}

/**
 * Manages typing indicator state for a contract chat thread.
 *
 * - Subscribes to /topic/contracts/{contractId}/typing for incoming events
 * - Publishes to /app/contracts/{contractId}/typing to broadcast own state
 * - Auto-clears a user's typing state 3 seconds after their last event
 */
export function useTypingIndicator(contractId: number, enabled = true) {
  const clientRef = useRef<Client | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!enabled || !contractId || !user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        client.subscribe(
          `/topic/contracts/${contractId}/typing`,
          (message: IMessage) => {
            try {
              const event = JSON.parse(message.body) as {
                userId: number;
                userName: string;
                typing: boolean;
              };

              // Never show your own typing indicator
              if (event.userId === user.id) return;

              const clearTimer = () => {
                const existing = timersRef.current.get(event.userId);
                if (existing) clearTimeout(existing);
                timersRef.current.delete(event.userId);
              };

              if (event.typing) {
                setTypingUsers((prev) => {
                  if (prev.some((u) => u.userId === event.userId)) return prev;
                  return [
                    ...prev,
                    { userId: event.userId, userName: event.userName },
                  ];
                });

                // Auto-clear after 3 s of silence
                clearTimer();
                const timer = setTimeout(() => {
                  setTypingUsers((prev) =>
                    prev.filter((u) => u.userId !== event.userId),
                  );
                  timersRef.current.delete(event.userId);
                }, 3000);
                timersRef.current.set(event.userId, timer);
              } else {
                clearTimer();
                setTypingUsers((prev) =>
                  prev.filter((u) => u.userId !== event.userId),
                );
              }
            } catch {
              // ignore malformed frames
            }
          },
        );
      },
      onStompError: (frame: IFrame) => {
        console.error("Typing indicator WS error:", frame.headers["message"]);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
      if (client.active) client.deactivate();
      clientRef.current = null;
    };
  }, [contractId, enabled, user?.id]);

  /** Send a typing=true or typing=false event to the backend relay. */
  const sendTyping = useCallback(
    (typing: boolean) => {
      if (!clientRef.current?.active) return;
      clientRef.current.publish({
        destination: `/app/contracts/${contractId}/typing`,
        body: JSON.stringify({ typing }),
      });
    },
    [contractId],
  );

  return { typingUsers, sendTyping };
}
