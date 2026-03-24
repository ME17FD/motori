/**
 * Report Builder Utilities
 * Generates HTML and structured data for PDF and tabular reports.
 * Converts ReportData objects into printable HTML templates.
 */

import type { ReportData } from '../types/report';
import { formatCurrency, formatDate, formatDateTime } from './formatters';

/**
 * Builds the HTML string for a PDF sales report.
 * Called by exportToPdf() in the reports page.
 */
export function buildReportHtml(report: ReportData): string {
  const { stats, todaySummary, topProducts, params, generatedAt } = report;

  const periodLabel = params.startDate && params.endDate
    ? `${formatDate(params.startDate)} → ${formatDate(params.endDate)}`
    : `Last ${params.period === '7d' ? '7' : params.period === '30d' ? '30' : '90'} days`;

  const statusRows = Object.entries(stats.ordersByStatus)
    .map(([status, count]) => `<tr><td>${status}</td><td>${count}</td></tr>`)
    .join('');

  const topProductRows = topProducts
    .map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.productName}</td>
        <td>${p.quantitySold}</td>
        <td>${formatCurrency(p.totalAmount)}</td>
      </tr>`)
    .join('');

  return `
    <h1>Motori — Sales Report</h1>
    <p>Period: ${periodLabel} · Generated: ${formatDateTime(generatedAt)}</p>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-value">${todaySummary.ordersToday}</div>
        <div class="kpi-label">Orders today</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${formatCurrency(todaySummary.revenueToday)}</div>
        <div class="kpi-label">Revenue today</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${stats.ordersInPeriod}</div>
        <div class="kpi-label">Orders in period</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${formatCurrency(stats.revenueInPeriod)}</div>
        <div class="kpi-label">Revenue in period</div>
      </div>
    </div>

    <h2>Orders by status</h2>
    <table>
      <thead><tr><th>Status</th><th>Count</th></tr></thead>
      <tbody>${statusRows}</tbody>
    </table>

    <h2>Top ${topProducts.length} products</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Product</th>
          <th>Qty sold</th>
          <th>Revenue</th>
        </tr>
      </thead>
      <tbody>${topProductRows}</tbody>
    </table>

    <p style="margin-top:32px;font-size:11px;color:#aaa">
      Motori Backoffice · Confidential
    </p>
  `;
}

/**
 * Flattens ReportData into a list of rows suitable for CSV/Excel export.
 */
export function flattenReportForExport(
  report: ReportData,
): Record<string, unknown>[] {
  return report.topProducts.map((p, i) => ({
    rank:          i + 1,
    product_id:    p.productId,
    product_name:  p.productName,
    qty_sold:      p.quantitySold,
    total_revenue: p.totalAmount,
    period_orders: report.stats.ordersInPeriod,
    period_revenue:report.stats.revenueInPeriod,
    generated_at:  report.generatedAt,
  }));
}