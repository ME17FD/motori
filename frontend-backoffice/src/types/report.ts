/**
 * Re-exported from stats.ts for backward compatibility.
 * ReportPeriod, ReportParams and ReportData are defined in stats.ts.
 */
export type { ReportPeriod, ReportParams, ReportData } from './stats';

/**
 * A single revenue data point for time-series charts.
 */
export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}