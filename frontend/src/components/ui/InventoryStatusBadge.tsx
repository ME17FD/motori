import type { InventoryStatus } from '../../types/inventory';
import styles from '../../styles/ui/InventoryStatusBadge.module.css';

interface InventoryStatusBadgeProps {
  status: InventoryStatus;
  quantity?: number;
  threshold?: number;
}

const STATUS_LABELS: Record<InventoryStatus, string> = {
  AVAILABLE:    'Available',
  OUT_OF_STOCK: 'Out of stock',
  DISCONTINUED: 'Discontinued',
};

/**
 * Badge for inventory status.
 * Shows a low-stock warning when quantity is at or below threshold.
 */
export default function InventoryStatusBadge({
  status,
  quantity,
  threshold,
}: InventoryStatusBadgeProps) {
  const isLow =
    status === 'AVAILABLE' &&
    quantity !== undefined &&
    threshold !== undefined &&
    quantity <= threshold;

  if (isLow) {
    return (
      <span className={`${styles.badge} ${styles.low}`}>
        ⚠ Low stock ({quantity})
      </span>
    );
  }

  return (
    <span className={`${styles.badge} ${styles[status.toLowerCase().replace('_', '')]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}