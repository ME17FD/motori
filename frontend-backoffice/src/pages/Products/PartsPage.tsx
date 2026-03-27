/**
 * PartsPage — full-featured spare parts management page.
 *
 * Features:
 *   - Paginated table with filters (name, brand, category, status, price range)
 *   - Create / Edit via ProductModal
 *   - Delete with ConfirmDialog
 *   - Status badge and stock indicator per row
 */

import { useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { useParts, useDeletePart } from '../../hooks/useParts';
import { useBrands } from '../../hooks/useBrands';
import { useCategories } from '../../hooks/useCategories';
import { ProductModal } from '../../components/Modals/ProductModal';
import { ConfirmDialog } from '../../components/Modals/ConfirmDialog';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { formatCurrency } from '../../utils/formatters';
import type { PartDto, ProductFilters, ProductStatus } from '../../types/product';
import styles from '../../styles/pages/Products/ProductsPage.module.css';

const PAGE_SIZE = 20;

const STATUSES: ProductStatus[] = ['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED'];

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className={styles.td}>
          <div className={styles.skeletonCell} />
        </td>
      ))}
    </tr>
  );
}

export function PartsPage() {
  // ── Filters ────────────────────────────────────────────────────────────
  const [name, setName]           = useState('');
  const [brandId, setBrandId]     = useState<number | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [status, setStatus]       = useState<ProductStatus | ''>('');
  const [minPrice, setMinPrice]   = useState('');
  const [maxPrice, setMaxPrice]   = useState('');
  const [page, setPage]           = useState(0);

  // ── Modal state ────────────────────────────────────────────────────────
  const [showCreate, setShowCreate]     = useState(false);
  const [editTarget, setEditTarget]     = useState<PartDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PartDto | null>(null);

  // ── Data ───────────────────────────────────────────────────────────────
  const filters: ProductFilters = {
    name:       name       || undefined,
    brandId:    brandId,
    categoryId: categoryId,
    status:     status     || undefined,
    minPrice:   minPrice   ? parseFloat(minPrice) : undefined,
    maxPrice:   maxPrice   ? parseFloat(maxPrice) : undefined,
    page,
    size: PAGE_SIZE,
  };

  const { data, isLoading, isError } = useParts(filters);
  const { data: brands     = [] }    = useBrands('PartBrand');
  const { data: categories = [] }    = useCategories('PartCategory');
  const deletePart                   = useDeletePart();

  // ── Helpers ────────────────────────────────────────────────────────────
  const resetPage = useCallback(() => setPage(0), []);

  const clearFilters = () => {
    setName('');
    setBrandId(undefined);
    setCategoryId(undefined);
    setStatus('');
    setMinPrice('');
    setMaxPrice('');
    setPage(0);
  };

  const hasFilters = name || brandId || categoryId || status || minPrice || maxPrice;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deletePart.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className={styles.page}>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Parts</h2>
          {data && (
            <p className={styles.subtitle}>
              {data.totalElements.toLocaleString()} parts total
            </p>
          )}
        </div>
        <button
          className={styles.addBtn}
          onClick={() => setShowCreate(true)}
        >
          <Plus size={15} />
          Add Part
        </button>
      </div>

      {/* ── Filter bar ────────────────────────────────────────────── */}
      <div className={styles.filterBar}>
        {/* Name search */}
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

        {/* Brand */}
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

        {/* Category */}
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

        {/* Status */}
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

        {/* Price range */}
        <div className={styles.priceRange}>
          <input
            type="number"
            className={styles.priceInput}
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); resetPage(); }}
          />
          <span className={styles.priceSep}>–</span>
          <input
            type="number"
            className={styles.priceInput}
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); resetPage(); }}
          />
        </div>

        {/* Clear */}
        {hasFilters && (
          <button className={styles.clearBtn} onClick={clearFilters}>
            <X size={13} />
            Clear
          </button>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <div className={styles.tableCard}>
        {isError ? (
          <div className={styles.errorState}>
            Failed to load parts. Please refresh.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>ID</th>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Reference</th>
                  <th className={styles.th}>Brand</th>
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
                  : data?.content.map((part) => (
                      <tr key={part.id} className={styles.row}>
                        <td className={styles.td}>
                          <span className={styles.idChip}>#{part.id}</span>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.productName}>{part.name}</span>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.reference}>
                            {part.reference}
                          </span>
                        </td>
                        <td className={styles.td}>
                          {part.brandName ?? `#${part.brandId}`}
                        </td>
                        <td className={styles.td}>
                          {formatCurrency(part.price)}
                        </td>
                        <td className={styles.td}>
                          <span
                            className={
                              part.stock === 0
                                ? styles.stockZero
                                : part.stock < 5
                                ? styles.stockLow
                                : styles.stockOk
                            }
                          >
                            {part.stock}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <StatusBadge status={part.status} />
                        </td>
                        <td className={styles.td}>
                          <div className={styles.rowActions}>
                            <button
                              className={styles.iconBtn}
                              onClick={() => setEditTarget(part)}
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                              onClick={() => setDeleteTarget(part)}
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
                    <td colSpan={8} className={styles.emptyState}>
                      No parts match the current filters.
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

      {/* ── Modals ────────────────────────────────────────────────── */}
      {showCreate && (
        <ProductModal
          productType="part"
          onClose={() => setShowCreate(false)}
        />
      )}
      {editTarget && (
        <ProductModal
          productType="part"
          editItem={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Part"
          message={`Delete "${deleteTarget.name}" (${deleteTarget.reference})? This cannot be undone.`}
          confirmLabel="Delete"
          isLoading={deletePart.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}