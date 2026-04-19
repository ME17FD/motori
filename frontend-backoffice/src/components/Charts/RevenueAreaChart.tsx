/**
 * RevenueAreaChart — area chart showing revenue over a period.
 * Uses Recharts AreaChart. Data is fed from the dashboard stats.
 */

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import styles from '../../styles/Components/charts/Chart.module.css';

interface DataPoint {
  name: string;
  revenue: number;
  orders: number;
}

interface Props {
  data: DataPoint[];
  isLoading?: boolean;
}

export function RevenueAreaChart({ data, isLoading }: Props) {
  if (isLoading) {
    return <div className={styles.skeleton} style={{ height: 260 }} />;
  }

  if (!data.length) {
    return <p className={styles.empty}>No data available for this period.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#c1121f" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#c1121f" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: '#5c5c5c' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#5c5c5c' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: any) =>
            value !== undefined
              ? new Intl.NumberFormat('fr-MA', {
                  style: 'currency', currency: 'MAD', maximumFractionDigits: 0,
                }).format(Number(value))
              : 'N/A'
          }
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #e0e0e0',
            fontSize: 13,
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#c1121f"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          name="Revenue"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}