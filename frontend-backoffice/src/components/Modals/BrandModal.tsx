/**
 * BrandModal — create / edit brand form in a centered modal.
 *
 * Used by BrandsPage for all three brand types.
 * Validates with Zod, submits via useCreateBrand / useUpdateBrand.
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCreateBrand, useUpdateBrand } from '../../hooks/useBrands';
import type { BrandDto, BrandType } from '../../types/brand';
import styles from '../../styles/Components/modals/FormModal.module.css';

// ─── Validation schema ─────────────────────────────────────────────────────

const brandSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

type BrandFormData = z.infer<typeof brandSchema>;

// ─── Component ─────────────────────────────────────────────────────────────

interface Props {
  brandType: BrandType;
  /** When provided, the modal is in edit mode */
  editBrand?: BrandDto | null;
  onClose: () => void;
}

export function BrandModal({ brandType, editBrand, onClose }: Props) {
  const isEdit = !!editBrand;

  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: editBrand?.name ?? '' },
  });

  // Sync form when switching between create/edit
  useEffect(() => {
    reset({ name: editBrand?.name ?? '' });
  }, [editBrand, reset]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const onSubmit = async (data: BrandFormData) => {
  if (isEdit && editBrand) {
    await updateBrand.mutateAsync({ id: editBrand.id, type: brandType, payload: { name: data.name } });
  } else {
    await createBrand.mutateAsync({ name: data.name, type: brandType });
  }
  onClose();
};

  const typeLabel: Record<BrandType, string> = {
    VehiculeBrand:   'Vehicle Brand',
    PartBrand:       'Part Brand',
    EquipementBrand: 'Equipment Brand',
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEdit ? 'Edit' : 'New'} {typeLabel[brandType]}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Brand name *</label>
            <input
              type="text"
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              placeholder="e.g. Yamaha"
              autoFocus
              {...register('name')}
            />
            {errors.name && (
              <span className={styles.fieldError}>{errors.name.message}</span>
            )}
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEdit ? 'Saving…' : 'Creating…'
                : isEdit ? 'Save Changes' : 'Create Brand'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}