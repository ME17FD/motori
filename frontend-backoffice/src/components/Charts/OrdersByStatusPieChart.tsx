/**
 * OrdersByStatusPieChart — donut chart of orders grouped by status.
 */

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from '../../styles/Components/charts/Chart.module.css';

const STATUS_COLORS: Record<string, string> = {
  PENDING:    '#f59e0b',
  CONFIRMED:  '#3b82f6',
  PROCESSING: '#8b5cf6',
  SHIPPED:    '#06b6d4',
  DELIVERED:  '#10b981',
  CANCELLED:  '#ef4444',
};

interface Props {
  data: Record<string, number>;
  isLoading?: boolean;
}

export function OrdersByStatusPieChart({ data, isLoading }: Props) {
  if (isLoading) {
    return <div className={styles.skeleton} style={{ height: 220 }} />;
  }

  const chartData = Object.entries(data).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  if (!chartData.length) {
    return <p className={styles.empty}>No order data.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.name}
              fill={STATUS_COLORS[entry.name] ?? '#9ca3af'}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 13 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}