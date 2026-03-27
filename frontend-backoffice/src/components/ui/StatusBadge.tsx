/**
 * StatusBadge — colored badge for ProductStatus values.
 */

import type { ProductStatus } from '../../types/product';
import styles from '../../styles/ui/StatusBadge.module.css';

const STATUS_LABELS: Record<ProductStatus, string> = {
  AVAILABLE:    'Available',
  OUT_OF_STOCK: 'Out of Stock',
  DISCONTINUED: 'Discontinued',
};

interface Props {
  status: ProductStatus;
}

export function StatusBadge({ status }: Props) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}