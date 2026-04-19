/**
 * Report types used by the backoffice report builder and report hook.
 */

export type ReportPeriod = '7d' | '30d' | '90d' | 'custom';

export interface ReportParams {
  period: ReportPeriod;
  startDate?: string;
  endDate?: string;
  topLimit?: number;
}

export interface ReportStats {
  ordersByStatus: Record<string, number>;
  ordersInPeriod: number;
  revenueInPeriod: number;
}

export interface ReportTodaySummary {
  ordersToday: number;
  revenueToday: number;
}

export interface ReportTopProduct {
  productId: number;
  productName: string;
  quantitySold: number;
  totalAmount: number;
}

export interface ReportData {
  generatedAt: string;
  params: ReportParams;
  todaySummary: ReportTodaySummary;
  stats: ReportStats;
  topProducts: ReportTopProduct[];
}