/**
 * RecentOrdersTable — compact orders table for the dashboard.
 * Shows the 10 most recent orders with status badge and amount.
 */

import { useNavigate } from 'react-router-dom';
import type { OrderDto } from '../../types/order';
import { OrderStatusBadge } from '../ui/OrderStatusBadge';
import styles from '../../styles/Components/tables/RecentOrdersTable.module.css';

interface Props {
  orders: OrderDto[];
  isLoading?: boolean;
}

/** Formats ISO date string to readable short date */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/** Skeleton row for loading state */
function SkeletonRow() {
  return (
    <tr className={styles.skeletonRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i}><div className={styles.skeletonCell} /></td>
      ))}
    </tr>
  );
}

export function RecentOrdersTable({ orders, isLoading }: Props) {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Order ID</th>
            <th className={styles.th}>User</th>
            <th className={styles.th}>Date</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Total</th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            : orders.map((order) => (
                <tr
                  key={order.id}
                  className={styles.row}
                  onClick={() => navigate(`/orders?highlight=${order.id}`)}
                  title="View order"
                >
                  <td className={styles.td}>
                    <span className={styles.orderId}>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className={styles.td}>User #{order.userId}</td>
                  <td className={styles.td}>{formatDate(order.createdAt)}</td>
                  <td className={styles.td}>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className={styles.td}>
                    <span className={styles.amount}>
                      {new Intl.NumberFormat('fr-MA', {
                        style: 'currency',
                        currency: 'MAD',
                        maximumFractionDigits: 0,
                      }).format(order.totalAmount)}
                    </span>
                  </td>
                </tr>
              ))}

          {!isLoading && !orders.length && (
            <tr>
              <td colSpan={5} className={styles.empty}>
                No recent orders.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}