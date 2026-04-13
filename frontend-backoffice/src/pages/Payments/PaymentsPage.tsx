/**
 * PaymentsPage — filtered view of orders with PENDING payment.
 * Reuses the orders hooks with a status=PENDING filter.
 */

import { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { useUpdateOrderStatus } from '../../hooks/useOrders';
import { OrderStatusBadge } from '../../components/ui/OrderStatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { formatDate, formatCurrency, shortId } from '../../utils/formatters';
import styles from '../../styles/pages/Payments/PaymentsPage.module.css';

const PAGE_SIZE = 20;

export function PaymentsPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useOrders({
    status: 'PENDING',
    page,
    size: PAGE_SIZE,
  });

  const updateStatus = useUpdateOrderStatus();

  const handleValidate = async (orderId: string) => {
    await updateStatus.mutateAsync({ id: orderId, status: 'CONFIRMED' });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Pending Payments</h2>
          {data && (
            <p className={styles.subtitle}>
              {data.totalElements} order{data.totalElements !== 1 ? 's' : ''} awaiting payment
            </p>
          )}
        </div>
      </div>

      <div className={styles.tableCard}>
        {isError ? (
          <div className={styles.errorState}>Failed to load pending payments.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Order ID</th>
                  <th className={styles.th}>User</th>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th}>Total</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className={styles.td}>
                          <div className={styles.skeletonCell} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data?.content.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyState}>
                      No pending payments.
                    </td>
                  </tr>
                ) : (
                  data?.content.map((order) => (
                    <tr key={order.id} className={styles.row}>
                      <td className={styles.td}>
                        <span className={styles.orderId}>#{shortId(order.id)}</span>
                      </td>
                      <td className={styles.td}>User #{order.userId}</td>
                      <td className={styles.td}>{formatDate(order.createdAt)}</td>
                      <td className={styles.td}>
                        <span className={styles.amount}>
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className={styles.td}>
                        <button
                          className={styles.validateBtn}
                          onClick={() => handleValidate(order.id)}
                          disabled={updateStatus.isPending}
                        >
                          Validate Payment
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className={styles.paginationWrapper}>
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}