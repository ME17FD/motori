import { useQuery } from '@tanstack/react-query';
import { fetchTodaySummary, fetchDashboard, fetchTopProducts } from '../services/statsService';
import type { ReportParams, ReportData } from '../types/report';

/**
 * Assembles a full ReportData object from multiple statistics endpoints.
 * All three queries are fetched in parallel via Promise.all.
 */
export function useReport(params: ReportParams) {
  const days = params.period === '7d'
    ? 7
    : params.period === '30d'
      ? 30
      : params.period === '90d'
        ? 90
        : undefined;

  return useQuery<ReportData>({
    queryKey: ['report', params],
    queryFn: async () => {
      const [todaySummary, stats, topProducts] = await Promise.all([
        fetchTodaySummary(),
        fetchDashboard({
          days,
          startDate: params.startDate,
          endDate:   params.endDate,
          topLimit:  params.topLimit ?? 10,
        }),
        fetchTopProducts({
          days,
          limit: params.topLimit ?? 10,
        }),
      ]);

      return {
        generatedAt: new Date().toISOString(),
        params,
        todaySummary,
        stats: {
          totalOrders:    stats.totalOrders,
          totalRevenue:   stats.totalRevenue,
          ordersInPeriod: stats.ordersInPeriod,
          revenueInPeriod:stats.revenueInPeriod,
          ordersByStatus: stats.ordersByStatus,
        },
        topProducts,
      };
    },
    staleTime: 5 * 60_000, // 5 minutes — reports are expensive
  });
}