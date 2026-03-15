/**
 * Period options for report generation.
 */
export type ReportPeriod = 'today' | '7d' | '30d' | '90d' | 'custom';

/**
 * Parameters used to generate a report.
 */
export interface ReportParams {
  period: ReportPeriod;
  startDate?: string;   // ISO date — required when period = 'custom'
  endDate?: string;     // ISO date — required when period = 'custom'
  topLimit?: number;
}

/**
 * A single data point for the revenue over time chart.
 */
export interface RevenueDataPoint {
  date: string;         // ISO date
  revenue: number;
  orders: number;
}

/**
 * Full report data assembled from multiple API calls.
 */
export interface ReportData {
  generatedAt: string;
  params: ReportParams;
  todaySummary: {
    ordersToday: number;
    revenueToday: number;
    pendingOrders: number;
    toShipOrders: number;
  };
  stats: {
    totalOrders: number;
    totalRevenue: number;
    ordersInPeriod: number;
    revenueInPeriod: number;
    ordersByStatus: Record<string, number>;
  };
  topProducts: Array<{
    productId: number;
    productName: string;
    quantitySold: number;
    totalAmount: number;
  }>;
}