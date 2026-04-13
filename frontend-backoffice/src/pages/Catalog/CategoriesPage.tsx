import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useCategories, useDeleteCategory } from '../../hooks/useCategories';
import { CategoryModal } from '../../components/Modals/CategoryModal';
import { ConfirmDialog } from '../../components/Modals/ConfirmDialog';
import type { CategoryDto, CategoryType } from '../../types/category';
import styles from '../../styles/pages/Catalog/CatalogPage.module.css';

const TABS: { label: string; type: CategoryType }[] = [
  { label: 'Part Categories',      type: 'PartCategory' },
  { label: 'Equipment Categories', type: 'EquipementCategory' },
];

interface CategoryListProps {
  categoryType: CategoryType;
}

function CategoryList({ categoryType }: CategoryListProps) {
  const [search, setSearch]             = useState('');
  const [showCreate, setShowCreate]     = useState(false);
  const [editTarget, setEditTarget]     = useState<CategoryDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryDto | null>(null);

  const { data: categories = [], isLoading } = useCategories(categoryType);
  const deleteCategory = useDeleteCategory(categoryType);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteCategory.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className={styles.listSection}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className={styles.addBtn} onClick={() => setShowCreate(true)}>
          <Plus size={15} />
          Add Category
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Parent</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 4 }).map((__, j) => (
                    <td key={j} className={styles.td}>
                      <div className={styles.skeleton} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyState}>
                  {search ? 'No categories match your search.' : 'No categories yet.'}
                </td>
              </tr>
            ) : (
              filtered.map((cat) => (
                <tr key={cat.id} className={styles.row}>
                  <td className={styles.td}>
                    <span className={styles.idChip}>#{cat.id}</span>
                  </td>
                  <td className={styles.td}>{cat.name}</td>
                  <td className={styles.td}>
                    {cat.parentCategoryId
                      ? <span className={styles.parentChip}>
                          {cat.parentCategoryName ?? `#${cat.parentCategoryId}`}
                        </span>
                      : <span className={styles.rootChip}>Root</span>}
                  </td>
                  <td className={styles.td}>
                    <div className={styles.rowActions}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => setEditTarget(cat)}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        onClick={() => setDeleteTarget(cat)}
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

      {!isLoading && (
        <p className={styles.count}>
          {filtered.length} categor{filtered.length !== 1 ? 'ies' : 'y'}
        </p>
      )}

      {showCreate && (
        <CategoryModal
          categoryType={categoryType}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editTarget && (
        <CategoryModal
          categoryType={categoryType}
          editCategory={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Category"
          message={`Delete "${deleteTarget.name}"? This may affect products assigned to it.`}
          confirmLabel="Delete"
          isLoading={deleteCategory.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export function CategoriesPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Categories</h2>
        <p className={styles.pageSubtitle}>
          Manage part and equipment categories
        </p>
      </div>

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

      <div className={styles.card}>
        <CategoryList categoryType={TABS[activeTab].type} />
      </div>
    </div>
  );
}