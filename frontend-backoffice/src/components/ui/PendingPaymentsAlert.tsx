import { usePendingPayments } from '../../hooks/usePayments';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import styles from '../../styles/ui/PendingPaymentsAlert.module.css';

/**
 * Alert banner shown when cash payments are awaiting manual validation.
 * Displayed on the dashboard and the payments page.
 */
export default function PendingPaymentsAlert() {
  const { data: pending = [] } = usePendingPayments();
  const navigate = useNavigate();

  if (pending.length === 0) return null;

  return (
    <div className={styles.banner} role="alert">
      <span className={styles.icon}>💳</span>
      <span className={styles.text}>
        <strong>{pending.length} payment{pending.length > 1 ? 's' : ''}</strong>{' '}
        awaiting manual validation
      </span>
      <button
        className={styles.actionBtn}
        type="button"
        onClick={() => navigate(ROUTES.PAYMENTS)}
      >
        Review
      </button>
    </div>
  );
}