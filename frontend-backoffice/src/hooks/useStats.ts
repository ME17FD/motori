/**
 * Statistics / Dashboard Hooks
 * Provides TanStack Query hooks for dashboard analytics and KPI data.
 * Includes today's summary with auto-refresh, period dashboards, and top products ranking.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchTodaySummary, fetchDashboard, fetchTopProducts } from '../services/statsService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { DashboardParams, TopProductsParams } from '../types/stats';

/**
 * Fetches today's KPI summary.
 * Refreshes every 60 seconds to keep the dashboard live.
 */
export function useTodaySummary() {
  return useQuery({
    queryKey: QUERY_KEYS.todaySummary(),
    queryFn: fetchTodaySummary,
    refetchInterval: 60_000,
  });
}

/**
 * Fetches full dashboard statistics for a given period.
 */
export function useDashboard(params: DashboardParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard(params),
    queryFn: () => fetchDashboard(params),
  });
}

/**
 * Fetches the top selling products over a period.
 */
export function useTopProducts(params: TopProductsParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.topProducts(params.days ?? 30, params.limit ?? 10),
    queryFn: () => fetchTopProducts(params),
  });
}