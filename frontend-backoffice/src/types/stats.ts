/**
 * Statistics types — mirrors the backoffice-service OpenAPI schemas.
 */

/** GET /api/statistics/today */
export interface TodaySummaryDto {
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  toShipOrders: number;
}

/** GET /api/statistics/top-products */
export interface TopProductDto {
  productId: number;
  productName: string;
  quantitySold: number;
  totalAmount: number;
}

/** GET /api/statistics/dashboard */
export interface StatisticsDto {
  totalOrders: number;
  totalRevenue: number;
  /** Map of status → count, e.g. { "PENDING": 12, "DELIVERED": 45 } */
  ordersByStatus: Record<string, number>;
  ordersInPeriod: number;
  revenueInPeriod: number;
  periodFrom?: string;
  periodTo?: string;
  topProducts: TopProductDto[];
}

/** Period selector option used in the dashboard UI */
export type PeriodOption = '7' | '30' | '90' | 'custom';