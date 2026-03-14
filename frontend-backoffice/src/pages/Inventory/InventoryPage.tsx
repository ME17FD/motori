import { useState } from 'react';
import { useInventory, useInventoryMutations } from '../../hooks/useInventory';
import CatalogTable from '../../components/Tables/CatalogTable';
import type { CatalogColumn } from '../../components/Tables/CatalogTable';
import InventoryModal from '../../components/Modals/InventoryModal';
import InventoryStatusBadge from '../../components/ui/InventoryStatusBadge';
import LowStockAlert from '../../components/ui/LowStockAlert';
import Pagination from '../../components/ui/Pagination';
import type { Inventory, InventoryFilters, InventoryStatus } from '../../types/inventory';
import type { UpdateInventoryRequest } from '../../types/inventory';
import styles from '../../styles/pages/Inventory/InventoryPage.module.css';

const PAGE_SIZE = 15;

const STATUS_OPTIONS: Array<{ label: string; value: InventoryStatus | '' }> = [
  { label: 'All statuses',  value: '' },
  { label: 'Available',     value: 'AVAILABLE' },
  { label: 'Out of stock',  value: 'OUT_OF_STOCK' },
  { label: 'Discontinued',  value: 'DISCONTINUED' },
];

/**
 * Inventory management page.
 * Supports filtering by status, availability, low-stock flag and search.
 */
export default function InventoryPage() {
  const [page, setPage]           = useState(0);
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState<InventoryStatus | ''>('');
  const [lowStock, setLowStock]   = useState(false);
  const [editTarget, setEditTarget] = useState<Inventory | null>(null);

  const filters: InventoryFilters = {
    page,
    size: PAGE_SIZE,
    search:  search  || undefined,
    status:  status  || undefined,
    lowStock: lowStock || undefined,
  };

  const { data, isLoading }  = useInventory(filters);
  const { update }           = useInventoryMutations();

  const handleUpdate = (payload: UpdateInventoryRequest) => {
    if (!editTarget) return;
    update.mutate(
      { id: editTarget.id, payload },
      { onSuccess: () => setEditTarget(null) },
    );
  };

  const columns: CatalogColumn<Inventory>[] = [
    {
      key: 'product',
      header: 'Product',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600 }}>
            {item.productName ?? `Product #${item.productId}`}
          </div>
          {item.brandName && (
            <div style={{ fontSize: 12, color: '#5c5c5c' }}>{item.brandName}</div>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => (
        <span style={{ fontSize: 12, color: '#5c5c5c' }}>
          {item.productType ?? '—'}
        </span>
      ),
      width: '100px',
    },
    {
      key: 'quantity',
      header: 'Qty',
      width: '80px',
      render: (item) => (
        <strong style={{
          color: item.quantity === 0
            ? 'var(--bo-status-cancelled)'
            : item.quantity <= (item.lowStockThreshold ?? 5)
              ? '#b45309'
              : 'var(--color-black)',
        }}>
          {item.quantity}
        </strong>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <InventoryStatusBadge
          status={item.status}
          quantity={item.quantity}
          threshold={item.lowStockThreshold}
        />
      ),
    },
    {
      key: 'available',
      header: 'Available',
      width: '90px',
      render: (item) => (
        <span style={{
          fontSize: 12,
          color: item.available ? '#065f46' : '#b91c1c',
          fontWeight: 500,
        }}>
          {item.available ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      {/* Low stock alert banner */}
      <LowStockAlert />

      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Inventory</h2>
          <p className={styles.subtitle}>
            {data?.totalElements ?? 0} entries
          </p>
        </div>
      </div>

      {/* Filters toolbar */}
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search product…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />

        <select
          className={styles.select}
          value={status}
          onChange={(e) => { setStatus(e.target.value as InventoryStatus | ''); setPage(0); }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={lowStock}
            onChange={(e) => { setLowStock(e.target.checked); setPage(0); }}
            style={{ accentColor: 'var(--color-red)' }}
          />
          Low stock only
        </label>
      </div>

      <CatalogTable
        columns={columns}
        data={data?.content ?? []}
        loading={isLoading}
        onEdit={(item) => setEditTarget(item)}
        emptyMessage="No inventory entries found."
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

      <InventoryModal
        open={!!editTarget}
        item={editTarget}
        loading={update.isPending}
        onSubmit={handleUpdate}
        onClose={() => setEditTarget(null)}
      />
    </div>
  );
}