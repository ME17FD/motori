import { useEffect, useRef } from 'react';
import { useNotificationStore, NOTIFICATION_ROUTES } from '../store/notificationStore';
import { fetchRecentOrders } from '../services/orderService';

const POLL_INTERVAL = 90_000;

/**
 * Background poller that generates internal notifications.
 * Checks for pending orders every 90 seconds.
 * Low-stock polling removed — product-service has no low-stock endpoint.
 */
export function useNotificationPoller() {
  const push = useNotificationStore((s) => s.push);
  const prevPendingOrders = useRef<number>(0);

  useEffect(() => {
    const poll = async () => {
      try {
        const recent  = await fetchRecentOrders(20);
        const pending = recent.filter((o) => o.status === 'PENDING');

        if (pending.length > prevPendingOrders.current) {
          push(
            'ORDER_PENDING',
            'New orders pending',
            `${pending.length} order${pending.length > 1 ? 's' : ''} waiting for confirmation.`,
            NOTIFICATION_ROUTES.ORDER_PENDING,
          );
        }
        prevPendingOrders.current = pending.length;
      } catch {
        // Silently ignore polling errors.
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [push]);
}