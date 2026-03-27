/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * InventoryModal — add stock units for a product.
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useAddStock } from '../../hooks/useInventory';
import styles from '../../styles/Components/modals/FormModal.module.css';

const schema = z.object({
  productId: z.number().min(1, 'Product ID is required'),
  type:      z.enum(['PART', 'EQUIPEMENT']),
  quantity:  z.number().min(1, 'Quantity must be at least 1').max(1000),
  expiresAt: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function InventoryModal({ onClose }: { onClose: () => void }) {
  const addStock = useAddStock();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { 
      type: 'PART', 
      quantity: 1,
      productId: undefined as any, // Temporary workaround
    },
  });

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const onSubmit = async (data: FormData) => {
    await addStock.mutateAsync({
      productId: data.productId,
      type:      data.type,
      quantity:  data.quantity,
      expiresAt: data.expiresAt || undefined,
    });
    onClose();
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add Stock</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Product ID *</label>
            <input
              type="number"
              className={`${styles.input} ${errors.productId ? styles.inputError : ''}`}
              placeholder="e.g. 42"
              {...register('productId', { valueAsNumber: true })}
            />
            {errors.productId && (
              <span className={styles.fieldError}>{errors.productId.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Type *</label>
            <select className={styles.select} {...register('type')}>
              <option value="PART">Part</option>
              <option value="EQUIPEMENT">Equipment</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Quantity *</label>
            <input
              type="number"
              className={`${styles.input} ${errors.quantity ? styles.inputError : ''}`}
              placeholder="1"
              {...register('quantity', { valueAsNumber: true })}
            />
            {errors.quantity && (
              <span className={styles.fieldError}>{errors.quantity.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Expiry date (optional)</label>
            <input
              type="date"
              className={styles.input}
              {...register('expiresAt')}
            />
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
              {isSubmitting ? 'Adding…' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}