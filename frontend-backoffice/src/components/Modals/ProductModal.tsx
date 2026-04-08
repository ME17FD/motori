/**
 * ProductModal — unified create/edit form for Parts and Equipements.
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';  // ✅ removed SubmitHandler import
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
  partBrandId:     z.string().min(1, 'Brand is required'),
  partCategoryId:  z.string().min(1, 'Category is required'),
  status:      z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED']),
  stock:       z.number().min(0).default(0),
  ref:         z.string().optional(),
  compatibleVehicleIds: z.array(z.string()).optional(),
  size:        z.string().optional(),
  color:       z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Props {
  productType: 'part' | 'equipement';
  editItem?: PartDto | EquipementDto | null;
  onClose: () => void;
}

const SIZES: EquipementSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const STATUSES: ProductStatus[] = ['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED'];

function getInitialBrandId(editItem: PartDto | EquipementDto | null | undefined, isPart: boolean): string {
  if (!editItem) return '';
  if (isPart) return (editItem as PartDto).partBrandId ?? '';
  return String((editItem as EquipementDto).brandId ?? '');
}

function getInitialCategoryId(editItem: PartDto | EquipementDto | null | undefined, isPart: boolean): string {
  if (!editItem) return '';
  if (isPart) return (editItem as PartDto).partCategoryId ?? '';
  return String((editItem as EquipementDto).categoryId ?? '');
}

export function ProductModal({ productType, editItem, onClose }: Props) {
  const isEdit = !!editItem;
  const isPart = productType === 'part';

  const [properties, setProperties] = useState<DynamicProperties>(editItem?.properties ?? {});
  const [, setImageFile] = useState<File | null>(null); // kept for future use
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(
    isPart && editItem ? (editItem as PartDto)?.compatibleVehicleIds ?? [] : []
  );

  const brandType    = isPart ? 'PartBrand' : 'EquipementBrand';
  const categoryType = isPart ? 'PartCategory' : 'EquipementCategory';
  const { data: brands = [] } = useBrands(brandType);
  const { data: categories = [] } = useCategories(categoryType);
  const { data: vehicles = [] } = useVehicles();

  const createPart = useCreatePart();
  const updatePart = useUpdatePart();
  const createEquipement = useCreateEquipement();
  const updateEquipement = useUpdateEquipement();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name:        editItem?.name ?? '',
      description: editItem?.description ?? '',
      price:       editItem?.price ?? 0,
      partBrandId: getInitialBrandId(editItem, isPart),
      partCategoryId: getInitialCategoryId(editItem, isPart),
      status:      editItem?.status ?? 'AVAILABLE',
      stock:       editItem?.stock ?? 0,
      ref:         isPart && editItem ? (editItem as PartDto)?.ref ?? '' : '',
      size:        !isPart && editItem ? (editItem as EquipementDto)?.size ?? '' : '',
      color:       !isPart && editItem ? (editItem as EquipementDto)?.color ?? '' : '',
    },
  });

  // Reset form when editItem changes
  useEffect(() => {
    if (editItem) {
      reset({
        name:        editItem.name ?? '',
        description: editItem.description ?? '',
        price:       editItem.price ?? 0,
        partBrandId: getInitialBrandId(editItem, isPart),
        partCategoryId: getInitialCategoryId(editItem, isPart),
        status:      editItem.status ?? 'AVAILABLE',
        stock:       editItem.stock ?? 0,
        ref:         isPart ? (editItem as PartDto)?.ref ?? '' : '',
        size:        !isPart ? (editItem as EquipementDto)?.size ?? '' : '',
        color:       !isPart ? (editItem as EquipementDto)?.color ?? '' : '',
      });
      setProperties(editItem.properties ?? {});
      setSelectedVehicles(
        isPart ? (editItem as PartDto)?.compatibleVehicleIds ?? [] : []
      );
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        partBrandId: '',
        partCategoryId: '',
        status: 'AVAILABLE',
        stock: 0,
        ref: '',
        size: '',
        color: '',
      });
      setProperties({});
      setSelectedVehicles([]);
    }
  }, [editItem, isPart, reset]);

  // Escape key and body scroll lock
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // ✅ onSubmit now without explicit SubmitHandler type
  const onSubmit = async (data: ProductFormData) => {
    const base = {
      name:        data.name,
      description: data.description,
      price:       data.price,
      partBrandId: data.partBrandId,
      partCategoryId: data.partCategoryId,
      status:      data.status,
      stock:       data.stock,
      properties,
    };

    if (isPart) {
      const payload = {
        ...base,
        ref: data.ref ?? '',
        compatibleVehicleIds: selectedVehicles,
      };
      if (isEdit && editItem) {
        await updatePart.mutateAsync({ id: editItem.id, payload });
      } else {
        await createPart.mutateAsync(payload);
      }
    } else {
      const equipPayload = {
        name:        data.name,
        description: data.description,
        price:       data.price,
        brandId:     parseInt(data.partBrandId, 10),
        categoryId:  parseInt(data.partCategoryId, 10),
        status:      data.status,
        stock:       data.stock,
        size:        data.size as EquipementSize | undefined,
        color:       data.color,
        properties,
      };
      if (isEdit && editItem) {
        await updateEquipement.mutateAsync({ id: editItem.id, payload: equipPayload });
      } else {
        await createEquipement.mutateAsync(equipPayload);
      }
    }
    onClose();
  };

  const toggleVehicle = (id: string) => {
    setSelectedVehicles((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className={modalStyles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEdit ? 'Edit' : 'New'} {isPart ? 'Part' : 'Equipment'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={modalStyles.formBody} noValidate>
          <div className={modalStyles.grid}>
            {/* Left column */}
            <div className={modalStyles.col}>
              <div className={styles.field}>
                <label className={styles.label}>Name *</label>
                <input
                  type="text"
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  placeholder="Product name"
                  {...register('name')}
                />
                {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
              </div>

              {isPart && (
                <div className={styles.field}>
                  <label className={styles.label}>Reference *</label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.ref ? styles.inputError : ''}`}
                    placeholder="e.g. NGK-BR8ES"
                    {...register('ref')}
                  />
                  {errors.ref && <span className={styles.fieldError}>{errors.ref.message}</span>}
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Product description…"
                  {...register('description')}
                />
              </div>

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
                  {errors.price && <span className={styles.fieldError}>{errors.price.message}</span>}
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

              <div className={modalStyles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Brand *</label>
                  <select
                    className={`${styles.select} ${errors.partBrandId ? styles.inputError : ''}`}
                    {...register('partBrandId')}
                  >
                    <option value="">Select brand…</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  {errors.partBrandId && <span className={styles.fieldError}>{errors.partBrandId.message}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Category *</label>
                  <select
                    className={`${styles.select} ${errors.partCategoryId ? styles.inputError : ''}`}
                    {...register('partCategoryId')}
                  >
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.partCategoryId && <span className={styles.fieldError}>{errors.partCategoryId.message}</span>}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Status</label>
                <select className={styles.select} {...register('status')}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

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

            {/* Right column */}
            <div className={modalStyles.col}>
              <div className={styles.field}>
                <label className={styles.label}>Product image</label>
                <ImageUploader
                  currentImageUrl={editItem?.imageUrl}
                  onFileSelect={setImageFile}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Dynamic properties</label>
                <DynamicPropertiesEditor value={properties} onChange={setProperties} />
              </div>

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
                      {selectedVehicles.length} vehicle{selectedVehicles.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={modalStyles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : `Create ${isPart ? 'Part' : 'Equipment'}`)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}