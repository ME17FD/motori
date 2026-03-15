import { useForm } from 'react-hook-form';
import type { Inventory, UpdateInventoryRequest, InventoryStatus } from '../../types/inventory';
import styles from '../../styles/Components/modals/FormModal.module.css';

interface InventoryModalProps {
  open: boolean;
  item: Inventory | null;
  loading?: boolean;
  onSubmit: (payload: UpdateInventoryRequest) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: InventoryStatus[] = ['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED'];

/**
 * Edit modal for a single inventory entry.
 * Remounts via conditional render to avoid effect-based state syncing.
 */
export default function InventoryModal(props: InventoryModalProps) {
  if (!props.open || !props.item) return null;
  return <InventoryModalInner {...props} item={props.item} />;
}

function InventoryModalInner({
  item,
  loading = false,
  onSubmit,
  onClose,
}: Omit<InventoryModalProps, 'open'> & { item: Inventory }) {
  const { register, handleSubmit, watch, formState: { errors } } =
    useForm<UpdateInventoryRequest>({
      defaultValues: {
        quantity:          item.quantity,
        available:         item.available,
        status:            item.status,
        lowStockThreshold: item.lowStockThreshold ?? 5,
      },
    });

  const currentQty = watch('quantity') ?? 0;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>Edit inventory</h3>
          <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          {/* Product info (read-only) */}
          <div className={styles.field}>
            <label className={styles.label}>Product</label>
            <div style={{
              padding: '8px 12px',
              background: 'var(--color-bg-light)',
              borderRadius: 8,
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-black)',
            }}>
              {item.productName ?? `Product #${item.productId}`}
            </div>
          </div>

          {/* Quantity */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Quantity *</label>
              <input
                type="number"
                min={0}
                className={[styles.input, errors.quantity ? styles.inputError : ''].join(' ')}
                {...register('quantity', {
                  required: 'Quantity is required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Must be 0 or more' },
                })}
              />
              {errors.quantity && (
                <span className={styles.errorMsg}>{errors.quantity.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Low stock threshold</label>
              <input
                type="number"
                min={0}
                className={styles.input}
                {...register('lowStockThreshold', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Must be 0 or more' },
                })}
              />
              {currentQty <= (watch('lowStockThreshold') ?? 5) && currentQty > 0 && (
                <span style={{ fontSize: '11px', color: '#b45309' }}>
                  ⚠ Current quantity is at or below threshold
                </span>
              )}
            </div>
          </div>

          {/* Status */}
          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <select className={styles.input} {...register('status')}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Available toggle */}
          <div className={styles.field}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ width: 16, height: 16, accentColor: 'var(--color-red)' }}
                {...register('available')}
              />
              <span className={styles.label} style={{ margin: 0 }}>
                Available for purchase
              </span>
            </label>
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