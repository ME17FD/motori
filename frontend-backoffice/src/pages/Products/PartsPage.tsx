import { useState } from 'react';
import { useParts, usePartMutations } from '../../hooks/useParts';
import CatalogTable from '../../components/Tables/CatalogTable';
import type { CatalogColumn } from '../../components/Tables/CatalogTable';
import ProductModal from '../../components/Modals/ProductModal';
import ConfirmDialog from '../../components/Modals/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import type { Part, PartRequest } from '../../types/product';
import type { PartFilters } from '../../services/partService';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/pages/Products/ProductsPage.module.css';

const PAGE_SIZE = 12;

/**
 * Parts management page.
 * Wired to /api/products/parts via the gateway.
 */
export default function PartsPage() {
  const [page, setPage]               = useState(0);
  const [search, setSearch]           = useState('');
  const [modalOpen, setModalOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState<Part | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Part | null>(null);

  const filters: PartFilters = {
    name: search || undefined,
    page,
    size: PAGE_SIZE,
  };

  const { data, isLoading }                                = useParts(filters);
  const { create, update, remove, uploadImage, removeImage } = usePartMutations();

  const handleSubmit = (formData: PartRequest, newImage: File | null) => {
    if (editTarget) {
      update.mutate(
        { id: editTarget.id, payload: formData },
        {
          onSuccess: async (updated) => {
            if (newImage) await uploadImage.mutateAsync({ id: updated.id, file: newImage });
            setModalOpen(false);
          },
        },
      );
    } else {
      create.mutate(formData, {
        onSuccess: async (created) => {
          if (newImage) await uploadImage.mutateAsync({ id: created.id, file: newImage });
          setModalOpen(false);
        },
      });
    }
  };

  const columns: CatalogColumn<Part>[] = [
    {
      key: 'image',
      header: '',
      width: '56px',
      render: (p) => p.imageUrl
        ? <img src={p.imageUrl} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
        : <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔧</div>,
    },
    { key: 'name',     header: 'Name',     render: (p) => <strong>{p.name}</strong> },
    { key: 'ref',      header: 'Ref',      render: (p) => <code style={{ fontSize: 11 }}>{p.ref}</code> },
    { key: 'brand',    header: 'Brand',    render: (p) => p.brand.name },
    { key: 'category', header: 'Category', render: (p) => p.category.name },
    { key: 'price',    header: 'Price',    render: (p) => formatCurrency(p.price), width: '120px' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Parts</h2>
          <p className={styles.subtitle}>{data?.page.totalElements ?? 0} parts</p>
        </div>
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search parts…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
          <button
            className={styles.addBtn}
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
            type="button"
          >
            + New part
          </button>
        </div>
      </div>

      <CatalogTable
        columns={columns}
        data={data?.content ?? []}
        loading={isLoading}
        onEdit={(p) => { setEditTarget(p); setModalOpen(true); }}
        onDelete={(p) => setDeleteTarget(p)}
        emptyMessage="No parts found."
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

      <ProductModal
        open={modalOpen}
        productType="PART"
        initial={editTarget}
        loading={create.isPending || update.isPending}
        onSubmitPart={handleSubmit}
        onDeleteImage={editTarget ? () => removeImage.mutate(editTarget.id) : undefined}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete part"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
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