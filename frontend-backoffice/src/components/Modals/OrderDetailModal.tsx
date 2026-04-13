/**
 * OrderDetailModal — full order detail in a slide-over modal.
 *
 * Features:
 *   - Order info: ID, date, status, tracking, address, total
 *   - Line items table
 *   - Status change dropdown (with allowed transitions)
 *   - Tracking number input + save
 *   - Loading and error states
 *   - Closes on Escape key or backdrop click
 */

import { useEffect, useRef, useState } from 'react';
import { X, Package, Truck, Save } from 'lucide-react';
import { useOrder, useUpdateOrderStatus, useUpdateTracking } from '../../hooks/useOrders';
import { OrderStatusBadge } from '../ui/OrderStatusBadge';
import { formatDateTime, formatCurrency, shortId } from '../../utils/formatters';
import type { OrderStatus } from '../../types/order';
import styles from '../../styles/Components/modals/OrderDetailModal.module.css';

// ─── Status transition rules ───────────────────────────────────────────────

/**
 * Defines which statuses are valid next states for each current status.
 * Prevents invalid transitions (e.g. DELIVERED → PENDING).
 */
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:    ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:  ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED:    ['DELIVERED', 'CANCELLED'],
  DELIVERED:  [],
  CANCELLED:  [],
};

// ─── Component ─────────────────────────────────────────────────────────────

interface Props {
  orderId: string;
  onClose: () => void;
}

export function OrderDetailModal({ orderId, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const { data: order, isLoading, isError } = useOrder(orderId);
  const updateStatus   = useUpdateOrderStatus();
  const updateTracking = useUpdateTracking();

  // Local tracking input state
  const [trackingInput, setTrackingInput] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');

  // Use useEffect to sync with order data - but this is actually appropriate here
  // because we're syncing external data (from the API) with local form state
  useEffect(() => {
    if (order) {
      // This is acceptable because we're initializing form state from API data
      // React 19+ might still warn, but this is a legitimate use case
      setTrackingInput(order.trackingNumber ?? '');
      setSelectedStatus('');
    }
  }, [order]);

  // Alternative: Use useMemo or derive values instead of useEffect if possible
  // But since this is initialization of form state from API data, useEffect is appropriate

  // ── Keyboard: close on Escape ────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Prevent body scroll while modal is open ──────────────────────────
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── Action handlers ──────────────────────────────────────────────────
  const handleStatusChange = async () => {
    if (!selectedStatus || !order) return;
    await updateStatus.mutateAsync({ id: order.id, status: selectedStatus });
    setSelectedStatus('');
  };

  const handleTrackingSave = async () => {
    if (!order) return;
    await updateTracking.mutateAsync({
      id: order.id,
      trackingNumber: trackingInput,
    });
  };

  const allowedTransitions = order
    ? STATUS_TRANSITIONS[order.status]
    : [];

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Order details"
    >
      <div className={styles.panel}>

        {/* ── Header ────────────────────────────────────────────── */}
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderLeft}>
            <Package size={18} />
            <h2 className={styles.panelTitle}>
              {order ? `Order #${shortId(order.id)}` : 'Order Details'}
            </h2>
            {order && <OrderStatusBadge status={order.status} />}
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────────── */}
        <div className={styles.panelBody}>

          {/* Loading */}
          {isLoading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <span>Loading order…</span>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className={styles.errorState}>
              Failed to load order details. Please try again.
            </div>
          )}

          {/* Content */}
          {order && (
            <>
              {/* ── Info grid ─────────────────────────────────── */}
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Order UUID</span>
                  <span className={styles.infoValue}>
                    <code className={styles.code}>{order.id}</code>
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>User ID</span>
                  <span className={styles.infoValue}>#{order.userId}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Created</span>
                  <span className={styles.infoValue}>
                    {formatDateTime(order.createdAt)}
                  </span>
                </div>
                {order.updatedAt && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Last updated</span>
                    <span className={styles.infoValue}>
                      {formatDateTime(order.updatedAt)}
                    </span>
                  </div>
                )}
                {order.shippingAddress && (
                  <div className={`${styles.infoItem} ${styles.infoItemFull}`}>
                    <span className={styles.infoLabel}>Shipping address</span>
                    <span className={styles.infoValue}>
                      {order.shippingAddress}
                    </span>
                  </div>
                )}
              </div>

              {/* ── Line items ────────────────────────────────── */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  Items ({order.items.length})
                </h3>
                <table className={styles.itemsTable}>
                  <thead>
                    <tr>
                      <th className={styles.itemTh}>Product</th>
                      <th className={styles.itemTh}>Qty</th>
                      <th className={styles.itemTh}>Unit price</th>
                      <th className={styles.itemTh}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={idx} className={styles.itemRow}>
                        <td className={styles.itemTd}>
                          {item.productName ?? `Product #${item.productId}`}
                        </td>
                        <td className={styles.itemTd}>{item.quantity}</td>
                        <td className={styles.itemTd}>
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className={styles.itemTd}>
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className={styles.totalLabel}>
                        Order total
                      </td>
                      <td className={styles.totalValue}>
                        {formatCurrency(order.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* ── Status change ─────────────────────────────── */}
              {allowedTransitions.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Change Status</h3>
                  <div className={styles.actionRow}>
                    <select
                      className={styles.select}
                      value={selectedStatus}
                      onChange={(e) =>
                        setSelectedStatus(e.target.value as OrderStatus)
                      }
                    >
                      <option value="">Select new status…</option>
                      {allowedTransitions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      className={styles.actionBtn}
                      onClick={handleStatusChange}
                      disabled={
                        !selectedStatus || updateStatus.isPending
                      }
                    >
                      {updateStatus.isPending ? 'Updating…' : 'Update Status'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Tracking ───────────────────────────────────── */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <Truck size={15} />
                  Tracking
                </h3>
                <div className={styles.actionRow}>
                  <input
                    type="text"
                    className={styles.trackingInput}
                    placeholder="Enter tracking number…"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                  />
                  <button
                    className={styles.actionBtn}
                    onClick={handleTrackingSave}
                    disabled={
                      updateTracking.isPending ||
                      trackingInput === (order.trackingNumber ?? '')
                    }
                  >
                    <Save size={14} />
                    {updateTracking.isPending ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}