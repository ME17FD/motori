import { useState } from 'react';
import { useInventory, useInventoryMutations } from '../../hooks/useInventory';
import CatalogTable from '../../components/Tables/CatalogTable';
import type { CatalogColumn } from '../../components/Tables/CatalogTable';
import ConfirmDialog from '../../components/Modals/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import type { Inventory, InventoryFilters } from '../../types/inventory';
import { formatDate } from '../../utils/formatters';
import styles from '../../styles/pages/Inventory/InventoryPage.module.css';

const PAGE_SIZE = 15;

/**
 * Inventory management page.
 * Each inventory item represents ONE physical unit (a part OR an equipment).
 * Wired to /api/products/inventories via the gateway.
 */
export default function InventoryPage() {
  const [page, setPage]             = useState(0);
  const [available, setAvailable]   = useState<boolean | undefined>(undefined);
  const [type, setType]             = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Inventory | null>(null);

  const filters: InventoryFilters = {
    page,
    size:      PAGE_SIZE,
    available: available,
    type:      type || undefined,
  };

  const { data, isLoading } = useInventory(filters);
  const { remove }          = useInventoryMutations();

  const columns: CatalogColumn<Inventory>[] = [
    {
      key: 'product',
      header: 'Product',
      render: (item) => {
        const name = item.part?.name ?? item.equipement?.name ?? '—';
        const ref  = item.part?.ref;
        return (
          <div>
            <div style={{ fontWeight: 600 }}>{name}</div>
            {ref && <div style={{ fontSize: 11, color: '#888', fontFamily: 'monospace' }}>{ref}</div>}
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      width: '100px',
      render: (item) => (
        <span style={{
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 12,
          background: item.part ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)',
          color: item.part ? '#1d4ed8' : '#6d28d9',
          fontWeight: 500,
        }}>
          {item.part ? 'Part' : 'Equipment'}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment status',
      render: (item) => (
        <span style={{ fontSize: 12, color: '#5c5c5c' }}>
          {item.paymentStatus ?? '—'}
        </span>
      ),
    },
    {
      key: 'expiredAt',
      header: 'Expires',
      render: (item) => item.expiredAt
        ? <span style={{ fontSize: 12, color: '#5c5c5c' }}>{formatDate(item.expiredAt)}</span>
        : <span style={{ color: '#888' }}>—</span>,
    },
    {
      key: 'soldAt',
      header: 'Sold at',
      render: (item) => item.soldAt
        ? <span style={{ fontSize: 12, color: '#065f46', fontWeight: 500 }}>{formatDate(item.soldAt)}</span>
        : <span style={{ color: '#888' }}>Available</span>,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Inventory</h2>
          <p className={styles.subtitle}>
            {data?.page.totalElements ?? 0} inventory items
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select
          className={styles.select}
          value={available === undefined ? '' : String(available)}
          onChange={(e) => {
            setAvailable(e.target.value === '' ? undefined : e.target.value === 'true');
            setPage(0);
          }}
        >
          <option value="">All items</option>
          <option value="true">Available only</option>
          <option value="false">Sold only</option>
        </select>

        <select
          className={styles.select}
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(0); }}
        >
          <option value="">All types</option>
          <option value="PART">Parts</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>
      </div>

      <CatalogTable
        columns={columns}
        data={data?.content ?? []}
        loading={isLoading}
        onDelete={(item) => setDeleteTarget(item)}
        emptyMessage="No inventory items found."
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete inventory item"
        message={`Delete this inventory item? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}