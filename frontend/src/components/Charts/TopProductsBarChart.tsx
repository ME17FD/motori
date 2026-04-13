import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { TopProduct } from '../../types/stats';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/Components/charts/Chart.module.css';

interface TopProductsBarChartProps {
  data: TopProduct[];
}

const BAR_COLORS = ['#c1121f', '#e63946', '#e85d04', '#fb8500', '#ffb703'];

/**
 * Fully typed custom tooltip — avoids all Recharts Formatter conflicts
 * by defining our own props interface matching what Recharts actually passes.
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    name: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const qty     = payload.find((p) => p.dataKey === 'quantitySold')?.value ?? 0;
  const revenue = payload.find((p) => p.dataKey === 'totalAmount')?.value ?? 0;

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12,
      lineHeight: 1.6,
    }}>
      <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
      <p style={{ margin: 0, color: '#5c5c5c' }}>Qty sold: {qty}</p>
      <p style={{ margin: 0, color: '#5c5c5c' }}>Revenue: {formatCurrency(Number(revenue))}</p>
    </div>
  );
}

export default function TopProductsBarChart({ data }: TopProductsBarChartProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Top products</h3>
      <p className={styles.subtitle}>Ranked by quantity sold</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#5c5c5c' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="productName"
            width={120}
            tick={{ fontSize: 11, fill: '#5c5c5c' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="quantitySold" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={BAR_COLORS[index % BAR_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 