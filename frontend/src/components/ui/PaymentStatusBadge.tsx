import type { PaymentStatus, PaymentMethod } from '../../types/payment';
import styles from '../../styles/ui/PaymentStatusBadge.module.css';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
}

const STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING:   'Pending',
  VALIDATED: 'Validated',
  REJECTED:  'Rejected',
  REFUNDED:  'Refunded',
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH:     'Cash',
  CARD:     'Card',
  TRANSFER: 'Transfer',
};

/**
 * Colored badge for payment status.
 */
export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[status.toLowerCase()]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

/**
 * Neutral badge for payment method.
 */
export function PaymentMethodBadge({ method }: PaymentMethodBadgeProps) {
  return (
    <span className={`${styles.methodBadge} ${styles[method.toLowerCase()]}`}>
      {METHOD_LABELS[method]}
    </span>
  );
}