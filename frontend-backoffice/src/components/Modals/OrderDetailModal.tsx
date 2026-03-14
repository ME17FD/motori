import { useOrder, useOrderMutations } from '../../hooks/useOrders';
import { useForm } from 'react-hook-form';
import OrderTimeline from '../ui/OrderTimeline';
import OrderStatusBadge from '../ui/OrderStatusBadge';
import type { OrderStatus, UpdateTrackingRequest } from '../../types/order';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import styles from '../../styles/Components/modals/OrderDetailModal.module.css';

interface OrderDetailModalProps {
  open: boolean;
  orderId: string | null;
  onClose: () => void;
}

const STATUS_OPTIONS: OrderStatus[] = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED',
];

/**
 * Full order detail modal — shows timeline, items, tracking form and status changer.
 */
export default function OrderDetailModal(props: OrderDetailModalProps) {
  if (!props.open || !props.orderId) return null;
  return <OrderDetailModalInner {...props} orderId={props.orderId} />;
}

function OrderDetailModalInner({
  orderId,
  onClose,
}: Omit<OrderDetailModalProps, 'open'> & { orderId: string }) {
  const { data: order, isLoading } = useOrder(orderId);
  const { updateStatus, updateTracking } = useOrderMutations();

  const { register, handleSubmit } = useForm<UpdateTrackingRequest>({
    defaultValues: {
      trackingNumber: order?.trackingNumber ?? '',
    },
  });

  const handleStatusChange = (status: OrderStatus) => {
    updateStatus.mutate({ id: orderId, status });
  };

  const handleTrackingSubmit = (data: UpdateTrackingRequest) => {
    updateTracking.mutate({ id: orderId, payload: data });
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>
              Order #{orderId.slice(0, 8).toUpperCase()}
            </h3>
            {order && (
              <span className={styles.date}>
                {formatDateTime(order.createdAt)}
              </span>
            )}
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {isLoading || !order ? (
          <div className={styles.loading}>Loading order…</div>
        ) : (
          <div className={styles.body}>
            {/* Timeline */}
            <section className={styles.section}>
              <OrderTimeline currentStatus={order.status} />
            </section>

            {/* Meta info */}
            <section className={styles.section}>
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Status</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>User ID</span>
                  <span className={styles.metaValue}>{order.userId}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Total</span>
                  <span className={styles.metaValue}>
                    <strong>{formatCurrency(order.totalAmount)}</strong>
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Tracking</span>
                  <span className={styles.metaValue}>
                    {order.trackingNumber ?? '—'}
                  </span>
                </div>
                {order.shippingAddress && (
                  <div className={styles.metaItem} style={{ gridColumn: '1 / -1' }}>
                    <span className={styles.metaLabel}>Shipping address</span>
                    <span className={styles.metaValue}>{order.shippingAddress}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Order items */}
            <section className={styles.section}>
              <h4 className={styles.sectionTitle}>Items ({order.items.length})</h4>
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.productName ?? `#${item.productId}`}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td>
                        <strong>
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Change status */}
            <section className={styles.section}>
              <h4 className={styles.sectionTitle}>Change status</h4>
              <div className={styles.statusButtons}>
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={[
                      styles.statusBtn,
                      order.status === s ? styles.statusBtnActive : '',
                      s === 'CANCELLED' ? styles.statusBtnDanger : '',
                    ].join(' ')}
                    onClick={() => handleStatusChange(s)}
                    disabled={
                      order.status === s || updateStatus.isPending
                    }
                  >
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </section>

            {/* Tracking form */}
            <section className={styles.section}>
              <h4 className={styles.sectionTitle}>Tracking number</h4>
              <form
                onSubmit={handleSubmit(handleTrackingSubmit)}
                className={styles.trackingForm}
              >
                <input
                  className={styles.trackingInput}
                  placeholder="e.g. 1Z999AA10123456784"
                  {...register('trackingNumber')}
                />
                <button
                  type="submit"
                  className={styles.trackingBtn}
                  disabled={updateTracking.isPending}
                >
                  {updateTracking.isPending ? 'Saving…' : 'Update'}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}