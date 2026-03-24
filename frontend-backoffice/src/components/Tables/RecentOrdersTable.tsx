import type { Order } from '../../types/order';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import styles from '../../styles/Components/tables/RecentOrdersTable.module.css';

interface RecentOrdersTableProps {
  orders: Order[];
  loading?: boolean;
}

export default function RecentOrdersTable({ orders, loading = false }: RecentOrdersTableProps) {
  if (loading) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>Recent orders</h3>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.skeletonRow} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Recent orders</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Items</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#888', padding: '32px' }}>
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const statusColors: Record<string, string> = {
                  PENDING:   '#b45309',
                  CONFIRMED: '#1d4ed8',
                  DELIVERED: '#065f46',
                  CANCELLED: '#b91c1c',
                };
                const s = order.status ?? (order.completed ? 'DELIVERED' : 'PENDING');
                return (
                  <tr key={order.id}>
                    <td className={styles.orderId}>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td>{order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}</td>
                    <td className={styles.muted}>{formatDateTime(order.createdAt)}</td>
                    <td>
                      <span style={{
                        fontSize:   11,
                        fontWeight: 500,
                        color:      statusColors[s] ?? '#666',
                      }}>
                        {s}
                      </span>
                    </td>
                    <td className={styles.amount}>{formatCurrency(order.totalPrice)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}