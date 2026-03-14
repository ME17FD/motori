import { useState } from 'react';
import { useTodaySummary, useDashboard, useTopProducts } from '../../hooks/useStats';
import { useRecentOrders } from '../../hooks/useOrders';
import KpiCard from '../../components/ui/KpiCard';
import SalesLineChart from '../../components/Charts/SalesLineChart';
import TopProductsBarChart from '../../components/Charts/TopProductsBarChart';
import RecentOrdersTable from '../../components/Tables/RecentOrdersTable';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/pages/Dashboard/Dashboard.module.css';
import LowStockAlert from '../../components/ui/LowStockAlert';
import PendingPaymentsAlert from '../../components/ui/PendingPaymentsAlert';

const PERIOD_OPTIONS = [
  { label: '7 days',  value: 7  },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

/**
 * Main dashboard page.
 * Combines KPI cards, sales chart, top products bar chart
 * and a recent orders table.
 */
export default function DashboardPage() {
  const [days, setDays] = useState(30);

  const { data: today,   isLoading: loadingToday   } = useTodaySummary();
  const { data: stats,   isLoading: loadingStats   } = useDashboard({ days });
  const { data: topProds,isLoading: loadingTop     } = useTopProducts({ days, limit: 8 });
  const { data: recent,  isLoading: loadingRecent  } = useRecentOrders(10);

  return (
    <div className={styles.page}>

      {/* Period selector */}
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
      <LowStockAlert />
      <PendingPaymentsAlert />
      {/* KPI row */}
      <div className={styles.kpiGrid}>
        <KpiCard
          label="Orders today"
          value={today?.ordersToday ?? 0}
          accent="var(--bo-status-confirmed)"
          loading={loadingToday}
        />
        <KpiCard
          label="Revenue today"
          value={today ? formatCurrency(today.revenueToday) : '—'}
          accent="var(--bo-status-delivered)"
          loading={loadingToday}
        />
        <KpiCard
          label="Pending orders"
          value={today?.pendingOrders ?? 0}
          accent="var(--bo-status-pending)"
          sublabel="Awaiting confirmation"
          loading={loadingToday}
        />
        <KpiCard
          label="To ship"
          value={today?.toShipOrders ?? 0}
          accent="var(--bo-status-processing)"
          sublabel="Confirmed or processing"
          loading={loadingToday}
        />
      </div>

      {/* Charts row */}
      <div className={styles.chartsGrid}>
        {loadingStats || !stats ? (
          <div className={styles.chartSkeleton} />
        ) : (
          <SalesLineChart data={stats} />
        )}

        {loadingTop || !topProds ? (
          <div className={styles.chartSkeleton} />
        ) : (
          <TopProductsBarChart data={topProds} />
        )}
      </div>

      {/* Recent orders */}
      <RecentOrdersTable orders={recent ?? []} loading={loadingRecent} />

    </div>
  );
}