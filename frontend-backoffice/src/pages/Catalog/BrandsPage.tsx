/**
 * Brands Management Page
 * Admin page for CRUD operations on vehicle/product brands.
 * Displays paginated list with create, read, update, delete actions.
 * Features modal dialogs for edit/create and confirmation for delete.
 */

import { useState } from 'react';
import { useBrands, useBrandMutations } from '../../hooks/useBrands';
import CatalogTable from '../../components/Tables/CatalogTable';
import type { CatalogColumn } from '../../components/Tables/CatalogTable';
import BrandModal from '../../components/Modals/BrandModal';
import ConfirmDialog from '../../components/Modals/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import type { Brand, CreateBrandRequest } from '../../types/brand';
import { formatDate } from '../../utils/formatters';
import styles from '../../styles/pages/Catalog/CatalogPage.module.css';

const PAGE_SIZE = 10;

/**
 * Brands management page — list, create, edit, delete.
 */
export default function BrandsPage() {
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  const { data, isLoading } = useBrands({ page, size: PAGE_SIZE });
  const { create, update, remove } = useBrandMutations();

  const handleSubmit = (formData: CreateBrandRequest) => {
    if (editTarget) {
      update.mutate(
        { id: editTarget.id, payload: formData },
        { onSuccess: () => setModalOpen(false) },
      );
    } else {
      create.mutate(formData, { onSuccess: () => setModalOpen(false) });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  const columns: CatalogColumn<Brand>[] = [
    { key: 'id',        header: 'ID',         render: (b) => b.id,                                  width: '60px' },
    { key: 'name',      header: 'Name',        render: (b) => <strong>{b.name}</strong> },
    { key: 'slug',      header: 'Slug',        render: (b) => <code>{b.slug ?? '—'}</code> },
    { key: 'createdAt', header: 'Created',     render: (b) => b.createdAt ? formatDate(b.createdAt) : '—' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Brands</h2>
          <p className={styles.subtitle}>
            {data?.totalElements ?? 0} brand{(data?.totalElements ?? 0) !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          type="button"
        >
          + New brand
        </button>
      </div>

      <CatalogTable
        columns={columns}
        data={data?.content ?? []}
        loading={isLoading}
        onEdit={(b) => { setEditTarget(b); setModalOpen(true); }}
        onDelete={(b) => setDeleteTarget(b)}
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

      <BrandModal
        open={modalOpen}
        initial={editTarget}
        loading={create.isPending || update.isPending}
        onSubmit={handleSubmit}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete brand"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}