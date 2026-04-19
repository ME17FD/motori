import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { StatisticsDto } from '../../types/stats';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/Components/charts/Chart.module.css';

interface SalesLineChartProps {
  data: StatisticsDto;
}

/**
 * Builds a simple daily series from the ordersByStatus map for the line chart.
 * In production this would use a richer time-series endpoint.
 */
function buildChartData(stats: StatisticsDto) {
  return Object.entries(stats.ordersByStatus).map(([status, count]) => ({
    name: status,
    orders: count,
  }));
}

/**
 * Line chart showing order distribution across statuses.
 * Wired to StatisticsDto.ordersByStatus from /api/statistics/dashboard.
 */
export default function SalesLineChart({ data }: SalesLineChartProps) {
  const chartData = buildChartData(data);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Orders by status</h3>
      <p className={styles.subtitle}>
        Period revenue:{' '}
        <strong>{formatCurrency(data.revenueInPeriod)}</strong>
        {' · '}
        {data.ordersInPeriod} orders
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#c1121f"
            strokeWidth={2}
            dot={{ r: 4, fill: '#c1121f' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}