/**
 * Reports / Analytics Page
 * Comprehensive reporting dashboard with period selection.
 * Features: multiple export formats (CSV, Excel, JSON, PDF),
 * charts (sales, top products, orders by status),
 * and date range customization for analysis.
 */

import { useState, useId } from 'react';
import { useReport } from '../../hooks/useReport';
import KpiCard from '../../components/ui/KpiCard';
import TopProductsBarChart from '../../components/Charts/TopProductsBarChart';
import OrdersByStatusPieChart from '../../components/Charts/OrdersByStatusPieChart';
import RevenueAreaChart from '../../components/Charts/RevenueAreaChart';
import { formatCurrency } from '../../utils/formatters';
import {
  exportToCsv,
  exportToJson,
  exportToExcel,
  exportToPdf,
} from '../../utils/export';
import { buildReportHtml, flattenReportForExport } from '../../utils/reportBuilder';
import type { ReportPeriod, ReportParams } from '../../types/report';
import styles from '../../styles/pages/Reports/ReportsPage.module.css';

const PERIOD_OPTIONS: Array<{ label: string; value: ReportPeriod }> = [
  { label: 'Today',    value: 'today' },
  { label: '7 days',   value: '7d' },
  { label: '30 days',  value: '30d' },
  { label: '90 days',  value: '90d' },
  { label: 'Custom',   value: 'custom' },
];

/**
 * Reports page — assembles statistics from multiple endpoints,
 * renders charts and provides CSV / Excel / JSON / PDF export.
 */
export default function ReportsPage() {
  const startDateId = useId();
  const endDateId   = useId();

  const [period, setPeriod]       = useState<ReportPeriod>('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [topLimit] = useState(10);

  const params: ReportParams = {
    period,
    startDate: period === 'custom' ? startDate : undefined,
    endDate:   period === 'custom' ? endDate   : undefined,
    topLimit,
  };

  const { data: report, isLoading, isFetching, refetch } = useReport(params);

  /* ── Export handlers ── */
  const handleCsv = () => {
    if (!report) return;
    exportToCsv(
      flattenReportForExport(report),
      `motori-report-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const handleExcel = () => {
    if (!report) return;
    exportToExcel(
      flattenReportForExport(report),
      `motori-report-${new Date().toISOString().slice(0, 10)}.xls`,
    );
  };

  const handleJson = () => {
    if (!report) return;
    exportToJson(
      report,
      `motori-report-${new Date().toISOString().slice(0, 10)}.json`,
    );
  };

  const handlePdf = () => {
    if (!report) return;
    exportToPdf(
      buildReportHtml(report),
      `Motori Report — ${new Date().toLocaleDateString()}`,
    );
  };

  const periodLabel = PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? '';

  return (
    <div className={styles.page}>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.left}>
          <h2 className={styles.title}>Sales Reports</h2>
          <p className={styles.subtitle}>
            {report
              ? `Last generated: ${new Date(report.generatedAt).toLocaleTimeString()}`
              : 'Select a period to generate a report'}
          </p>
        </div>

        <div className={styles.right}>
          {/* Period tabs */}
          <div className={styles.periodTabs}>
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={[
                  styles.periodBtn,
                  period === opt.value ? styles.periodBtnActive : '',
                ].join(' ')}
                type="button"
                onClick={() => setPeriod(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Export buttons */}
          <div className={styles.exportGroup}>
            <button
              className={styles.exportBtn}
              onClick={handleCsv}
              disabled={!report || isFetching}
              type="button"
            >
              CSV
            </button>
            <button
              className={styles.exportBtn}
              onClick={handleExcel}
              disabled={!report || isFetching}
              type="button"
            >
              Excel
            </button>
            <button
              className={styles.exportBtn}
              onClick={handleJson}
              disabled={!report || isFetching}
              type="button"
            >
              JSON
            </button>
            <button
              className={`${styles.exportBtn} ${styles.exportBtnPdf}`}
              onClick={handlePdf}
              disabled={!report || isFetching}
              type="button"
            >
              PDF
            </button>
            <button
              className={styles.refreshBtn}
              onClick={() => refetch()}
              disabled={isFetching}
              type="button"
              aria-label="Refresh report"
            >
              {isFetching ? '↻ Refreshing…' : '↻ Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Custom date range */}
      {period === 'custom' && (
        <div className={styles.dateRange}>
          <div className={styles.dateField}>
            <label htmlFor={startDateId} className={styles.dateLabel}>From</label>
            <input
              id={startDateId}
              type="date"
              className={styles.dateInput}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className={styles.dateField}>
            <label htmlFor={endDateId} className={styles.dateLabel}>To</label>
            <input
              id={endDateId}
              type="date"
              className={styles.dateInput}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className={styles.loadingGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : !report ? (
        <div className={styles.empty}>
          No report data available for the selected period.
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className={styles.kpiGrid}>
            <KpiCard
              label="Orders today"
              value={report.todaySummary.ordersToday}
              accent="var(--bo-status-confirmed)"
            />
            <KpiCard
              label="Revenue today"
              value={formatCurrency(report.todaySummary.revenueToday)}
              accent="var(--bo-status-delivered)"
            />
            <KpiCard
              label={`Orders (${periodLabel})`}
              value={report.stats.ordersInPeriod}
              accent="var(--bo-status-processing)"
            />
            <KpiCard
              label={`Revenue (${periodLabel})`}
              value={formatCurrency(report.stats.revenueInPeriod)}
              accent="var(--color-red)"
            />
          </div>

          {/* Charts row 1 */}
          <div className={styles.chartsGrid}>
            <RevenueAreaChart stats={report.stats as never} period={periodLabel} />
            <OrdersByStatusPieChart data={report.stats.ordersByStatus} />
          </div>

          {/* Top products */}
          <TopProductsBarChart data={report.topProducts} />

          {/* Summary table */}
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Orders by status — summary</h3>
            <table className={styles.summaryTable}>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(report.stats.ordersByStatus).map(([status, count]) => {
                  const share = report.stats.totalOrders > 0
                    ? ((count / report.stats.totalOrders) * 100).toFixed(1)
                    : '0.0';
                  return (
                    <tr key={status}>
                      <td style={{ fontWeight: 500 }}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </td>
                      <td>{count}</td>
                      <td>
                        <div className={styles.shareBar}>
                          <div
                            className={styles.shareBarFill}
                            style={{ width: `${share}%` }}
                          />
                          <span>{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}