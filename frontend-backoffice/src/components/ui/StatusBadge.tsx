import type { OrderStatus } from '../../types/order';
import styles from '../../styles/ui/StatusBadge.module.css';

interface StatusBadgeProps {
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

/**
 * Colored pill badge for order statuses.
 * Color mapping uses CSS custom properties defined in variables.css.
 */
export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[status.toLowerCase()]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}