/**
 * EquipmentPage — gear/equipment management page.
 * Mirrors PartsPage but for equipment-specific fields (size, color).
 */

import { useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { useEquipements, useDeleteEquipement } from '../../hooks/useEquipements';
import { useBrands } from '../../hooks/useBrands';
import { useCategories } from '../../hooks/useCategories';
import { ProductModal } from '../../components/Modals/ProductModal';
import { ConfirmDialog } from '../../components/Modals/ConfirmDialog';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { formatCurrency } from '../../utils/formatters';
import type {
  EquipementDto,
  ProductFilters,
  ProductStatus,
} from '../../types/product';
import styles from '../../styles/pages/Products/ProductsPage.module.css';

const PAGE_SIZE = 20;
const STATUSES: ProductStatus[] = ['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED'];

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className={styles.td}>
          <div className={styles.skeletonCell} />
        </td>
      ))}
    </tr>
  );
}

export function EquipmentPage() {
  const [name, setName]             = useState('');
  const [brandId, setBrandId]       = useState<number | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [status, setStatus]         = useState<ProductStatus | ''>('');
  const [page, setPage]             = useState(0);

  const [showCreate, setShowCreate]     = useState(false);
  const [editTarget, setEditTarget]     = useState<EquipementDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EquipementDto | null>(null);

  const filters: ProductFilters = {
    name:       name       || undefined,
    brandId,
    categoryId,
    status:     status     || undefined,
    page,
    size: PAGE_SIZE,
  };

  const { data, isLoading, isError } = useEquipements(filters);
  const { data: brands     = [] }    = useBrands('EquipementBrand');
  const { data: categories = [] }    = useCategories('EquipementCategory');
  const deleteEquipement             = useDeleteEquipement();

  const resetPage = useCallback(() => setPage(0), []);

  const clearFilters = () => {
    setName('');
    setBrandId(undefined);
    setCategoryId(undefined);
    setStatus('');
    setPage(0);
  };

  const hasFilters = name || brandId || categoryId || status;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteEquipement.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Equipment</h2>
          {data && (
            <p className={styles.subtitle}>
              {data.totalElements.toLocaleString()} items total
            </p>
          )}
        </div>
        <button className={styles.addBtn} onClick={() => setShowCreate(true)}>
          <Plus size={15} />
          Add Equipment
        </button>
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name…"
            value={name}
            onChange={(e) => { setName(e.target.value); resetPage(); }}
          />
        </div>

        <select
          className={styles.select}
          value={brandId ?? ''}
          onChange={(e) => {
            setBrandId(e.target.value ? parseInt(e.target.value, 10) : undefined);
            resetPage();
          }}
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={categoryId ?? ''}
          onChange={(e) => {
            setCategoryId(e.target.value ? parseInt(e.target.value, 10) : undefined);
            resetPage();
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ProductStatus | '');
            resetPage();
          }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {hasFilters && (
          <button className={styles.clearBtn} onClick={clearFilters}>
            <X size={13} />
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {isError ? (
          <div className={styles.errorState}>
            Failed to load equipment. Please refresh.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>ID</th>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Brand</th>
                  <th className={styles.th}>Size</th>
                  <th className={styles.th}>Color</th>
                  <th className={styles.th}>Price</th>
                  <th className={styles.th}>Stock</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))
                  : data?.content.map((eq) => (
                      <tr key={eq.id} className={styles.row}>
                        <td className={styles.td}>
                          <span className={styles.idChip}>#{eq.id}</span>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.productName}>{eq.name}</span>
                        </td>
                        <td className={styles.td}>
                          {eq.brandName ?? `#${eq.brandId}`}
                        </td>
                        <td className={styles.td}>
                          {eq.size
                            ? <span className={styles.sizeChip}>{eq.size}</span>
                            : <span className={styles.na}>—</span>}
                        </td>
                        <td className={styles.td}>
                          {eq.color ? (
                            <div className={styles.colorCell}>
                              <span
                                className={styles.colorDot}
                                style={{ backgroundColor: eq.color.startsWith('#') ? eq.color : undefined }}
                              />
                              {eq.color}
                            </div>
                          ) : (
                            <span className={styles.na}>—</span>
                          )}
                        </td>
                        <td className={styles.td}>
                          {formatCurrency(eq.price)}
                        </td>
                        <td className={styles.td}>
                          <span
                            className={
                              eq.stock === 0
                                ? styles.stockZero
                                : eq.stock < 5
                                ? styles.stockLow
                                : styles.stockOk
                            }
                          >
                            {eq.stock}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <StatusBadge status={eq.status} />
                        </td>
                        <td className={styles.td}>
                          <div className={styles.rowActions}>
                            <button
                              className={styles.iconBtn}
                              onClick={() => setEditTarget(eq)}
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                              onClick={() => setDeleteTarget(eq)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                {!isLoading && data?.content.length === 0 && (
                  <tr>
                    <td colSpan={9} className={styles.emptyState}>
                      No equipment matches the current filters.
                    </td>
                  </tr>
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

      {showCreate && (
        <ProductModal
          productType="equipement"
          onClose={() => setShowCreate(false)}
        />
      )}
      {editTarget && (
        <ProductModal
          productType="equipement"
          editItem={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Equipment"
          message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          isLoading={deleteEquipement.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}