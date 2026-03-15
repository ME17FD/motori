import { useEffect, useRef } from 'react';
import { useNotificationStore, NOTIFICATION_ROUTES } from '../store/notificationStore';
import { fetchPendingPayments } from '../services/paymentService';
import { fetchLowStockItems } from '../services/inventoryService';
import { fetchRecentOrders } from '../services/orderService';

const POLL_INTERVAL = 90_000; // 90 seconds

/**
 * Background poller that generates internal notifications based on
 * API state changes (pending payments, low stock, pending orders).
 *
 * Mount this hook once at the AdminLayout level.
 * It uses refs to track previously seen counts to avoid duplicate notifications.
 */
export function useNotificationPoller() {
  const push = useNotificationStore((s) => s.push);

  const prevPendingPayments = useRef<number>(0);
  const prevLowStock        = useRef<number>(0);
  const prevPendingOrders   = useRef<number>(0);

  useEffect(() => {
    const poll = async () => {
      try {
        /* ── Pending payments ── */
        const payments = await fetchPendingPayments();
        if (payments.length > prevPendingPayments.current) {
          push(
            'PAYMENT_PENDING',
            'New payment awaiting validation',
            `${payments.length} cash payment${payments.length > 1 ? 's' : ''} need manual validation.`,
            NOTIFICATION_ROUTES.PAYMENT_PENDING,
          );
        }
        prevPendingPayments.current = payments.length;

        /* ── Low stock ── */
        const lowStock = await fetchLowStockItems();
        if (lowStock.length > prevLowStock.current) {
          push(
            'LOW_STOCK',
            'Low stock alert',
            `${lowStock.length} product${lowStock.length > 1 ? 's are' : ' is'} below threshold.`,
            NOTIFICATION_ROUTES.LOW_STOCK,
          );
        }
        prevLowStock.current = lowStock.length;

        /* ── Pending orders ── */
        const recent = await fetchRecentOrders(20);
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
        // Silently ignore polling errors — network may be temporarily unavailable.
      }
    };

    poll(); // Run immediately on mount
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [push]);
}