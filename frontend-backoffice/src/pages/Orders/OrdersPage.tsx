import { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import CatalogTable from '../../components/Tables/CatalogTable';
import type { CatalogColumn } from '../../components/Tables/CatalogTable';
import OrderDetailModal from '../../components/Modals/OrderDetailModal';
import Pagination from '../../components/ui/Pagination';
import type { Order } from '../../types/order';
import type { OrderFilters } from '../../services/orderService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import styles from '../../styles/pages/Orders/OrdersPage.module.css';

const PAGE_SIZE = 15;

export default function OrdersPage() {
  const [page, setPage]           = useState(0);
  const [status, setStatus]       = useState('');
  const [completed, setCompleted] = useState<boolean | undefined>(undefined);
  const [selected, setSelected]   = useState<Order | null>(null);

  const filters: OrderFilters = {
    page,
    size:      PAGE_SIZE,
    status:    status    || undefined,
    completed: completed,
  };

  const { data, isLoading } = useOrders(filters);

  const columns: CatalogColumn<Order>[] = [
    {
      key:    'id',
      header: 'Order ID',
      width:  '130px',
      render: (o) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          #{o.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key:    'userId',
      header: 'User',
      render: (o) => (
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#666' }}>
          {o.userId.toString().slice(0, 8)}
        </span>
      ),
    },
    {
      key:    'items',
      header: 'Items',
      width:  '70px',
      render: (o) => `${o.items?.length ?? 0} item${(o.items?.length ?? 0) !== 1 ? 's' : ''}`,
    },
    {
      key:    'createdAt',
      header: 'Date',
      render: (o) => (
        <span style={{ fontSize: 12, color: '#5c5c5c' }}>
          {formatDateTime(o.createdAt)}
        </span>
      ),
    },
    {
      key:    'status',
      header: 'Status',
      render: (o) => {
        const colors: Record<string, { bg: string; color: string }> = {
          PENDING:    { bg: 'rgba(245,158,11,0.12)',  color: '#b45309' },
          CONFIRMED:  { bg: 'rgba(59,130,246,0.12)',  color: '#1d4ed8' },
          PROCESSING: { bg: 'rgba(139,92,246,0.12)',  color: '#6d28d9' },
          SHIPPED:    { bg: 'rgba(20,184,166,0.12)',  color: '#0f766e' },
          DELIVERED:  { bg: 'rgba(16,185,129,0.12)',  color: '#065f46' },
          CANCELLED:  { bg: 'rgba(239,68,68,0.12)',   color: '#b91c1c' },
        };
        const s = o.status ?? (o.completed ? 'DELIVERED' : 'PENDING');
        const c = colors[s] ?? { bg: '#f4f5f7', color: '#666' };
        return (
          <span style={{
            fontSize:       11,
            padding:        '2px 8px',
            borderRadius:   12,
            background:     c.bg,
            color:          c.color,
            fontWeight:     500,
            whiteSpace:     'nowrap',
          }}>
            {s}
          </span>
        );
      },
    },
    {
      key:    'totalPrice',
      header: 'Total',
      width:  '120px',
      render: (o) => <strong>{formatCurrency(o.totalPrice)}</strong>,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Orders</h2>
          <p className={styles.subtitle}>
            {data?.page.totalElements ?? 0} orders total
          </p>
        </div>
      </div>

      <div className={styles.filters}>
        <select
          className={styles.select}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          className={styles.select}
          value={completed === undefined ? '' : String(completed)}
          onChange={(e) => {
            setCompleted(e.target.value === '' ? undefined : e.target.value === 'true');
            setPage(0);
          }}
        >
          <option value="">All</option>
          <option value="false">Active</option>
          <option value="true">Completed</option>
        </select>
      </div>

      <CatalogTable
        columns={columns}
        data={data?.content ?? []}
        loading={isLoading}
        onEdit={(o) => setSelected(o)}
        emptyMessage="No orders found."
      />

      {data && (
        <Pagination
          page={page}
          totalPages={data.page.totalPages}
          totalElements={data.page.totalElements}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      <OrderDetailModal
        open={!!selected}
        order={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}