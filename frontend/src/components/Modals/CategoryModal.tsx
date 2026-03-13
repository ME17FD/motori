import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Category, CreateCategoryRequest } from '../../types/category';
import { useAllCategories } from '../../hooks/useCategories';
import styles from '../../styles/Components/modals/FormModal.module.css';

interface CategoryModalProps {
  open: boolean;
  initial?: Category | null;
  loading?: boolean;
  onSubmit: (data: CreateCategoryRequest) => void;
  onClose: () => void;
}

/**
 * Create / edit modal for categories.
 * Includes an optional parent category select (for subcategories).
 */
export default function CategoryModal({
  open,
  initial,
  loading = false,
  onSubmit,
  onClose,
}: CategoryModalProps) {
  const { data: allCategories = [] } = useAllCategories();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryRequest>();

  useEffect(() => {
    if (open) reset(initial ?? { name: '', slug: '', parentId: undefined });
  }, [open, initial, reset]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>{initial ? 'Edit category' : 'New category'}</h3>
          <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Name *</label>
            <input
              className={[styles.input, errors.name ? styles.inputError : ''].join(' ')}
              placeholder="e.g. Brakes"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <span className={styles.errorMsg}>{errors.name.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Slug</label>
            <input
              className={styles.input}
              placeholder="e.g. brakes"
              {...register('slug')}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Parent category</label>
            <select className={styles.input} {...register('parentId', { valueAsNumber: true })}>
              <option value="">— None (root category) —</option>
              {allCategories
                .filter((c) => c.id !== initial?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
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