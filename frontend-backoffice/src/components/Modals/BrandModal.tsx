import { useForm } from 'react-hook-form';
import type { PartBrand, PartBrandRequest } from '../../types/brand';
import styles from './FormModal.module.css';

interface BrandModalProps {
  open: boolean;
  initial?: PartBrand | null;
  loading?: boolean;
  onSubmit: (data: PartBrandRequest) => void;
  onClose: () => void;
}

export default function BrandModal(props: BrandModalProps) {
  if (!props.open) return null;
  return <BrandModalInner {...props} />;
}

function BrandModalInner({
  initial,
  loading = false,
  onSubmit,
  onClose,
}: Omit<BrandModalProps, 'open'>) {
  const { register, handleSubmit, formState: { errors } } =
    useForm<PartBrandRequest>({
      defaultValues: initial ? { name: initial.name } : { name: '' },
    });

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