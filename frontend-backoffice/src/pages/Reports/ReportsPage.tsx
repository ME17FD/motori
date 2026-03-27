/**
 * ReportsPage — analytics with period selector, charts, and export.
 *
 * Uses the same stats hooks from Étape 3.
 * Adds a custom date range picker and richer chart layout.
 */

import { useState } from 'react';
import { Download } from 'lucide-react';
import {
  useDashboardStats,
  useTopProducts,
} from '../../hooks/useStats';
import { KpiCard } from '../../components/ui/KpiCard';
import { RevenueAreaChart } from '../../components/Charts/RevenueAreaChart';
import { OrdersByStatusPieChart } from '../../components/Charts/OrdersByStatusPieChart';
import { TopProductsBarChart } from '../../components/Charts/TopProductsBarChart';
import { exportOrders } from '../../services/orderService';
import { downloadBlob, buildExportFilename } from '../../utils/export';
import type { PeriodOption } from '../../types/stats';
import styles from '../../styles/pages/Reports/ReportsPage.module.css';

// ─── Period config ─────────────────────────────────────────────────────────

const PERIODS: { label: string; value: PeriodOption }[] = [
  { label: 'Last 7 days',  value: '7' },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 90 days', value: '90' },
  { label: 'Custom',       value: 'custom' },
];

// ─── Component ─────────────────────────────────────────────────────────────

export function ReportsPage() {
  const [period, setPeriod]   = useState<PeriodOption>('30');
  const [from, setFrom]       = useState('');
  const [to, setTo]           = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const isCustom = period === 'custom';
  const days     = isCustom ? undefined : parseInt(period, 10);

  const params = isCustom
    ? { from: from || undefined, to: to || undefined }
    : { days };

  const { data: stats, isLoading: statsLoading } = useDashboardStats(params);
  const { data: topProducts, isLoading: topLoading } = useTopProducts({
    days,
    limit: 10,
  });

  const revenueData = stats
    ? [{ name: `Period`, revenue: stats.revenueInPeriod, orders: stats.ordersInPeriod }]
    : [];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportOrders({
        format: 'csv',
        from:   from || undefined,
        to:     to   || undefined,
      });
      downloadBlob(blob, buildExportFilename('report', 'csv'));
    } catch {
      // handled by interceptor
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.page}>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Reports & Analytics</h2>
          <p className={styles.subtitle}>
            Sales performance and business insights
          </p>
        </div>
        <button
          className={styles.exportBtn}
          onClick={handleExport}
          disabled={isExporting}
        >
          <Download size={15} />
          {isExporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* ── Period selector ───────────────────────────────────────── */}
      <div className={styles.controls}>
        <div className={styles.periodSelector}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={`${styles.periodBtn} ${
                period === p.value ? styles.periodBtnActive : ''
              }`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        {isCustom && (
          <div className={styles.dateRange}>
            <input
              type="date"
              className={styles.dateInput}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="From"
            />
            <span className={styles.dateSep}>→</span>
            <input
              type="date"
              className={styles.dateInput}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="To"
            />
          </div>
        )}
      </div>

      {/* ── KPI row ───────────────────────────────────────────────── */}
      <div className={styles.kpiGrid}>
        <KpiCard
          title="Orders in Period"
          value={stats?.ordersInPeriod ?? 0}
          isLoading={statsLoading}
          accent="blue"
        />
        <KpiCard
          title="Revenue in Period"
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

      {/* ── Charts ────────────────────────────────────────────────── */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h3 className={styles.cardTitle}>Revenue Overview</h3>
          <RevenueAreaChart data={revenueData} isLoading={statsLoading} />
        </div>
        <div className={styles.chartCard}>
          <h3 className={styles.cardTitle}>Orders by Status</h3>
          <OrdersByStatusPieChart
            data={stats?.ordersByStatus ?? {}}
            isLoading={statsLoading}
          />
        </div>
      </div>

      {/* ── Top products ──────────────────────────────────────────── */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Top 10 Products</h3>
        <TopProductsBarChart
          data={topProducts ?? []}
          isLoading={topLoading}
        />
      </div>

      {/* ── Orders by status breakdown ─────────────────────────────── */}
      {stats?.ordersByStatus && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Order Status Breakdown</h3>
          <div className={styles.statusBreakdown}>
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div key={status} className={styles.statusRow}>
                <span className={styles.statusLabel}>{status}</span>
                <div className={styles.statusBarWrapper}>
                  <div
                    className={styles.statusBar}
                    style={{
                      width: `${Math.min(
                        100,
                        (count / (stats.totalOrders || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
                <span className={styles.statusCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}