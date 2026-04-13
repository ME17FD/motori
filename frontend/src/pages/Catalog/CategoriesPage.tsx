import { useState } from 'react';
import { useCategories, useCategoryMutations } from '../../hooks/useCategories';
import CatalogTable from '../../components/Tables/CatalogTable';
import type { CatalogColumn } from '../../components/Tables/CatalogTable';
import CategoryModal from '../../components/Modals/CategoryModal';
import ConfirmDialog from '../../components/Modals/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import type { Category, CreateCategoryRequest } from '../../types/category';
import styles from '../../styles/pages/Catalog/CatalogPage.module.css';

const PAGE_SIZE = 10;

export default function CategoriesPage() {
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data, isLoading } = useCategories({ page, size: PAGE_SIZE });
  const { create, update, remove } = useCategoryMutations();

  const handleSubmit = (formData: CreateCategoryRequest) => {
    if (editTarget) {
      update.mutate(
        { id: editTarget.id, payload: formData },
        { onSuccess: () => setModalOpen(false) },
      );
    } else {
      create.mutate(formData, { onSuccess: () => setModalOpen(false) });
    }
  };

  const columns: CatalogColumn<Category>[] = [
    { key: 'id',         header: 'ID',     render: (c) => c.id,                              width: '60px' },
    { key: 'name',       header: 'Name',   render: (c) => <strong>{c.name}</strong> },
    { key: 'slug',       header: 'Slug',   render: (c) => <code>{c.slug ?? '—'}</code> },
    { key: 'parentName', header: 'Parent', render: (c) => c.parentName ?? <span style={{ color: '#888' }}>Root</span> },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Categories</h2>
          <p className={styles.subtitle}>
            {data?.totalElements ?? 0} categories
          </p>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          type="button"
        >
          + New category
        </button>
      </div>

      <CatalogTable
        columns={columns}
        data={data?.content ?? []}
        loading={isLoading}
        onEdit={(c) => { setEditTarget(c); setModalOpen(true); }}
        onDelete={(c) => setDeleteTarget(c)}
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

      <CategoryModal
        open={modalOpen}
        initial={editTarget}
        loading={create.isPending || update.isPending}
        onSubmit={handleSubmit}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete category"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onConfirm={() => {
          if (deleteTarget) remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}