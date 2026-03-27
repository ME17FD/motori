/**
 * VehicleModal — create / edit vehicle with brand selector.
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCreateVehicle, useUpdateVehicle } from '../../hooks/useVehicles';
import { useBrands } from '../../hooks/useBrands';
import type { VehicleDto } from '../../types/vehicle';
import styles from '../../styles/Components/modals/FormModal.module.css';

// ─── Validation ────────────────────────────────────────────────────────────

const vehicleSchema = z.object({
  name:    z.string().min(1, 'Name is required').max(100),
  model:   z.string().min(1, 'Model is required').max(100),
  brandId: z.string().min(1, 'Brand is required'),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

// ─── Component ─────────────────────────────────────────────────────────────

interface Props {
  editVehicle?: VehicleDto | null;
  onClose: () => void;
}

export function VehicleModal({ editVehicle, onClose }: Props) {
  const isEdit = !!editVehicle;

  const { data: vehicleBrands = [] } = useBrands('VehiculeBrand');
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      name:    editVehicle?.name    ?? '',
      model:   editVehicle?.model   ?? '',
      brandId: editVehicle?.brandId?.toString() ?? '',
    },
  });

  useEffect(() => {
    reset({
      name:    editVehicle?.name    ?? '',
      model:   editVehicle?.model   ?? '',
      brandId: editVehicle?.brandId?.toString() ?? '',
    });
  }, [editVehicle, reset]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const onSubmit = async (data: VehicleFormData) => {
    const payload = {
      name:    data.name,
      model:   data.model,
      brandId: parseInt(data.brandId, 10),
    };

    if (isEdit && editVehicle) {
      await updateVehicle.mutateAsync({ id: editVehicle.id, payload });
    } else {
      await createVehicle.mutateAsync(payload);
    }
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
          <h2 className={styles.title}>
            {isEdit ? 'Edit Vehicle' : 'New Vehicle'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          {/* Name */}
          <div className={styles.field}>
            <label className={styles.label}>Vehicle name *</label>
            <input
              type="text"
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              placeholder="e.g. CBR 600"
              autoFocus
              {...register('name')}
            />
            {errors.name && (
              <span className={styles.fieldError}>{errors.name.message}</span>
            )}
          </div>

          {/* Model */}
          <div className={styles.field}>
            <label className={styles.label}>Model *</label>
            <input
              type="text"
              className={`${styles.input} ${errors.model ? styles.inputError : ''}`}
              placeholder="e.g. CBR600RR"
              {...register('model')}
            />
            {errors.model && (
              <span className={styles.fieldError}>{errors.model.message}</span>
            )}
          </div>

          {/* Brand */}
          <div className={styles.field}>
            <label className={styles.label}>Brand *</label>
            <select
              className={`${styles.select} ${errors.brandId ? styles.inputError : ''}`}
              {...register('brandId')}
            >
              <option value="">Select a brand…</option>
              {vehicleBrands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {errors.brandId && (
              <span className={styles.fieldError}>{errors.brandId.message}</span>
            )}
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
                : isEdit ? 'Save Changes' : 'Create Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}