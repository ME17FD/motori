import { useState } from 'react';
import { usePromotions, usePromotionMutations } from '../../hooks/usePromotions';
import CatalogTable from '../../components/Tables/CatalogTable';
import type { CatalogColumn } from '../../components/Tables/CatalogTable';
import PromotionModal from '../../components/Modals/PromotionModal';
import ConfirmDialog from '../../components/Modals/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import type { Promotion, CreatePromotionRequest, PromotionFilters } from '../../types/promotion';
import { formatCurrency, formatDate } from '../../utils/formatters';
import styles from '../../styles/pages/Promotions/PromotionsPage.module.css';

const PAGE_SIZE = 15;

/**
 * Promotions management page — create, edit, toggle, delete promo codes.
 */
export default function PromotionsPage() {
  const [page, setPage]           = useState(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<Promotion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);

  const filters: PromotionFilters = {
    page,
    size: PAGE_SIZE,
    active: activeFilter === 'all' ? undefined : activeFilter === 'active',
  };

  const { data, isLoading }                     = usePromotions(filters);
  const { create, update, remove, toggle }      = usePromotionMutations();

  const handleSubmit = (formData: CreatePromotionRequest) => {
    if (editTarget) {
      update.mutate(
        { id: editTarget.id, payload: formData },
        { onSuccess: () => setModalOpen(false) },
      );
    } else {
      create.mutate(formData, { onSuccess: () => setModalOpen(false) });
    }
  };

  const columns: CatalogColumn<Promotion>[] = [
    {
      key: 'code',
      header: 'Code',
      render: (p) => (
        <code style={{ fontWeight: 700, letterSpacing: 1, fontSize: 13 }}>
          {p.code}
        </code>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (p) => (
        <span style={{ fontSize: 12, color: '#5c5c5c' }}>
          {p.description ?? '—'}
        </span>
      ),
    },
    {
      key: 'discount',
      header: 'Discount',
      render: (p) => (
        <strong>
          {p.discountType === 'PERCENTAGE'
            ? `${p.discountValue}%`
            : formatCurrency(p.discountValue)}
        </strong>
      ),
      width: '100px',
    },
    {
      key: 'uses',
      header: 'Uses',
      width: '100px',
      render: (p) => (
        <span style={{ fontSize: 12 }}>
          {p.usedCount} / {p.maxUses ?? '∞'}
        </span>
      ),
    },
    {
      key: 'validity',
      header: 'Validity',
      render: (p) => (
        <span style={{ fontSize: 12, color: '#5c5c5c' }}>
          {p.startDate ? formatDate(p.startDate) : '—'}
          {' → '}
          {p.endDate ? formatDate(p.endDate) : '∞'}
        </span>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      width: '100px',
      render: (p) => (
        <button
          type="button"
          onClick={() => toggle.mutate(p.id)}
          disabled={toggle.isPending}
          style={{
            padding: '3px 10px',
            borderRadius: 20,
            border: 'none',
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 500,
            background: p.active
              ? 'rgba(16,185,129,0.12)'
              : 'rgba(107,114,128,0.1)',
            color: p.active ? '#065f46' : '#374151',
            transition: 'all 0.2s',
          }}
        >
          {p.active ? 'Active' : 'Inactive'}
        </button>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Promotions</h2>
          <p className={styles.subtitle}>
            {data?.totalElements ?? 0} promo codes
          </p>
        </div>
        <div className={styles.toolbar}>
          <div className={styles.filterTabs}>
            {(['all', 'active', 'inactive'] as const).map((f) => (
              <button
                key={f}
                className={[
                  styles.filterTab,
                  activeFilter === f ? styles.filterTabActive : '',
                ].join(' ')}
                type="button"
                onClick={() => { setActiveFilter(f); setPage(0); }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button
            className={styles.addBtn}
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
            type="button"
          >
            + New promo
          </button>
        </div>
      </div>

      <CatalogTable
        columns={columns}
        data={data?.content ?? []}
        loading={isLoading}
        onEdit={(p) => { setEditTarget(p); setModalOpen(true); }}
        onDelete={(p) => setDeleteTarget(p)}
        emptyMessage="No promotions found."
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

      <PromotionModal
        open={modalOpen}
        initial={editTarget}
        loading={create.isPending || update.isPending}
        onSubmit={handleSubmit}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete promotion"
        message={`Delete promo code "${deleteTarget?.code}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            remove.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}