"use client";

import { useEffect, useRef } from "react";
import { Client, IMessage, IFrame } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "@/store/auth";
import { useNotificationStore } from "@/store/notifications";
import { NotificationData } from "@/lib/api";

const WS_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080") + "/ws";

/**
 * Global hook that maintains a single WebSocket connection for the
 * authenticated user and listens for real-time notifications pushed
 * to /topic/users/{userId}/notifications.
 *
 * Mount this ONCE in a top-level layout (e.g. dashboard layout).
 */
export function useNotificationSocket() {
  const clientRef = useRef<Client | null>(null);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const incrementUnread = useNotificationStore((s) => s.incrementUnread);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (loading || !user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        // Subscribe to the user's personal notification topic
        client.subscribe(
          `/topic/users/${user.id}/notifications`,
          (message: IMessage) => {
            try {
              const notification: NotificationData = JSON.parse(message.body);
              incrementUnread();
              addNotification(notification);
            } catch {
              // ignore malformed messages
            }
          },
        );
      },
      onStompError: (frame: IFrame) => {
        console.error("Notification WS error:", frame.headers["message"]);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      if (client.active) {
        client.deactivate();
      }
      clientRef.current = null;
    };
  }, [user?.id, loading, incrementUnread, addNotification]);
}
