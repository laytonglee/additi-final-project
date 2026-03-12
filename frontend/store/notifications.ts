import { create } from "zustand";
import { NotificationData } from "@/lib/api";

interface NotificationState {
  unreadCount: number;
  /** Latest notifications received via WebSocket (newest first, capped at 50). */
  realtimeQueue: NotificationData[];
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: () => void;
  /** Push a single notification received from WebSocket into the queue. */
  addNotification: (n: NotificationData) => void;
  /** Clear the real-time queue (e.g. after the page fetches fresh data). */
  clearQueue: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,
  realtimeQueue: [],
  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
  incrementUnread: () => set({ unreadCount: get().unreadCount + 1 }),
  decrementUnread: () =>
    set({ unreadCount: Math.max(0, get().unreadCount - 1) }),
  addNotification: (n) =>
    set({ realtimeQueue: [n, ...get().realtimeQueue].slice(0, 50) }),
  clearQueue: () => set({ realtimeQueue: [] }),
}));
