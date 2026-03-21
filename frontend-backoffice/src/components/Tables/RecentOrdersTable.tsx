import type { Order } from '../../types/order';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import styles from '../../styles/Components/tables/RecentOrdersTable.module.css';

interface RecentOrdersTableProps {
  orders: Order[];
  loading?: boolean;
}

/**
 * Compact recent orders table for the dashboard widget.
 * Adapted to OrderResponse from product-service.
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
              <th>Items</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#888', padding: '24px' }}>
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className={styles.orderId}>
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                  <td className={styles.muted}>{formatDateTime(order.createdAt)}</td>
                  <td>
                    <span style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: order.completed
                        ? 'rgba(16,185,129,0.12)'
                        : 'rgba(245,158,11,0.12)',
                      color: order.completed ? '#065f46' : '#b45309',
                      fontWeight: 500,
                    }}>
                      {order.status ?? (order.completed ? 'Completed' : 'Pending')}
                    </span>
                  </td>
                  <td className={styles.amount}>
                    {formatCurrency(order.totalPrice)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}