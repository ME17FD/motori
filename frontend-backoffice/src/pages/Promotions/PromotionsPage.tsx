/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * PromotionsPage — full CRUD for promotions with code generation.
 */

import { useState } from 'react';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import {
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
} from '../../hooks/usePromotions';
import { ConfirmDialog } from '../../components/Modals/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';
import { generatePromoCode } from '../../services/promotionService';
import { formatDate } from '../../utils/formatters';
import type { PromotionDto } from '../../types/promotion';
import fStyles from '../../styles/Components/modals/FormModal.module.css';
import styles from '../../styles/pages/Promotions/PromotionsPage.module.css';

// ─── Validation ────────────────────────────────────────────────────────────

const promoSchema = z.object({
  name:        z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type:        z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value:       z.number().min(0, 'Value must be positive'),
  code:        z.string().optional(),
  startDate:   z.string().min(1, 'Start date is required'),
  endDate:     z.string().min(1, 'End date is required'),
}).refine((d) => d.endDate >= d.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type PromoFormData = z.infer<typeof promoSchema>;

// ─── Promotion form modal ──────────────────────────────────────────────────

interface PromoModalProps {
  editItem?: PromotionDto | null;
  onClose: () => void;
}

function PromoModal({ editItem, onClose }: PromoModalProps) {
  const isEdit = !!editItem;
  const create = useCreatePromotion();
  const update = useUpdatePromotion();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PromoFormData>({
    resolver: zodResolver(promoSchema),
    defaultValues: {
      name:        editItem?.name        ?? '',
      description: editItem?.description ?? '',
      type:        editItem?.type        ?? 'PERCENTAGE',
      value:       editItem?.value       ?? 0,
      code:        editItem?.code        ?? '',
      startDate:   editItem?.startDate?.slice(0, 10) ?? '',
      endDate:     editItem?.endDate?.slice(0, 10)   ?? '',
    },
  });

  const promoType = watch('type');

  const onSubmit: SubmitHandler<PromoFormData> = async (data) => {
    if (isEdit && editItem) {
      await update.mutateAsync({ id: editItem.id, payload: data });
    } else {
      await create.mutateAsync(data);
    }
    onClose();
  };

  return (
    <div
      className={fStyles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className={fStyles.modal}>
        <div className={fStyles.header}>
          <h2 className={fStyles.title}>
            {isEdit ? 'Edit Promotion' : 'New Promotion'}
          </h2>
          <button className={fStyles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={fStyles.form} noValidate>
          <div className={fStyles.field}>
            <label className={fStyles.label}>Name *</label>
            <input
              type="text"
              className={`${fStyles.input} ${errors.name ? fStyles.inputError : ''}`}
              placeholder="e.g. Summer Sale 20%"
              {...register('name')}
            />
            {errors.name && (
              <span className={fStyles.fieldError}>{errors.name.message}</span>
            )}
          </div>

          <div className={fStyles.field}>
            <label className={fStyles.label}>Description</label>
            <textarea
              className={fStyles.textarea}
              rows={2}
              placeholder="Optional description…"
              {...register('description')}
            />
          </div>

          <div className={styles.row2}>
            <div className={fStyles.field}>
              <label className={fStyles.label}>Type *</label>
              <select className={fStyles.select} {...register('type')}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (MAD)</option>
              </select>
            </div>
            <div className={fStyles.field}>
              <label className={fStyles.label}>
                Value * {promoType === 'PERCENTAGE' ? '(%)' : '(MAD)'}
              </label>
              <input
                type="number"
                step="0.01"
                className={`${fStyles.input} ${errors.value ? fStyles.inputError : ''}`}
                placeholder={promoType === 'PERCENTAGE' ? '20' : '50'}
                {...register('value', { valueAsNumber: true })}
              />
              {errors.value && (
                <span className={fStyles.fieldError}>{errors.value.message}</span>
              )}
            </div>
          </div>

          {/* Promo code */}
          <div className={fStyles.field}>
            <label className={fStyles.label}>Promo code</label>
            <div className={styles.codeRow}>
              <input
                type="text"
                className={fStyles.input}
                placeholder="AUTO-GENERATED"
                style={{ textTransform: 'uppercase' }}
                {...register('code')}
              />
              <button
                type="button"
                className={styles.generateBtn}
                onClick={() => setValue('code', generatePromoCode())}
                title="Generate random code"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Dates */}
          <div className={styles.row2}>
            <div className={fStyles.field}>
              <label className={fStyles.label}>Start date *</label>
              <input
                type="date"
                className={`${fStyles.input} ${errors.startDate ? fStyles.inputError : ''}`}
                {...register('startDate')}
              />
              {errors.startDate && (
                <span className={fStyles.fieldError}>{errors.startDate.message}</span>
              )}
            </div>
            <div className={fStyles.field}>
              <label className={fStyles.label}>End date *</label>
              <input
                type="date"
                className={`${fStyles.input} ${errors.endDate ? fStyles.inputError : ''}`}
                {...register('endDate')}
              />
              {errors.endDate && (
                <span className={fStyles.fieldError}>{errors.endDate.message}</span>
              )}
            </div>
          </div>

          <div className={fStyles.actions}>
            <button type="button" className={fStyles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={fStyles.submitBtn} disabled={isSubmitting}>
              {isSubmitting
                ? isEdit ? 'Saving…' : 'Creating…'
                : isEdit ? 'Save Changes' : 'Create Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export function PromotionsPage() {
  const [page, setPage]             = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<PromotionDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromotionDto | null>(null);

  const { data, isLoading, isError } = usePromotions(page);
  const deletePromotion = useDeletePromotion();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Promotions</h2>
          {data && (
            <p className={styles.subtitle}>
              {data.totalElements} promotion{data.totalElements !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button className={styles.addBtn} onClick={() => setShowCreate(true)}>
          <Plus size={15} />
          New Promotion
        </button>
      </div>

      <div className={styles.tableCard}>
        {isError ? (
          <div className={styles.errorState}>Failed to load promotions.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Type</th>
                  <th className={styles.th}>Value</th>
                  <th className={styles.th}>Code</th>
                  <th className={styles.th}>Period</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className={styles.td}>
                          <div className={styles.skeletonCell} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data?.content.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>
                      No promotions yet.
                    </td>
                  </tr>
                ) : (
                  data?.content.map((promo) => {
                    const now = new Date();
                    const start = new Date(promo.startDate);
                    const end   = new Date(promo.endDate);
                    const isActive = promo.active && now >= start && now <= end;
                    const isExpired = now > end;

                    return (
                      <tr key={promo.id} className={styles.row}>
                        <td className={styles.td}>
                          <span className={styles.promoName}>{promo.name}</span>
                          {promo.description && (
                            <span className={styles.promoDesc}>{promo.description}</span>
                          )}
                        </td>
                        <td className={styles.td}>
                          <span className={
                            promo.type === 'PERCENTAGE'
                              ? styles.typePercent
                              : styles.typeFixed
                          }>
                            {promo.type === 'PERCENTAGE' ? '%' : 'MAD'}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.value}>
                            {promo.type === 'PERCENTAGE'
                              ? `${promo.value}%`
                              : `${promo.value} MAD`}
                          </span>
                        </td>
                        <td className={styles.td}>
                          {promo.code ? (
                            <code className={styles.code}>{promo.code}</code>
                          ) : (
                            <span className={styles.na}>—</span>
                          )}
                        </td>
                        <td className={styles.td}>
                          <span className={styles.period}>
                            {formatDate(promo.startDate)} → {formatDate(promo.endDate)}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span className={
                            isExpired
                              ? styles.statusExpired
                              : isActive
                              ? styles.statusActive
                              : styles.statusInactive
                          }>
                            {isExpired ? 'Expired' : isActive ? 'Active' : 'Scheduled'}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.rowActions}>
                            <button
                              className={styles.iconBtn}
                              onClick={() => setEditTarget(promo)}
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                              onClick={() => setDeleteTarget(promo)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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

      {showCreate && <PromoModal onClose={() => setShowCreate(false)} />}
      {editTarget && (
        <PromoModal
          editItem={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Promotion"
          message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          isLoading={deletePromotion.isPending}
          onConfirm={async () => {
            await deletePromotion.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}