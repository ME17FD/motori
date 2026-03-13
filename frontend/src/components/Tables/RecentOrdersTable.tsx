import type { Order } from '../../types/order';
import StatusBadge from '../ui/StatusBadge';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import styles from '../../styles/Components/tables/RecentOrdersTable.module.css';

interface RecentOrdersTableProps {
  orders: Order[];
  loading?: boolean;
}

/**
 * Compact recent orders table for the dashboard widget.
 * Full order management with filters lives in the Orders page (Step 6).
 */
export default function RecentOrdersTable({
  orders,
  loading = false,
}: RecentOrdersTableProps) {
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
              <th>User</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className={styles.orderId}>
                  #{order.id.slice(0, 8).toUpperCase()}
                </td>
                <td>{order.userId}</td>
                <td className={styles.muted}>{formatDateTime(order.createdAt)}</td>
                <td><StatusBadge status={order.status} /></td>
                <td className={styles.amount}>
                  {formatCurrency(order.totalAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}