import { useForm } from 'react-hook-form';
import type { Promotion, CreatePromotionRequest, DiscountType } from '../../types/promotion';
import styles from '../../styles/Components/modals/FormModal.module.css';

interface PromotionModalProps {
  open: boolean;
  initial?: Promotion | null;
  loading?: boolean;
  onSubmit: (data: CreatePromotionRequest) => void;
  onClose: () => void;
}

/**
 * Create / edit modal for promotions.
 * Remounts via conditional render pattern to avoid cascading setState.
 */
export default function PromotionModal(props: PromotionModalProps) {
  if (!props.open) return null;
  return <PromotionModalInner {...props} />;
}

function PromotionModalInner({
  initial,
  loading = false,
  onSubmit,
  onClose,
}: Omit<PromotionModalProps, 'open'>) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreatePromotionRequest>({
    defaultValues: initial
      ? {
          code:           initial.code,
          description:    initial.description,
          discountType:   initial.discountType,
          discountValue:  initial.discountValue,
          minOrderAmount: initial.minOrderAmount,
          maxUses:        initial.maxUses,
          active:         initial.active,
          startDate:      initial.startDate,
          endDate:        initial.endDate,
        }
      : {
          discountType: 'PERCENTAGE',
          active: true,
        },
  });

  const discountType = watch('discountType') as DiscountType;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            {initial ? 'Edit promotion' : 'New promotion'}
          </h3>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          {/* Code */}
          <div className={styles.field}>
            <label className={styles.label}>Promo code *</label>
            <input
              className={[styles.input, errors.code ? styles.inputError : ''].join(' ')}
              placeholder="e.g. SUMMER20"
              style={{ textTransform: 'uppercase' }}
              {...register('code', { required: 'Code is required' })}
            />
            {errors.code && (
              <span className={styles.errorMsg}>{errors.code.message}</span>
            )}
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <input
              className={styles.input}
              placeholder="e.g. Summer sale 20% off"
              {...register('description')}
            />
          </div>

          {/* Discount type + value */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Discount type *</label>
              <select className={styles.input} {...register('discountType')}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed amount (MAD)</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                {discountType === 'PERCENTAGE' ? 'Percentage *' : 'Amount (MAD) *'}
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                max={discountType === 'PERCENTAGE' ? 100 : undefined}
                className={[styles.input, errors.discountValue ? styles.inputError : ''].join(' ')}
                {...register('discountValue', {
                  required: 'Value is required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Must be positive' },
                  max: discountType === 'PERCENTAGE'
                    ? { value: 100, message: 'Max 100%' }
                    : undefined,
                })}
              />
              {errors.discountValue && (
                <span className={styles.errorMsg}>{errors.discountValue.message}</span>
              )}
            </div>
          </div>

          {/* Min order + max uses */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Min order amount (MAD)</label>
              <input
                type="number"
                step="0.01"
                min={0}
                className={styles.input}
                placeholder="e.g. 200"
                {...register('minOrderAmount', { valueAsNumber: true })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Max uses (blank = unlimited)</label>
              <input
                type="number"
                min={1}
                className={styles.input}
                placeholder="e.g. 100"
                {...register('maxUses', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Start + end dates */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Start date</label>
              <input
                type="date"
                className={styles.input}
                {...register('startDate')}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>End date</label>
              <input
                type="date"
                className={styles.input}
                {...register('endDate')}
              />
            </div>
          </div>

          {/* Active toggle */}
          <div className={styles.field}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ width: 16, height: 16, accentColor: 'var(--color-red)' }}
                {...register('active')}
              />
              <span className={styles.label} style={{ margin: 0 }}>
                Active (available for use)
              </span>
            </label>
          </div>

          <div className={styles.footer}>
            <button className={styles.cancelBtn} onClick={onClose} type="button">
              Cancel
            </button>
            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}