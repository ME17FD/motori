import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Vehicle, CreateVehicleRequest } from '../../types/vehicle';
import styles from '../../styles/Components/modals/FormModal.module.css';

interface VehicleModalProps {
  open: boolean;
  initial?: Vehicle | null;
  loading?: boolean;
  onSubmit: (data: CreateVehicleRequest) => void;
  onClose: () => void;
}

export default function VehicleModal({
  open,
  initial,
  loading = false,
  onSubmit,
  onClose,
}: VehicleModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateVehicleRequest>();

  useEffect(() => {
    if (open) {
      reset(
        initial
          ? { make: initial.make, model: initial.model, year: initial.year, engine: initial.engine, type: initial.type }
          : { make: '', model: '', year: new Date().getFullYear(), engine: '', type: '' },
      );
    }
  }, [open, initial, reset]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>{initial ? 'Edit vehicle' : 'New vehicle'}</h3>
          <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Make *</label>
              <input
                className={[styles.input, errors.make ? styles.inputError : ''].join(' ')}
                placeholder="e.g. Honda"
                {...register('make', { required: 'Make is required' })}
              />
              {errors.make && <span className={styles.errorMsg}>{errors.make.message}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Model *</label>
              <input
                className={[styles.input, errors.model ? styles.inputError : ''].join(' ')}
                placeholder="e.g. CBR 600"
                {...register('model', { required: 'Model is required' })}
              />
              {errors.model && <span className={styles.errorMsg}>{errors.model.message}</span>}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Year *</label>
              <input
                type="number"
                className={[styles.input, errors.year ? styles.inputError : ''].join(' ')}
                {...register('year', {
                  required: 'Year is required',
                  valueAsNumber: true,
                  min: { value: 1900, message: 'Invalid year' },
                  max: { value: new Date().getFullYear() + 1, message: 'Invalid year' },
                })}
              />
              {errors.year && <span className={styles.errorMsg}>{errors.year.message}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Engine</label>
              <input
                className={styles.input}
                placeholder="e.g. 600cc"
                {...register('engine')}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Type</label>
            <input
              className={styles.input}
              placeholder="e.g. Sport, Trail, Naked…"
              {...register('type')}
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