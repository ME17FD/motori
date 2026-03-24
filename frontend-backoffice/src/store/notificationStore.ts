/**
 * Notification Store (Zustand)
 * Client-side notification management persisted in localStorage.
 * Notifications are generated locally based on:
 * - Inventory alerts (low stock warnings)
 * - Payment status changes (pending, completed, failed)
 * - Order status updates
 * Used by AdminLayout notification poller to display alerts to admin users.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppNotification, NotificationType } from '../types/notification';
import { ROUTES } from '../constants/routes';

/**
 * Generates a unique ID for local notifications.
 * Format: 'notif-{timestamp}-{random}'
 */
function genId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;

  /** Push a new notification into the store. */
  push: (
    type: NotificationType,
    title: string,
    message: string,
    linkTo?: string,
  ) => void;

  /** Mark a single notification as read. */
  markRead: (id: string) => void;

  /** Mark all notifications as read. */
  markAllRead: () => void;

  /** Remove a single notification. */
  dismiss: (id: string) => void;

  /** Clear all notifications. */
  clearAll: () => void;
}

/**
 * Client-side notification store persisted in localStorage.
 * Notifications are generated locally based on API polling results
 * (low stock, pending payments, pending orders).
 */
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      push: (type, title, message, linkTo) => {
        const notif: AppNotification = {
          id: genId(),
          type,
          title,
          message,
          read: false,
          createdAt: new Date().toISOString(),
          linkTo,
        };
        const notifications = [notif, ...get().notifications].slice(0, 50);
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.read).length,
        });
      },

      markRead: (id) => {
        const notifications = get().notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        );
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.read).length,
        });
      },

      markAllRead: () => {
        const notifications = get().notifications.map((n) => ({
          ...n,
          read: true,
        }));
        set({ notifications, unreadCount: 0 });
      },

      dismiss: (id) => {
        const notifications = get().notifications.filter((n) => n.id !== id);
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.read).length,
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    { name: 'motori-notifications' },
  ),
);

/**
 * Human-readable route associated with each notification type.
 */
export const NOTIFICATION_ROUTES: Partial<Record<NotificationType, string>> = {
  ORDER_PENDING:   ROUTES.ORDERS,
  PAYMENT_PENDING: ROUTES.PAYMENTS,
  LOW_STOCK:       ROUTES.INVENTORY,
  ORDER_CANCELLED: ROUTES.ORDERS,
  NEW_USER:        ROUTES.USERS,
};