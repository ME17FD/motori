import axiosInstance from '../api/axiosInstance';
import type {
  TodaySummary,
  DashboardStats,
  DashboardParams,
  TopProduct,
  TopProductsParams,
} from '../types/stats';

/**
 * Statistics are served by backoffice-service.
 * Gateway route: /api/statistics/** → backoffice-service.
 */

export async function fetchTodaySummary(): Promise<TodaySummary> {
  const { data } = await axiosInstance.get<TodaySummary>('/api/statistics/today');
  return data;
}

export async function fetchDashboard(
  params: DashboardParams = {},
): Promise<DashboardStats> {
  const { data } = await axiosInstance.get<DashboardStats>('/api/statistics/dashboard', {
    params: {
      arg0: params.days,
      arg1: params.startDate,
      arg2: params.endDate,
      arg3: params.topLimit ?? 10,
    },
  });
  return data;
}

export async function fetchTopProducts(
  params: TopProductsParams = {},
): Promise<TopProduct[]> {
  const { data } = await axiosInstance.get<TopProduct[]>('/api/statistics/top-products', {
    params: {
      arg0: params.days ?? 30,
      arg1: params.limit ?? 10,
    },
  });
  return data;
}