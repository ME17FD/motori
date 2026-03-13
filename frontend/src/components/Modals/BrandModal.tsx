import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Brand, CreateBrandRequest } from '../../types/brand';
import styles from '../../styles/Components/modals/FormModal.module.css';

interface BrandModalProps {
  open: boolean;
  initial?: Brand | null;
  loading?: boolean;
  onSubmit: (data: CreateBrandRequest) => void;
  onClose: () => void;
}

/**
 * Create / edit modal for brands.
 * When `initial` is provided the form pre-fills for editing.
 */
export default function BrandModal({
  open,
  initial,
  loading = false,
  onSubmit,
  onClose,
}: BrandModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBrandRequest>();

  /* Pre-fill when editing */
  useEffect(() => {
    if (open) reset(initial ?? { name: '', slug: '' });
  }, [open, initial, reset]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>{initial ? 'Edit brand' : 'New brand'}</h3>
          <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Name *</label>
            <input
              className={[styles.input, errors.name ? styles.inputError : ''].join(' ')}
              placeholder="e.g. Honda"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <span className={styles.errorMsg}>{errors.name.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Slug</label>
            <input
              className={styles.input}
              placeholder="e.g. honda"
              {...register('slug')}
            />
          </div>

          <div className={styles.footer}>
            <button className={styles.cancelBtn} onClick={onClose} type="button">Cancel</button>
            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}