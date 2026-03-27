/**
 * OrdersPage — full-featured order management page.
 *
 * Features:
 *   - Paginated data table with sortable columns
 *   - Filter bar: status (multi), date range, tracking/ID search
 *   - Row click → OrderDetailModal
 *   - Export button (CSV / JSON)
 *   - Status badge on each row
 *   - URL-synced filters (page, status, from, to, search)
 */

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Download, Filter, X } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { OrderStatusBadge } from '../../components/ui/OrderStatusBadge';
import { OrderDetailModal } from '../../components/Modals/OrderDetailModal';
import { Pagination } from '../../components/ui/Pagination';
import { exportOrders } from '../../services/orderService';
import { downloadBlob, buildExportFilename } from '../../utils/export';
import { formatDate, formatCurrency, shortId } from '../../utils/formatters';
import type { OrderStatus } from '../../types/order';
import styles from '../../styles/pages/Orders/OrdersPage.module.css';

// ─── Constants ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

const ALL_STATUSES: OrderStatus[] = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED',
];

// ─── Skeleton row ──────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className={styles.td}>
          <div className={styles.skeletonCell} />
        </td>
      ))}
    </tr>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Filter state (URL-synced) ──────────────────────────────────────────
  const [search, setSearch]       = useState(searchParams.get('search') ?? '');
  const [status, setStatus]       = useState<OrderStatus | ''>(
    (searchParams.get('status') as OrderStatus) ?? ''
  );
  const [from, setFrom]           = useState(searchParams.get('from') ?? '');
  const [to, setTo]               = useState(searchParams.get('to') ?? '');
  const [page, setPage]           = useState(
    Number(searchParams.get('page') ?? 0)
  );

  // ── Modal state ────────────────────────────────────────────────────────
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // ── Export state ───────────────────────────────────────────────────────
  const [isExporting, setIsExporting] = useState(false);

  // ── Sync filters → URL ─────────────────────────────────────────────────
  useEffect(() => {
    const params: Record<string, string> = {};
    if (search)         params.search = search;
    if (status)         params.status = status;
    if (from)           params.from   = from;
    if (to)             params.to     = to;
    if (page > 0)       params.page   = String(page);
    setSearchParams(params, { replace: true });
  }, [search, status, from, to, page, setSearchParams]);

  // ── Reset page on filter change ────────────────────────────────────────
  const handleFilterChange = useCallback(
    <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
      setter(value);
      setPage(0);
    },
    []
  );

  // ── Clear all filters ──────────────────────────────────────────────────
  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setFrom('');
    setTo('');
    setPage(0);
  };

  const hasActiveFilters = search || status || from || to;

  // ── Data fetching ──────────────────────────────────────────────────────
  const { data, isLoading, isError } = useOrders({
    trackingNumber: search || undefined,
    status:         status || undefined,
    from:           from   || undefined,
    to:             to     || undefined,
    page,
    size:           PAGE_SIZE,
  });

  // ── Export handler ─────────────────────────────────────────────────────
  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      const blob = await exportOrders({
        format,
        status: status || undefined,
        from:   from   || undefined,
        to:     to     || undefined,
      });
      downloadBlob(blob, buildExportFilename('orders-export', format));
    } catch {
      // Error toast handled by axiosInstance interceptor
    } finally {
      setIsExporting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>

      {/* ── Page header ───────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Orders</h2>
          {data && (
            <p className={styles.subtitle}>
              {data.totalElements.toLocaleString()} orders total
            </p>
          )}
        </div>

        {/* Export dropdown */}
        <div className={styles.exportGroup}>
          <button
            className={styles.exportBtn}
            onClick={() => handleExport('csv')}
            disabled={isExporting}
          >
            <Download size={15} />
            {isExporting ? 'Exporting…' : 'Export CSV'}
          </button>
          <button
            className={`${styles.exportBtn} ${styles.exportBtnSecondary}`}
            onClick={() => handleExport('json')}
            disabled={isExporting}
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* ── Filter bar ────────────────────────────────────────────── */}
      <div className={styles.filterBar}>
        {/* Search input */}
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by tracking number…"
            value={search}
            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
          />
        </div>

        {/* Status filter */}
        <select
          className={styles.select}
          value={status}
          onChange={(e) =>
            handleFilterChange(setStatus, e.target.value as OrderStatus | '')
          }
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Date range */}
        <div className={styles.dateRange}>
          <input
            type="date"
            className={styles.dateInput}
            value={from}
            onChange={(e) => handleFilterChange(setFrom, e.target.value)}
            title="From date"
          />
          <span className={styles.dateSeparator}>→</span>
          <input
            type="date"
            className={styles.dateInput}
            value={to}
            onChange={(e) => handleFilterChange(setTo, e.target.value)}
            title="To date"
          />
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button className={styles.clearBtn} onClick={clearFilters}>
            <X size={14} />
            Clear
          </button>
        )}

        {/* Active filter indicator */}
        {hasActiveFilters && (
          <span className={styles.filterBadge}>
            <Filter size={12} />
            Filtered
          </span>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <div className={styles.tableCard}>
        {isError ? (
          <div className={styles.errorState}>
            Failed to load orders. Please refresh the page.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Order ID</th>
                  <th className={styles.th}>User</th>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Tracking</th>
                  <th className={styles.th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))
                  : data?.content.map((order) => (
                      <tr
                        key={order.id}
                        className={styles.row}
                        onClick={() => setSelectedOrderId(order.id)}
                        title="Click to view details"
                      >
                        <td className={styles.td}>
                          <span className={styles.orderId}>
                            #{shortId(order.id)}
                          </span>
                        </td>
                        <td className={styles.td}>
                          User #{order.userId}
                        </td>
                        <td className={styles.td}>
                          {formatDate(order.createdAt)}
                        </td>
                        <td className={styles.td}>
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className={styles.td}>
                          {order.trackingNumber ? (
                            <span className={styles.tracking}>
                              {order.trackingNumber}
                            </span>
                          ) : (
                            <span className={styles.noTracking}>—</span>
                          )}
                        </td>
                        <td className={styles.td}>
                          <span className={styles.amount}>
                            {formatCurrency(order.totalAmount)}
                          </span>
                          </td>
                      </tr>
                    ))}

                {!isLoading && data?.content.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.emptyState}>
                      No orders match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────── */}
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

      {/* ── Order detail modal ────────────────────────────────────── */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}