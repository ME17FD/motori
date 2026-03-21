import { useState } from 'react';
import { useEquipements, useEquipementMutations } from '../../hooks/useEquipements';
import CatalogTable from '../../components/Tables/CatalogTable';
import type { CatalogColumn } from '../../components/Tables/CatalogTable';
import ProductModal from '../../components/Modals/ProductModal';
import ConfirmDialog from '../../components/Modals/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import type { Equipement, EquipementRequest } from '../../types/product';
import type { EquipementFilters } from '../../services/equipementService';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/pages/Products/ProductsPage.module.css';

const PAGE_SIZE = 12;

/**
 * Equipment management page.
 * Wired to /api/products/equipements via the gateway.
 */
export default function EquipmentPage() {
  const [page, setPage]               = useState(0);
  const [search, setSearch]           = useState('');
  const [modalOpen, setModalOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState<Equipement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Equipement | null>(null);

  const filters: EquipementFilters = {
    name:     search || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const { data, isLoading }                                = useEquipements(filters);
  const { create, update, remove, uploadImage, removeImage } = useEquipementMutations();

  const handleSubmit = (formData: EquipementRequest, newImage: File | null) => {
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

  const columns: CatalogColumn<Equipement>[] = [
    {
      key: 'image',
      header: '',
      width: '56px',
      render: (e) => e.imageUrl
        ? <img src={e.imageUrl} alt={e.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
        : <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛡️</div>,
    },
    { key: 'name',     header: 'Name',     render: (e) => <strong>{e.name}</strong> },
    { key: 'size',     header: 'Size',     render: (e) => e.size,            width: '60px' },
    { key: 'color',    header: 'Color',    render: (e) => e.color },
    { key: 'brand',    header: 'Brand',    render: (e) => e.brand.name },
    { key: 'category', header: 'Category', render: (e) => e.category.name },
    { key: 'price',    header: 'Price',    render: (e) => formatCurrency(e.price), width: '120px' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Equipment</h2>
          <p className={styles.subtitle}>{data?.page.totalElements ?? 0} equipment items</p>
        </div>
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search equipment…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
          <button
            className={styles.addBtn}
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
            type="button"
          >
            + New equipment
          </button>
        </div>
      </div>

      <CatalogTable
        columns={columns}
        data={data?.content ?? []}
        loading={isLoading}
        onEdit={(e) => { setEditTarget(e); setModalOpen(true); }}
        onDelete={(e) => setDeleteTarget(e)}
        emptyMessage="No equipment found."
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
        productType="EQUIPMENT"
        initial={editTarget}
        loading={create.isPending || update.isPending}
        onSubmitEquipement={handleSubmit}
        onDeleteImage={editTarget ? () => removeImage.mutate(editTarget.id) : undefined}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete equipment"
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