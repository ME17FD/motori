/**
 * DashboardPage — main backoffice overview.
 *
 * Sections:
 *   1. Period selector (7d / 30d / 90d)
 *   2. KPI cards row (today's summary)
 *   3. Revenue area chart + orders-by-status pie chart
 *   4. Top products bar chart
 *   5. Recent orders table
 */

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTodaySummary, useDashboardStats, useTopProducts, statsKeys } from '../../hooks/useStats';
import { useRecentOrders, orderKeys } from '../../hooks/useOrders';
import { KpiCard } from '../../components/ui/KpiCard';
import { RevenueAreaChart } from '../../components/Charts/RevenueAreaChart';
import { OrdersByStatusPieChart } from '../../components/Charts/OrdersByStatusPieChart';
import { TopProductsBarChart } from '../../components/Charts/TopProductsBarChart';
import { RecentOrdersTable } from '../../components/Tables/RecentOrdersTable';
import type { PeriodOption } from '../../types/stats';
import styles from '../../styles/pages/Dashboard/Dashboard.module.css';

// ─── Period options ────────────────────────────────────────────────────────

const PERIODS: { label: string; value: PeriodOption }[] = [
  { label: '7 days',  value: '7' },
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
];

// ─── Component ─────────────────────────────────────────────────────────────

export function DashboardPage() {
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<PeriodOption>('30');

  const days = parseInt(period, 10);

  // ── Data fetching ──────────────────────────────────────────────────────
  const {
    data: today,
    isLoading: todayLoading,
    isError: todayError,
  } = useTodaySummary();

  const {
    data: stats,
    isLoading: statsLoading,
  } = useDashboardStats({ days });

  const {
    data: topProducts,
    isLoading: topLoading,
  } = useTopProducts({ days, limit: 8 });

  const {
    data: recentOrders,
    isLoading: ordersLoading,
  } = useRecentOrders(10);

  // ── Manual refresh — invalidates all stats + orders queries ───────────
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: statsKeys.all });
    queryClient.invalidateQueries({ queryKey: orderKeys.all });
  };

  // ── Revenue chart data — derived from stats (mock daily if unavailable)
  // The backoffice API returns totals, not day-by-day arrays.
  // We use the period totals as a single data point for now.
  // A dedicated endpoint returning daily breakdown can replace this later.
  const revenueData = stats
    ? [{ name: `Last ${days}d`, revenue: stats.revenueInPeriod, orders: stats.ordersInPeriod }]
    : [];

  return (
    <div className={styles.page}>

      {/* ── Header row ────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Dashboard</h2>
          <p className={styles.subtitle}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>

        <div className={styles.controls}>
          {/* Period selector */}
          <div className={styles.periodSelector}>
            {PERIODS.map((p) => (
              <button
                key={p.value}
                className={`${styles.periodBtn} ${period === p.value ? styles.periodBtnActive : ''}`}
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            className={styles.refreshBtn}
            onClick={handleRefresh}
            title="Refresh all data"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── KPI cards ─────────────────────────────────────────────── */}
      <div className={styles.kpiGrid}>
        <KpiCard
          title="Orders Today"
          value={today?.ordersToday ?? 0}
          isLoading={todayLoading}
          isError={todayError}
          accent="blue"
        />
        <KpiCard
          title="Revenue Today"
          value={today?.revenueToday ?? 0}
          format="currency"
          isLoading={todayLoading}
          isError={todayError}
          accent="green"
        />
        <KpiCard
          title="Pending Orders"
          value={today?.pendingOrders ?? 0}
          isLoading={todayLoading}
          isError={todayError}
          accent="yellow"
        />
        <KpiCard
          title="To Ship"
          value={today?.toShipOrders ?? 0}
          isLoading={todayLoading}
          isError={todayError}
          accent="purple"
        />
      </div>

      {/* ── Period totals ──────────────────────────────────────────── */}
      <div className={styles.kpiGrid}>
        <KpiCard
          title={`Orders (${days}d)`}
          value={stats?.ordersInPeriod ?? 0}
          isLoading={statsLoading}
          accent="blue"
        />
        <KpiCard
          title={`Revenue (${days}d)`}
          value={stats?.revenueInPeriod ?? 0}
          format="currency"
          isLoading={statsLoading}
          accent="green"
        />
        <KpiCard
          title="Total Orders (all time)"
          value={stats?.totalOrders ?? 0}
          isLoading={statsLoading}
          accent="gray"
        />
        <KpiCard
          title="Total Revenue (all time)"
          value={stats?.totalRevenue ?? 0}
          format="currency"
          isLoading={statsLoading}
          accent="gray"
        />
      </div>

      {/* ── Charts row ────────────────────────────────────────────── */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h3 className={styles.cardTitle}>Revenue Overview</h3>
          <RevenueAreaChart data={revenueData} isLoading={statsLoading} />
        </div>

        <div className={`${styles.chartCard} ${styles.chartCardSmall}`}>
          <h3 className={styles.cardTitle}>Orders by Status</h3>
          <OrdersByStatusPieChart
            data={stats?.ordersByStatus ?? {}}
            isLoading={statsLoading}
          />
        </div>
      </div>

      {/* ── Top products ──────────────────────────────────────────── */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Top Products — last {days} days</h3>
        <TopProductsBarChart
          data={topProducts ?? []}
          isLoading={topLoading}
        />
      </div>

      {/* ── Recent orders ─────────────────────────────────────────── */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Recent Orders</h3>
        <RecentOrdersTable
          orders={recentOrders ?? []}
          isLoading={ordersLoading}
        />
      </div>

    </div>
  );
}