/**
 * Today's KPI summary — maps to TodaySummaryDto from backoffice-service.
 */
export interface TodaySummary {
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  toShipOrders: number;
}

/**
 * Top selling product over a period — maps to TopProductDto.
 */
export interface TopProduct {
  productId: number;
  productName: string;
  quantitySold: number;
  totalAmount: number;
}

/**
 * Full dashboard statistics — maps to StatisticsDto from backoffice-service.
 */
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
  ordersInPeriod: number;
  revenueInPeriod: number;
  periodFrom?: string;
  periodTo?: string;
  topProducts: TopProduct[];
}

/**
 * Query params for GET /api/statistics/dashboard.
 * Index signature required for TanStack Query key compatibility.
 */
export interface DashboardParams {
  days?: number;
  startDate?: string;
  endDate?: string;
  topLimit?: number;
  [key: string]: unknown;
}

/**
 * Query params for GET /api/statistics/top-products.
 */
export interface TopProductsParams {
  days?: number;
  limit?: number;
  [key: string]: unknown;
}

/**
 * Period options for report generation.
 */
export type ReportPeriod = 'today' | '7d' | '30d' | '90d' | 'custom';

/**
 * Parameters used to generate a report.
 */
export interface ReportParams {
  period: ReportPeriod;
  startDate?: string;
  endDate?: string;
  topLimit?: number;
}

/**
 * Full report data assembled from multiple API calls.
 */
export interface ReportData {
  generatedAt: string;
  params: ReportParams;
  todaySummary: TodaySummary;
  stats: {
    totalOrders: number;
    totalRevenue: number;
    ordersInPeriod: number;
    revenueInPeriod: number;
    ordersByStatus: Record<string, number>;
  };
  topProducts: TopProduct[];
}