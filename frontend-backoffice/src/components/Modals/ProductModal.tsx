/**
 * ProductModal — unified create/edit form for Parts and Equipements.
 *
 * Mode is determined by the `productType` prop:
 *   'part'       → shows reference, compatible vehicles
 *   'equipement' → shows size, color
 *
 * Common fields: name, description, price, brand, category,
 *                status, stock, image, dynamic properties
 */

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCreatePart, useUpdatePart } from '../../hooks/useParts';
import { useCreateEquipement, useUpdateEquipement } from '../../hooks/useEquipements';
import { useBrands } from '../../hooks/useBrands';
import { useCategories } from '../../hooks/useCategories';
import { useVehicles } from '../../hooks/useVehicles';
import { DynamicPropertiesEditor } from '../Forms/DynamicPropertiesEditor';
import { ImageUploader } from '../Forms/ImageUploader';
import type {
  PartDto,
  EquipementDto,
  ProductStatus,
  EquipementSize,
  DynamicProperties,
} from '../../types/product';
import styles from '../../styles/Components/modals/FormModal.module.css';
import modalStyles from '../../styles/Components/modals/ProductModal.module.css';

// ─── Validation schema ─────────────────────────────────────────────────────

const productSchema = z.object({
  name:        z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  price:       z.number().min(0, 'Price must be positive'),
  brandId:     z.string().min(1, 'Brand is required'),
  categoryId:  z.string().min(1, 'Category is required'),
  status:      z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED']),
  stock:       z.number().min(0).default(0),
  // Part-specific
  reference:   z.string().optional(),
  compatibleVehicleIds: z.array(z.number()).optional(),
  // Equipement-specific
  size:        z.string().optional(),
  color:       z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

// ─── Props ─────────────────────────────────────────────────────────────────

interface Props {
  productType: 'part' | 'equipement';
  editItem?: PartDto | EquipementDto | null;
  onClose: () => void;
}

const SIZES: EquipementSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const STATUSES: ProductStatus[] = ['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED'];

// ─── Component ─────────────────────────────────────────────────────────────

export function ProductModal({ productType, editItem, onClose }: Props) {
  const isEdit  = !!editItem;
  const isPart  = productType === 'part';

  // ── State ────────────────────────────────────────────────────────────
  const [properties, setProperties]  = useState<DynamicProperties>(
    editItem?.properties ?? {}
  );
  const [imageFile, setImageFile]    = useState<File | null>(null);
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>(
    isPart && editItem ? (editItem as PartDto)?.compatibleVehicleIds ?? [] : []
  );

  // ── Data ─────────────────────────────────────────────────────────────
  const brandType    = isPart ? 'PartBrand' : 'EquipementBrand';
  const categoryType = isPart ? 'PartCategory' : 'EquipementCategory';

  const { data: brands     = [] } = useBrands(brandType);
  const { data: categories = [] } = useCategories(categoryType);
  const { data: vehicles   = [] } = useVehicles();

  // ── Mutations ─────────────────────────────────────────────────────────
  const createPart       = useCreatePart();
  const updatePart       = useUpdatePart();
  const createEquipement = useCreateEquipement();
  const updateEquipement = useUpdateEquipement();

  // ── Form ──────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name:        editItem?.name        ?? '',
      description: editItem?.description ?? '',
      price:       editItem?.price       ?? 0,
      brandId:     editItem?.brandId?.toString()    ?? '',
      categoryId:  editItem?.categoryId?.toString() ?? '',
      status:      editItem?.status      ?? 'AVAILABLE',
      stock:       editItem?.stock       ?? 0,
      reference:   isPart && editItem ? (editItem as PartDto)?.reference ?? '' : '',
      size:        !isPart && editItem ? (editItem as EquipementDto)?.size ?? '' : '',
      color:       !isPart && editItem ? (editItem as EquipementDto)?.color ?? '' : '',
    },
  });

  // Initialize state when editItem changes - using useEffect is appropriate here
  // since we're syncing external data with form state
  useEffect(() => {
    if (editItem) {
      reset({
        name:        editItem.name        ?? '',
        description: editItem.description ?? '',
        price:       editItem.price       ?? 0,
        brandId:     editItem.brandId?.toString()    ?? '',
        categoryId:  editItem.categoryId?.toString() ?? '',
        status:      editItem.status      ?? 'AVAILABLE',
        stock:       editItem.stock       ?? 0,
        reference:   isPart ? (editItem as PartDto)?.reference ?? '' : '',
        size:        !isPart ? (editItem as EquipementDto)?.size ?? '' : '',
        color:       !isPart ? (editItem as EquipementDto)?.color ?? '' : '',
      });
      setProperties(editItem.properties ?? {});
      setSelectedVehicles(
        isPart ? (editItem as PartDto)?.compatibleVehicleIds ?? [] : []
      );
    } else {
      // Reset to defaults when creating new
      reset({
        name:        '',
        description: '',
        price:       0,
        brandId:     '',
        categoryId:  '',
        status:      'AVAILABLE',
        stock:       0,
        reference:   '',
        size:        '',
        color:       '',
      });
      setProperties({});
      setSelectedVehicles([]);
    }
  }, [editItem, isPart, reset]);

  // Escape key + body scroll lock
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // ── Submit ────────────────────────────────────────────────────────────
  const onSubmit = async (data: ProductFormData) => {
    const base = {
      name:        data.name,
      description: data.description,
      price:       data.price,
      brandId:     parseInt(data.brandId, 10),
      categoryId:  parseInt(data.categoryId, 10),
      status:      data.status as ProductStatus,
      stock:       data.stock,
      properties,
      // imageUrl handled separately via upload endpoint after create/update
    };

    if (isPart) {
      const payload = {
        ...base,
        reference:            data.reference ?? '',
        compatibleVehicleIds: selectedVehicles,
      };
      if (isEdit && editItem) {
        await updatePart.mutateAsync({ id: editItem.id, payload });
      } else {
        await createPart.mutateAsync(payload);
      }
    } else {
      const payload = {
        ...base,
        size:  data.size as EquipementSize | undefined,
        color: data.color,
      };
      if (isEdit && editItem) {
        await updateEquipement.mutateAsync({ id: editItem.id, payload });
      } else {
        await createEquipement.mutateAsync(payload);
      }
    }

    onClose();
  };

  // ── Vehicle toggle ─────────────────────────────────────────────────
  const toggleVehicle = (id: number) => {
    setSelectedVehicles((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className={modalStyles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEdit ? 'Edit' : 'New'} {isPart ? 'Part' : 'Equipment'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable form body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={modalStyles.formBody}
          noValidate
        >
          <div className={modalStyles.grid}>

            {/* ── Left column ────────────────────────────────── */}
            <div className={modalStyles.col}>

              {/* Name */}
              <div className={styles.field}>
                <label className={styles.label}>Name *</label>
                <input
                  type="text"
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  placeholder="Product name"
                  {...register('name')}
                />
                {errors.name && (
                  <span className={styles.fieldError}>{errors.name.message}</span>
                )}
              </div>

              {/* Reference (parts only) */}
              {isPart && (
                <div className={styles.field}>
                  <label className={styles.label}>Reference *</label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.reference ? styles.inputError : ''}`}
                    placeholder="e.g. NGK-BR8ES"
                    {...register('reference')}
                  />
                  {errors.reference && (
                    <span className={styles.fieldError}>{errors.reference.message}</span>
                  )}
                </div>
              )}

              {/* Description */}
              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Product description…"
                  {...register('description')}
                />
              </div>

              {/* Price + Stock */}
              <div className={modalStyles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Price (MAD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
                    placeholder="0.00"
                    {...register('price', { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <span className={styles.fieldError}>{errors.price.message}</span>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Stock</label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="0"
                    {...register('stock', { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Brand + Category */}
              <div className={modalStyles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Brand *</label>
                  <select
                    className={`${styles.select} ${errors.brandId ? styles.inputError : ''}`}
                    {...register('brandId')}
                  >
                    <option value="">Select brand…</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  {errors.brandId && (
                    <span className={styles.fieldError}>{errors.brandId.message}</span>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Category *</label>
                  <select
                    className={`${styles.select} ${errors.categoryId ? styles.inputError : ''}`}
                    {...register('categoryId')}
                  >
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <span className={styles.fieldError}>{errors.categoryId.message}</span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className={styles.field}>
                <label className={styles.label}>Status</label>
                <select className={styles.select} {...register('status')}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Size + Color (equipment only) */}
              {!isPart && (
                <div className={modalStyles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Size</label>
                    <select className={styles.select} {...register('size')}>
                      <option value="">No size</option>
                      {SIZES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Color</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Matte Black"
                      {...register('color')}
                    />
                  </div>
                </div>
              )}

            </div>

            {/* ── Right column ───────────────────────────────── */}
            <div className={modalStyles.col}>

              {/* Image */}
              <div className={styles.field}>
                <label className={styles.label}>Product image</label>
                <ImageUploader
                  currentImageUrl={editItem?.imageUrl}
                  onFileSelect={setImageFile}
                />
              </div>

              {/* Dynamic properties */}
              <div className={styles.field}>
                <label className={styles.label}>Dynamic properties</label>
                <DynamicPropertiesEditor
                  value={properties}
                  onChange={setProperties}
                />
              </div>

              {/* Compatible vehicles (parts only) */}
              {isPart && (
                <div className={styles.field}>
                  <label className={styles.label}>Compatible vehicles</label>
                  <div className={modalStyles.vehicleGrid}>
                    {vehicles.map((v) => (
                      <label key={v.id} className={modalStyles.vehicleCheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedVehicles.includes(v.id)}
                          onChange={() => toggleVehicle(v.id)}
                        />
                        <span>{v.name} {v.model}</span>
                      </label>
                    ))}
                  </div>
                  {selectedVehicles.length > 0 && (
                    <p className={modalStyles.vehicleCount}>
                      {selectedVehicles.length} vehicle
                      {selectedVehicles.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Footer actions */}
          <div className={modalStyles.footer}>
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
                : isEdit ? 'Save Changes' : `Create ${isPart ? 'Part' : 'Equipment'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}