/**
 * useStats — TanStack Query hooks for all statistics endpoints.
 *
 * Hooks:
 *   useTodaySummary()        — daily KPI cards
 *   useDashboardStats()      — period-based charts and totals
 *   useTopProducts()         — top-selling products table
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchTodaySummary,
  fetchDashboardStats,
  fetchTopProducts,
  type DashboardParams,
  type TopProductsParams,
} from '../services/statsService';

// ─── Query keys ────────────────────────────────────────────────────────────

export const statsKeys = {
  all:        ['stats'] as const,
  today:      () => [...statsKeys.all, 'today'] as const,
  dashboard:  (params: DashboardParams) => [...statsKeys.all, 'dashboard', params] as const,
  topProducts:(params: TopProductsParams) => [...statsKeys.all, 'top-products', params] as const,
};

// ─── Hooks ─────────────────────────────────────────────────────────────────

/**
 * Daily KPI summary — refreshes every 2 minutes automatically.
 * Used by the KPI card row on the dashboard.
 */
export function useTodaySummary() {
  return useQuery({
    queryKey: statsKeys.today(),
    queryFn:  fetchTodaySummary,
    refetchInterval: 2 * 60 * 1000, // 2 min polling
    staleTime: 60 * 1000,           // 1 min
  });
}

/**
 * Dashboard statistics for a configurable period.
 * Re-fetches whenever `params` changes (period selector).
 */
export function useDashboardStats(params: DashboardParams = { days: 30 }) {
  return useQuery({
    queryKey: statsKeys.dashboard(params),
    queryFn:  () => fetchDashboardStats(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Top-selling products for the given period.
 */
export function useTopProducts(params: TopProductsParams = { days: 30, limit: 10 }) {
  return useQuery({
    queryKey: statsKeys.topProducts(params),
    queryFn:  () => fetchTopProducts(params),
    staleTime: 5 * 60 * 1000,
  });
}