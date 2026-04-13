/**
 * BrandsPage — manage all three brand types in a tabbed interface.
 *
 * Tabs: Vehicle Brands | Part Brands | Equipment Brands
 * Each tab: searchable list + create/edit/delete actions
 */

import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useBrands, useDeleteBrand } from '../../hooks/useBrands';
import { BrandModal } from '../../components/Modals/BrandModal';
import { ConfirmDialog } from '../../components/Modals/ConfirmDialog';
import type { BrandDto, BrandType } from '../../types/brand';
import styles from '../../styles/pages/Catalog/CatalogPage.module.css';

// ─── Tab config ────────────────────────────────────────────────────────────

const TABS: { label: string; type: BrandType }[] = [
  { label: 'Vehicle Brands',   type: 'VehiculeBrand' },
  { label: 'Part Brands',      type: 'PartBrand' },
  { label: 'Equipment Brands', type: 'EquipementBrand' },
];

// ─── Brand list for one tab ────────────────────────────────────────────────

interface BrandListProps {
  brandType: BrandType;
}

function BrandList({ brandType }: BrandListProps) {
  const [search, setSearch]               = useState('');
  const [showCreate, setShowCreate]       = useState(false);
  const [editTarget, setEditTarget]       = useState<BrandDto | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<BrandDto | null>(null);

  const { data: brands = [], isLoading } = useBrands(brandType);
  const deleteBrand = useDeleteBrand(brandType);

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBrand.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className={styles.listSection}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search brands…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className={styles.addBtn}
          onClick={() => setShowCreate(true)}
        >
          <Plus size={15} />
          Add Brand
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className={styles.td}><div className={styles.skeleton} /></td>
                  <td className={styles.td}><div className={styles.skeleton} /></td>
                  <td className={styles.td}><div className={styles.skeleton} style={{ width: 80 }} /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className={styles.emptyState}>
                  {search ? 'No brands match your search.' : 'No brands yet.'}
                </td>
              </tr>
            ) : (
              filtered.map((brand) => (
                <tr key={brand.id} className={styles.row}>
                  <td className={styles.td}>
                    <span className={styles.idChip}>#{brand.id}</span>
                  </td>
                  <td className={styles.td}>{brand.name}</td>
                  <td className={styles.td}>
                    <div className={styles.rowActions}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => setEditTarget(brand)}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        onClick={() => setDeleteTarget(brand)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Count */}
      {!isLoading && (
        <p className={styles.count}>
          {filtered.length} brand{filtered.length !== 1 ? 's' : ''}
          {search && ` matching "${search}"`}
        </p>
      )}

      {/* Create modal */}
      {showCreate && (
        <BrandModal
          brandType={brandType}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Edit modal */}
      {editTarget && (
        <BrandModal
          brandType={brandType}
          editBrand={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Brand"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          isLoading={deleteBrand.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export function BrandsPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Brands</h2>
        <p className={styles.pageSubtitle}>
          Manage vehicle, part, and equipment brands
        </p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab, i) => (
          <button
            key={tab.type}
            className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={styles.card}>
        <BrandList brandType={TABS[activeTab].type} />
      </div>
    </div>
  );
}