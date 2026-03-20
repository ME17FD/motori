/**
 * Orders Management Page
 * Admin page for full order lifecycle management.
 * Features include: search by tracking number, filter by status/date range,
 * detail view, status updates, tracking updates, and export (CSV/JSON).
 */

import { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { exportOrders } from '../../services/orderService';
import { downloadBlob } from '../../utils/export';
import CatalogTable from '../../components/Tables/CatalogTable';
import type { CatalogColumn } from '../../components/Tables/CatalogTable';
import OrderDetailModal from '../../components/Modals/OrderDetailModal';
import OrderStatusBadge from '../../components/ui/OrderStatusBadge';
import Pagination from '../../components/ui/Pagination';
import type { Order, OrderStatus } from '../../types/order';
import type { OrderFilters } from '../../services/orderService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import styles from '../../styles/pages/Orders/OrdersPage.module.css';

const PAGE_SIZE = 15;

const STATUS_OPTIONS: Array<{ label: string; value: OrderStatus | '' }> = [
  { label: 'All statuses',  value: '' },
  { label: 'Pending',       value: 'PENDING' },
  { label: 'Confirmed',     value: 'CONFIRMED' },
  { label: 'Processing',    value: 'PROCESSING' },
  { label: 'Shipped',       value: 'SHIPPED' },
  { label: 'Delivered',     value: 'DELIVERED' },
  { label: 'Cancelled',     value: 'CANCELLED' },
];

/**
 * Orders management page.
 * Full search, filter, detail view, status change, tracking update and export.
 */
export default function OrdersPage() {
  const [page, setPage]               = useState(0);
  const [search, setSearch]           = useState('');
  const [status, setStatus]           = useState<OrderStatus | ''>('');
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [exporting, setExporting]     = useState(false);

  const filters: OrderFilters = {
    page,
    size: PAGE_SIZE,
    status:    status    || undefined,
    startDate: startDate || undefined,
    endDate:   endDate   || undefined,
    trackingNumber: search || undefined,
  };

  const { data, isLoading } = useOrders(filters);

  const handleExport = async (format: 'csv' | 'json') => {
    setExporting(true);
    try {
      const blob = await exportOrders({
        format,
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      const date = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `orders-${date}.${format}`);
    } finally {
      setExporting(false);
    }
  };

  const columns: CatalogColumn<Order>[] = [
    {
      key: 'id',
      header: 'Order ID',
      width: '130px',
      render: (o) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          #{o.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'userId',
      header: 'User',
      width: '80px',
      render: (o) => `#${o.userId}`,
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (o) => (
        <span style={{ fontSize: 12, color: '#5c5c5c' }}>
          {formatDateTime(o.createdAt)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => <OrderStatusBadge status={o.status} />,
    },
    {
      key: 'tracking',
      header: 'Tracking',
      render: (o) => (
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#5c5c5c' }}>
          {o.trackingNumber ?? '—'}
        </span>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      width: '60px',
      render: (o) => o.items.length,
    },
    {
      key: 'total',
      header: 'Total',
      width: '120px',
      render: (o) => <strong>{formatCurrency(o.totalAmount)}</strong>,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Orders</h2>
          <p className={styles.subtitle}>
            {data?.totalElements ?? 0} orders total
          </p>
        </div>

        {/* Export buttons */}
        <div className={styles.exportGroup}>
          <button
            className={styles.exportBtn}
            onClick={() => handleExport('csv')}
            disabled={exporting}
            type="button"
          >
            Export CSV
          </button>
          <button
            className={styles.exportBtn}
            onClick={() => handleExport('json')}
            disabled={exporting}
            type="button"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search tracking number…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />

        <select
          className={styles.select}
          value={status}
          onChange={(e) => { setStatus(e.target.value as OrderStatus | ''); setPage(0); }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <input
          type="date"
          className={styles.select}
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
        />
        <input
          type="date"
          className={styles.select}
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
        />

        {(search || status || startDate || endDate) && (
          <button
            className={styles.clearBtn}
            type="button"
            onClick={() => {
              setSearch(''); setStatus('');
              setStartDate(''); setEndDate('');
              setPage(0);
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <CatalogTable
        columns={columns}
        data={data?.content ?? []}
        loading={isLoading}
        onEdit={(o) => setSelectedId(o.id)}
        emptyMessage="No orders found."
      />

      {data && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      <OrderDetailModal
        open={!!selectedId}
        orderId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}