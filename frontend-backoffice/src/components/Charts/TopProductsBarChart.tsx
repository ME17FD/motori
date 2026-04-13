/**
 * TopProductsBarChart — horizontal bar chart of top-selling products.
 */

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { TopProductDto } from '../../types/stats';
import styles from '../../styles/Components/charts/Chart.module.css';

interface Props {
  data: TopProductDto[];
  isLoading?: boolean;
}

export function TopProductsBarChart({ data, isLoading }: Props) {
  if (isLoading) {
    return <div className={styles.skeleton} style={{ height: 240 }} />;
  }

  if (!data.length) {
    return <p className={styles.empty}>No product data for this period.</p>;
  }

  const chartData = data.map((p) => ({
    name: p.productName.length > 20
      ? `${p.productName.slice(0, 20)}…`
      : p.productName,
    qty: p.quantitySold,
    revenue: p.totalAmount,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 12, fill: '#5c5c5c' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fill: '#5c5c5c' }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 13 }}
        />
        <Bar dataKey="qty" fill="#c1121f" radius={[0, 4, 4, 0]} name="Qty Sold" />
      </BarChart>
    </ResponsiveContainer>
  );
}