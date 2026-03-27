/**
 * CategoryModal — create / edit category with optional parent selection.
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCreateCategory, useUpdateCategory, useCategories } from '../../hooks/useCategories';
import type { CategoryDto, CategoryType } from '../../types/category';
import styles from '../../styles/Components/modals/FormModal.module.css';

// ─── Validation ────────────────────────────────────────────────────────────

const categorySchema = z.object({
  name:     z.string().min(1, 'Name is required').max(100),
  parentId: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// ─── Component ─────────────────────────────────────────────────────────────

interface Props {
  categoryType: CategoryType;
  editCategory?: CategoryDto | null;
  onClose: () => void;
}

export function CategoryModal({ categoryType, editCategory, onClose }: Props) {
  const isEdit = !!editCategory;

  const { data: allCategories = [] } = useCategories(categoryType);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name:     editCategory?.name ?? '',
      parentId: editCategory?.parentId?.toString() ?? '',
    },
  });

  useEffect(() => {
    reset({
      name:     editCategory?.name ?? '',
      parentId: editCategory?.parentId?.toString() ?? '',
    });
  }, [editCategory, reset]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const onSubmit = async (data: CategoryFormData) => {
    const parentId = data.parentId ? parseInt(data.parentId, 10) : null;

    if (isEdit && editCategory) {
      await updateCategory.mutateAsync({
        id: editCategory.id,
        payload: { name: data.name, parentId },
      });
    } else {
      await createCategory.mutateAsync({
        name: data.name,
        type: categoryType,
        parentId,
      });
    }
    onClose();
  };

  // Exclude self from parent options when editing
  const parentOptions = allCategories.filter(
    (c) => !editCategory || c.id !== editCategory.id
  );

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEdit ? 'Edit' : 'New'}{' '}
            {categoryType === 'PartCategory' ? 'Part' : 'Equipment'} Category
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          {/* Name */}
          <div className={styles.field}>
            <label className={styles.label}>Category name *</label>
            <input
              type="text"
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              placeholder="e.g. Engine Parts"
              autoFocus
              {...register('name')}
            />
            {errors.name && (
              <span className={styles.fieldError}>{errors.name.message}</span>
            )}
          </div>

          {/* Parent category */}
          <div className={styles.field}>
            <label className={styles.label}>Parent category (optional)</label>
            <select className={styles.select} {...register('parentId')}>
              <option value="">— Root category —</option>
              {parentOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

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
                : isEdit ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}