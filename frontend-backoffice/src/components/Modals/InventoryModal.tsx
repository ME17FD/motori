/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useAddStock } from '../../hooks/useInventory';
import { useParts } from '../../hooks/useParts';
import { useEquipements } from '../../hooks/useEquipements';
import styles from '../../styles/Components/modals/FormModal.module.css';

interface SelectableProduct {
  id: string; // UUID string
  name: string;
  type: 'PART' | 'EQUIPEMENT';
}

const schema = z.object({
  productId: z.string().min(1, 'Please select a product'), // now string
  quantity:  z.number().min(1, 'Quantity must be at least 1').max(1000),
  expiresAt: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function InventoryModal({ onClose }: { onClose: () => void }) {
  const addStock = useAddStock();

  const { data: partsData, isLoading: partsLoading } = useParts({ page: 0, size: 100 });
  const { data: equipData, isLoading: equipLoading } = useEquipements({ page: 0, size: 100 });

  const [products, setProducts] = useState<SelectableProduct[]>([]);
  const [selectedProductType, setSelectedProductType] = useState<'PART' | 'EQUIPEMENT'>('PART');

  useEffect(() => {
    const partList: SelectableProduct[] = (partsData?.content || []).map(p => ({
      id: p.id, // now p.id is string after updating types
      name: `${p.name} (Ref: ${p.ref})`,
      type: 'PART',
    }));
    const equipList: SelectableProduct[] = (equipData?.content || []).map(e => ({
      id: e.id,
      name: `${e.name} ${e.size ? `(${e.size})` : ''} ${e.color ? `- ${e.color}` : ''}`,
      type: 'EQUIPEMENT',
    }));
    setProducts([...partList, ...equipList]);
  }, [partsData, equipData]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: '',
      quantity: 1,
      expiresAt: '',
    },
  });

  const selectedProductId = watch('productId');

  useEffect(() => {
    const product = products.find(p => p.id === selectedProductId);
    if (product) {
      setSelectedProductType(product.type);
    }
  }, [selectedProductId, products]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const onSubmit = async (data: FormData) => {
  const product = products.find(p => p.id === data.productId);
  if (!product) return;

  // Build payload with the correct ID field
  const payload: any = {
    quantity: data.quantity,
    expiresAt: data.expiresAt || undefined,
  };
  if (product.type === 'PART') {
    payload.partId = data.productId;
  } else {
    payload.equipementId = data.productId;
  }

  await addStock.mutateAsync(payload);
  onClose();
};

  const isLoading = partsLoading || equipLoading;

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
            <label className={styles.label}>Product *</label>
            <select
              className={`${styles.select} ${errors.productId ? styles.inputError : ''}`}
              {...register('productId')}
              disabled={isLoading}
            >
              <option value="">-- Select a product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.type === 'PART' ? 'Part' : 'Equip.'}] {p.name}
                </option>
              ))}
            </select>
            {isLoading && <span className={styles.fieldInfo}>Loading products…</span>}
            {errors.productId && (
              <span className={styles.fieldError}>{errors.productId.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Product Type</label>
            <input
              type="text"
              className={styles.input}
              value={selectedProductType === 'PART' ? 'Part' : 'Equipment'}
              disabled
            />
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
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Adding…' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}