import { useForm } from 'react-hook-form';
import type { PartCategory, PartCategoryRequest } from '../../types/category';
import { usePartCategories } from '../../hooks/usePartCategories';
import styles from './FormModal.module.css';

interface CategoryModalProps {
  open: boolean;
  initial?: PartCategory | null;
  loading?: boolean;
  onSubmit: (data: PartCategoryRequest) => void;
  onClose: () => void;
}

export default function CategoryModal(props: CategoryModalProps) {
  if (!props.open) return null;
  return <CategoryModalInner {...props} />;
}

function CategoryModalInner({
  initial,
  loading = false,
  onSubmit,
  onClose,
}: Omit<CategoryModalProps, 'open'>) {
  const { data: allCategories } = usePartCategories({ page: 0, size: 100 });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartCategoryRequest>({
    defaultValues: initial
      ? { name: initial.name, parentCategoryId: initial.parentCategoryId }
      : { name: '' },
  });

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
            <label className={styles.label}>Parent category</label>
            <select className={styles.input} {...register('parentCategoryId')}>
              <option value="">— None (root category) —</option>
              {allCategories?.content
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