/**
 * Stats service — wraps the backoffice-service statistics endpoints.
 *
 * All requests go through the API Gateway (axiosInstance).
 * Endpoints (from api-docs.json):
 *   GET /api/statistics/today
 *   GET /api/statistics/dashboard
 *   GET /api/statistics/top-products
 */

import apiClient from '../api/axiosInstance';
import type {
  TodaySummaryDto,
  StatisticsDto,
  TopProductDto,
} from '../types/stats';

// ─── Today summary ─────────────────────────────────────────────────────────

/**
 * Fetches the daily KPI summary:
 * ordersToday, revenueToday, pendingOrders, toShipOrders
 */
export async function fetchTodaySummary(): Promise<TodaySummaryDto> {
  const { data } = await apiClient.get<TodaySummaryDto>(
    '/api/statistics/today'
  );
  return data;
}

// ─── Dashboard statistics ──────────────────────────────────────────────────

export interface DashboardParams {
  /** Number of days to look back (mutually exclusive with from/to) */
  days?: number;
  /** Start date ISO string yyyy-MM-dd */
  from?: string;
  /** End date ISO string yyyy-MM-dd */
  to?: string;
  /** Number of top products to return (default 10) */
  topProductsLimit?: number;
}

/**
 * Fetches global dashboard statistics for a given period.
 * Supports either a rolling `days` window or a custom `from`/`to` range.
 */
export async function fetchDashboardStats(
  params: DashboardParams = {}
): Promise<StatisticsDto> {
  const { data } = await apiClient.get<StatisticsDto>(
    '/api/statistics/dashboard',
    {
      params: {
        arg0: params.days,
        arg1: params.from,
        arg2: params.to,
        arg3: params.topProductsLimit ?? 10,
      },
    }
  );
  return data;
}

// ─── Top products ──────────────────────────────────────────────────────────

export interface TopProductsParams {
  /** Rolling period in days (default 30) */
  days?: number;
  /** Maximum number of results (default 10) */
  limit?: number;
}

/**
 * Fetches the top-selling products for a given period.
 */
export async function fetchTopProducts(
  params: TopProductsParams = {}
): Promise<TopProductDto[]> {
  const { data } = await apiClient.get<TopProductDto[]>(
    '/api/statistics/top-products',
    {
      params: {
        arg0: params.days ?? 30,
        arg1: params.limit ?? 10,
      },
    }
  );
  return data;
}