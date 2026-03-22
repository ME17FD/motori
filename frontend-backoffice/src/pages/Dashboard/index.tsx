import { useState } from 'react';
import { useRecentOrders } from '../../hooks/useOrders';
import RecentOrdersTable from '../../components/Tables/RecentOrdersTable';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend,
} from 'recharts';
import styles from '../../styles/pages/Dashboard/Dashboard.module.css';
import { formatCurrency } from '../../utils/formatters';

const PERIOD_OPTIONS = [
  { label: '7 days',  value: 7  },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING:   '#f59e0b',
  CONFIRMED: '#3b82f6',
  PROCESSING:'#8b5cf6',
  SHIPPED:   '#14b8a6',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
};

export default function DashboardPage() {
  const [days, setDays] = useState(30);
  const { data: recent, isLoading } = useRecentOrders(20);

  // Derive stats from recent orders
  const orders = recent ?? [];

  const totalRevenue = orders
    .filter((o) => !o.completed === false || o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    const s = o.status ?? 'PENDING';
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Revenue by day (last N days from orders)
  const revenueByDay = orders.reduce<Record<string, number>>((acc, o) => {
    const day = o.createdAt?.slice(0, 10) ?? 'Unknown';
    acc[day] = (acc[day] ?? 0) + (Number(o.totalPrice) || 0);
    return acc;
  }, {});

  const barData = Object.entries(revenueByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, revenue]) => ({
      date: date.slice(5),  // MM-DD
      revenue,
    }));

  return (
    <div className={styles.page}>
      {/* Period selector */}
      <div className={styles.toolbar}>
        <div className={styles.periodTabs}>
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={[
                styles.periodBtn,
                days === opt.value ? styles.periodBtnActive : '',
              ].join(' ')}
              onClick={() => setDays(opt.value)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Total orders</div>
          <div className={styles.kpiValue}>{orders.length}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Revenue</div>
          <div className={styles.kpiValue}>{formatCurrency(totalRevenue)}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Pending</div>
          <div className={styles.kpiValue} style={{ color: '#f59e0b' }}>
            {statusCounts['PENDING'] ?? 0}
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Delivered</div>
          <div className={styles.kpiValue} style={{ color: '#10b981' }}>
            {statusCounts['DELIVERED'] ?? 0}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        {/* Revenue bar chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Revenue (last 7 days)</h3>
          {barData.length === 0 ? (
            <div className={styles.chartEmpty}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}`} />
                <Tooltip
                  formatter={(value) => [
                  typeof value === 'number' ? formatCurrency(value) : value,
                  'Revenue'
                  ]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="revenue" fill="var(--color-red)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status pie chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Orders by status</h3>
          {pieData.length === 0 ? (
            <div className={styles.chartEmpty}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] ?? '#94a3b8'}
                    />
                  ))}
                </Pie>a
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent orders table */}
      <RecentOrdersTable orders={orders} loading={isLoading} />
    </div>
  );
}