import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DashboardStats } from '../../types/stats';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/components/Charts/Chart.module.css';

interface RevenueAreaChartProps {
  stats: DashboardStats;
  period: string;
}

/**
 * Area chart summarising revenue and order volume for the selected period.
 * Uses ordersByStatus as a proxy since the API doesn't return a time series.
 */
export default function RevenueAreaChart({ stats, period }: RevenueAreaChartProps) {
  const chartData = Object.entries(stats.ordersByStatus).map(([status, count]) => ({
    name:   status.charAt(0) + status.slice(1).toLowerCase(),
    orders: count,
  }));

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Order volume</h3>
      <p className={styles.subtitle}>
        {period} · {stats.ordersInPeriod} orders ·{' '}
        {formatCurrency(stats.revenueInPeriod)} revenue
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#c1121f" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#c1121f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#5c5c5c' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#5c5c5c' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e0e0e0',
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#c1121f"
            strokeWidth={2}
            fill="url(#orderGradient)"
            dot={{ r: 3, fill: '#c1121f' }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}