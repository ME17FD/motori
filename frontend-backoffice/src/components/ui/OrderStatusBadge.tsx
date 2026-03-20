/**
 * Order Status Badge Component
 * Displays order status with semantic colors (pending, confirmed, shipped, etc.).
 * Used throughout orders and payment tables for visual status indication.
 */

import type { OrderStatus } from '../../types/order';
import styles from '../../styles/ui/OrderStatusBadge.module.css';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:    'Pending',
  CONFIRMED:  'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED:    'Shipped',
  DELIVERED:  'Delivered',
  CANCELLED:  'Cancelled',
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[status.toLowerCase()]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}