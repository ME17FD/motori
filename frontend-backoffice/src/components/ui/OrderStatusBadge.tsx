/**
 * OrderStatusBadge — colored pill badge for order status values.
 */

import type { OrderStatus } from '../../types/order';
import styles from '../../styles/ui/OrderStatusBadge.module.css';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:    'Pending',
  CONFIRMED:  'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED:    'Shipped',
  DELIVERED:  'Delivered',
  CANCELLED:  'Cancelled',
};

interface Props {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: Props) {
  return (
    <span className={`${styles.badge} ${styles[status.toLowerCase()]}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}