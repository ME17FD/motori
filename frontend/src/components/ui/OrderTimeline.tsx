import type { OrderStatus } from '../../types/order';
import styles from '../../styles/ui/OrderTimeline.module.css';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
}

const STEPS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
];

const STEP_LABELS: Record<OrderStatus, string> = {
  PENDING:    'Pending',
  CONFIRMED:  'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED:    'Shipped',
  DELIVERED:  'Delivered',
  CANCELLED:  'Cancelled',
};

/**
 * Horizontal step timeline showing the order's progression.
 * Cancelled orders show a distinct warning state.
 */
export default function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className={styles.cancelled}>
        Order cancelled
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(currentStatus);

  return (
    <div className={styles.timeline}>
      {STEPS.map((step, index) => {
        const isDone    = index < currentIndex;
        const isActive  = index === currentIndex;

        return (
          <div key={step} className={styles.step}>
            <div className={[
              styles.dot,
              isDone   ? styles.done   : '',
              isActive ? styles.active : '',
            ].join(' ')}>
              {isDone ? '✓' : index + 1}
            </div>
            <span className={[
              styles.label,
              isActive ? styles.labelActive : '',
            ].join(' ')}>
              {STEP_LABELS[step]}
            </span>
            {index < STEPS.length - 1 && (
              <div className={[
                styles.line,
                isDone ? styles.lineDone : '',
              ].join(' ')} />
            )}
          </div>
        );
      })}
    </div>
  );
}