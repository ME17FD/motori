import { useCallback, useState} from 'react';
import { useForm } from 'react-hook-form';
import type { Product, CreateProductRequest, DynamicProperties } from '../../types/product';
import { useAllBrands } from '../../hooks/useBrands';
import { useAllCategories } from '../../hooks/useCategories';
import DynamicPropertiesEditor from '../Forms/DynamicPropertiesEditor';
import ImageUploader from '../Forms/ImageUploader';
import styles from '../../styles/Components/modals/FormModal.module.css';

interface ProductModalProps {
  open: boolean;
  initial?: Product | null;
  loading?: boolean;
  onSubmit: (data: CreateProductRequest, newImages: File[]) => void;
  onDeleteImage?: (url: string) => void;
  onClose: () => void;
}

/**
 * Create / edit modal for products.
 * State derived from props is initialized via a key-based remount strategy —
 * when the modal opens or the target changes, the inner form remounts cleanly
 * instead of syncing state inside effects.
 */
export default function ProductModal(props: ProductModalProps) {
  if (!props.open) return null;
  return <ProductModalInner {...props} />;
}

/**
 * Inner component — only mounted when the modal is open.
 * Using a separate inner component means we can rely on useState
 * initializers instead of useEffect syncing, avoiding cascading renders.
 */
function ProductModalInner({
  initial,
  loading = false,
  onSubmit,
  onDeleteImage,
  onClose,
}: Omit<ProductModalProps, 'open'>) {
  const { data: brands = [] }     = useAllBrands();
  const { data: categories = [] } = useAllCategories();

  /**
   * Initialize directly from props — no useEffect needed.
   * The component remounts every time the modal opens/closes,
   * so these initializers always run with fresh values.
   */
  const [properties, setProperties] = useState<DynamicProperties>(
    initial?.properties ?? {},
  );
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProductRequest>({
    defaultValues: initial
      ? {
          name:                 initial.name,
          description:          initial.description,
          price:                initial.price,
          productType:          initial.productType,
          brandId:              initial.brandId,
          categoryId:           initial.categoryId,
          compatibleVehicleIds: initial.compatibleVehicleIds,
        }
      : { productType: 'PART', price: 0 },
  });

  const handlePropertiesChange = useCallback((p: DynamicProperties) => {
    setProperties(p);
  }, []);

  const handleFormSubmit = (formData: CreateProductRequest) => {
    onSubmit({ ...formData, properties }, pendingFiles);
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal} style={{ maxWidth: 680 }}>
        <div className={styles.header}>
          <h3 className={styles.title}>{initial ? 'Edit product' : 'New product'}</h3>
          <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form} noValidate>
          {/* Name */}
          <div className={styles.field}>
            <label className={styles.label}>Name *</label>
            <input
              className={[styles.input, errors.name ? styles.inputError : ''].join(' ')}
              placeholder="e.g. Front brake disc"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <span className={styles.errorMsg}>{errors.name.message}</span>}
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.input}
              rows={3}
              style={{ height: 'auto', padding: '8px 12px', resize: 'vertical' }}
              placeholder="Product description…"
              {...register('description')}
            />
          </div>

          {/* Price + Type */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Price (MAD) *</label>
              <input
                type="number"
                step="0.01"
                className={[styles.input, errors.price ? styles.inputError : ''].join(' ')}
                {...register('price', {
                  required: 'Price is required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Price must be positive' },
                })}
              />
              {errors.price && <span className={styles.errorMsg}>{errors.price.message}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Type *</label>
              <select
                className={styles.input}
                {...register('productType', { required: true })}
              >
                <option value="PART">Part</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>
          </div>

          {/* Brand + Category */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Brand</label>
              <select className={styles.input} {...register('brandId', { valueAsNumber: true })}>
                <option value="">— Select brand —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Category</label>
              <select className={styles.input} {...register('categoryId', { valueAsNumber: true })}>
                <option value="">— Select category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic properties */}
          <DynamicPropertiesEditor
            initialValue={initial?.properties}
            onChange={handlePropertiesChange}
          />

          {/* Image uploader */}
          <div className={styles.field}>
            <label className={styles.label}>Images</label>
            <ImageUploader
              existingUrls={initial?.imageUrls ?? []}
              onFilesSelected={(files) => setPendingFiles(files)}
              onDeleteExisting={onDeleteImage}
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