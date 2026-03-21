import { useForm } from 'react-hook-form';
import type { Vehicule, VehiculeRequest } from '../../types/vehicle';
import styles from './FormModal.module.css';

interface VehicleModalProps {
  open: boolean;
  initial?: Vehicule | null;
  loading?: boolean;
  onSubmit: (data: VehiculeRequest) => void;
  onClose: () => void;
}

export default function VehicleModal(props: VehicleModalProps) {
  if (!props.open) return null;
  return <VehicleModalInner {...props} />;
}

function VehicleModalInner({
  initial,
  loading = false,
  onSubmit,
  onClose,
}: Omit<VehicleModalProps, 'open'>) {
  const { register, handleSubmit, formState: { errors } } =
    useForm<VehiculeRequest>({
      defaultValues: initial
        ? {
            name:            initial.name,
            model:           initial.model,
            vehiculeBrandId: initial.brand.id,
          }
        : { name: '', model: '', vehiculeBrandId: '' },
    });

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>{initial ? 'Edit vehicle' : 'New vehicle'}</h3>
          <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Name *</label>
            <input
              className={[styles.input, errors.name ? styles.inputError : ''].join(' ')}
              placeholder="e.g. CBR 600"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <span className={styles.errorMsg}>{errors.name.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Model *</label>
            <input
              className={[styles.input, errors.model ? styles.inputError : ''].join(' ')}
              placeholder="e.g. Sport"
              {...register('model', { required: 'Model is required' })}
            />
            {errors.model && <span className={styles.errorMsg}>{errors.model.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Brand ID *</label>
            <input
              className={[styles.input, errors.vehiculeBrandId ? styles.inputError : ''].join(' ')}
              placeholder="Vehicle brand UUID"
              {...register('vehiculeBrandId', { required: 'Brand is required' })}
            />
            {errors.vehiculeBrandId && (
              <span className={styles.errorMsg}>{errors.vehiculeBrandId.message}</span>
            )}
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