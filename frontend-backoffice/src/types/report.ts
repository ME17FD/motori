/**
 * Report types — period selector and generated report data.
 */

export type ReportPeriod = '7' | '30' | '90' | 'custom';

export interface ReportFilters {
  period: ReportPeriod;
  from?: string;
  to?: string;
}

export interface DailySalesPoint {
  date: string;
  orders: number;
  revenue: number;
}

export interface CategorySales {
  categoryName: string;
  totalSold: number;
  totalRevenue: number;
}

export interface ReportData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  dailySales: DailySalesPoint[];
  topCategories: CategorySales[];
}