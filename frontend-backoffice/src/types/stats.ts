/**
 * Statistics & Dashboard Types
 * Data models for KPIs, dashboard metrics, and report generation.
 * Includes today's summary, period dashboards, and top products ranking.
 */

export interface TodaySummary {
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  toShipOrders: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  quantitySold: number;
  totalAmount: number;
}

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
 * Index signatures added on all param interfaces used as TanStack Query keys.
 * Without [key: string]: unknown, TypeScript rejects assignment to Record<string, unknown>.
 */
export interface DashboardParams {
  days?: number;
  startDate?: string;
  endDate?: string;
  topLimit?: number;
  [key: string]: unknown;
}

export interface TopProductsParams {
  days?: number;
  limit?: number;
  [key: string]: unknown;
}