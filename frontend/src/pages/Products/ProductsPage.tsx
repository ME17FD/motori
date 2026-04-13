import { useState } from 'react';
import { useProducts, useProductMutations } from '../../hooks/useProducts';
import { uploadProductImages } from '../../services/productService';
import CatalogTable from '../../components/Tables/CatalogTable';
import type { CatalogColumn } from '../../components/Tables/CatalogTable';
import ProductModal from '../../components/Modals/ProductModal';
import ConfirmDialog from '../../components/Modals/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import type { Product, CreateProductRequest } from '../../types/product';
import type { ProductFilters } from '../../services/productService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import styles from '../../styles/pages/Products/ProductsPage.module.css';

const PAGE_SIZE = 12;

interface ProductsPageProps {
  /** Filters the list to PART or EQUIPMENT — passed from the router. */
  productType?: 'PART' | 'EQUIPMENT';
}

/**
 * Shared page component for both Parts and Equipment.
 * The productType prop pre-filters the list and the creation form.
 */
export default function ProductsPage({ productType }: ProductsPageProps) {
  const [page, setPage]               = useState(0);
  const [search, setSearch]           = useState('');
  const [modalOpen, setModalOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filters: ProductFilters = {
    page,
    size: PAGE_SIZE,
    productType,
    search: search || undefined,
  };

  const { data, isLoading }           = useProducts(filters);
  const { create, update, remove }    = useProductMutations();

  const handleSubmit = async (formData: CreateProductRequest, newImages: File[]) => {
    if (editTarget) {
      update.mutate(
        { id: editTarget.id, payload: { ...formData, productType: productType ?? formData.productType } },
        {
          onSuccess: async (updated) => {
            if (newImages.length > 0) {
              await uploadProductImages(updated.id, newImages);
            }
            setModalOpen(false);
          },
        },
      );
    } else {
      create.mutate(
        { ...formData, productType: productType ?? formData.productType },
        {
          onSuccess: async (created) => {
            if (newImages.length > 0) {
              await uploadProductImages(created.id, newImages);
            }
            setModalOpen(false);
          },
        },
      );
    }
  };

  const columns: CatalogColumn<Product>[] = [
    {
      key: 'image',
      header: '',
      width: '56px',
      render: (p) =>
        p.imageUrls?.[0] ? (
          <img
            src={p.imageUrls[0]}
            alt={p.name}
            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
          />
        ) : (
          <div style={{
            width: 40, height: 40, borderRadius: 6,
            background: '#f4f5f7', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            🔧
          </div>
        ),
    },
    { key: 'name',         header: 'Name',     render: (p) => <strong>{p.name}</strong> },
    { key: 'brandName',    header: 'Brand',    render: (p) => p.brandName ?? '—' },
    { key: 'categoryName', header: 'Category', render: (p) => p.categoryName ?? '—' },
    { key: 'price',        header: 'Price',    render: (p) => formatCurrency(p.price), width: '120px' },
    { key: 'createdAt',    header: 'Created',  render: (p) => p.createdAt ? formatDate(p.createdAt) : '—' },
  ];

  const title = productType === 'EQUIPMENT' ? 'Equipment' : 'Parts';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{data?.totalElements ?? 0} {title.toLowerCase()}</p>
        </div>
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            type="search"
            placeholder={`Search ${title.toLowerCase()}…`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
          <button
            className={styles.addBtn}
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
            type="button"
          >
            + New {title.slice(0, -1).toLowerCase()}
          </button>
        </div>
      </div>

      <CatalogTable
        columns={columns}
        data={data?.content ?? []}
        loading={isLoading}
        onEdit={(p) => { setEditTarget(p); setModalOpen(true); }}
        onDelete={(p) => setDeleteTarget(p)}
        emptyMessage={`No ${title.toLowerCase()} found.`}
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

      <ProductModal
        open={modalOpen}
        initial={editTarget}
        loading={create.isPending || update.isPending}
        onSubmit={handleSubmit}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${title.slice(0, -1).toLowerCase()}`}
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