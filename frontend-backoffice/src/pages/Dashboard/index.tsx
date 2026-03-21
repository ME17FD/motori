import { useState } from 'react';
import { useRecentOrders } from '../../hooks/useOrders';
import RecentOrdersTable from '../../components/Tables/RecentOrdersTable';
import styles from '../../styles/pages/Dashboard/Dashboard.module.css';

const PERIOD_OPTIONS = [
  { label: '7 days',  value: 7  },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

/**
 * Dashboard page.
 * Shows recent orders from product-service.
 * Statistics widgets will be enabled once backoffice-service is ready.
 */
export default function DashboardPage() {
  const [days, setDays] = useState(30);
  const { data: recent, isLoading } = useRecentOrders(10);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.periodTabs}>
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={[
                styles.periodBtn,
                days === opt.value ? styles.periodBtnActive : '',
              ].join(' ')}
              onClick={() => setDays(opt.value)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <RecentOrdersTable
        orders={recent ?? []}
        loading={isLoading}
      />
    </div>
  );
}