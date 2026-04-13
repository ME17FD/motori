import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import type {
  Part,
  Equipement,
  PartRequest,
  EquipementRequest,
  DynamicProperties,
} from '../../types/product';
import { usePartBrands } from '../../hooks/usePartBrands';
import { usePartCategories } from '../../hooks/usePartCategories';
import { useEquipementBrands } from '../../hooks/useEquipementBrands';
import { useEquipementCategories } from '../../hooks/useEquipementCategories';
import DynamicPropertiesEditor from '../Forms/DynamicPropertiesEditor';
import ImageUploader from '../Forms/ImageUploader';
import styles from '../../styles/Components/modals/FormModal.module.css';

type ProductType = 'PART' | 'EQUIPMENT';

interface ProductModalProps {
  open: boolean;
  productType: ProductType;
  initial?: Part | Equipement | null;
  loading?: boolean;
  onSubmitPart?: (data: PartRequest, newImage: File | null) => void;
  onSubmitEquipement?: (data: EquipementRequest, newImage: File | null) => void;
  onDeleteImage?: () => void;
  onClose: () => void;
}

/**
 * Unified create/edit modal for both Parts and Equipment.
 * Renders different fields depending on productType prop.
 */
export default function ProductModal(props: ProductModalProps) {
  if (!props.open) return null;
  return <ProductModalInner {...props} />;
}

function ProductModalInner({
  productType,
  initial,
  loading = false,
  onSubmitPart,
  onSubmitEquipement,
  onDeleteImage,
  onClose,
}: Omit<ProductModalProps, 'open'>) {
  const { data: partBrands }          = usePartBrands({ page: 0, size: 100 });
  const { data: partCategories }      = usePartCategories({ page: 0, size: 100 });
  const { data: equipBrands }         = useEquipementBrands({ page: 0, size: 100 });
  const { data: equipCategories }     = useEquipementCategories({ page: 0, size: 100 });

  const [properties, setProperties]   = useState<DynamicProperties>(initial?.properties ?? {});
  const [pendingImage, setPendingImage] = useState<File | null>(null);

  const isPart = productType === 'PART';

  /* ── Part form ── */
  const partForm = useForm<PartRequest>({
    defaultValues: isPart && initial
      ? {
          name:          (initial as Part).name,
          ref:           (initial as Part).ref,
          description:   (initial as Part).description,
          price:         (initial as Part).price,
          partBrandId:   (initial as Part).brand.id,
          partCategoryId:(initial as Part).category.id,
        }
      : { name: '', ref: '', price: 0, partBrandId: '', partCategoryId: '' },
  });

  /* ── Equipment form ── */
  const equipForm = useForm<EquipementRequest>({
    defaultValues: !isPart && initial
      ? {
          name:                (initial as Equipement).name,
          size:                (initial as Equipement).size,
          color:               (initial as Equipement).color,
          description:         (initial as Equipement).description,
          price:               (initial as Equipement).price,
          equipementBrandId:   (initial as Equipement).brand.id,
          equipementCategoryId:(initial as Equipement).category.id,
        }
      : { name: '', size: 'M', color: '', price: 0, equipementBrandId: '', equipementCategoryId: '' },
  });

  const handlePropertiesChange = useCallback((p: DynamicProperties) => {
    setProperties(p);
  }, []);

  const handlePartSubmit = (data: PartRequest) => {
    onSubmitPart?.({ ...data, properties }, pendingImage);
  };

  const handleEquipSubmit = (data: EquipementRequest) => {
    onSubmitEquipement?.({ ...data, properties }, pendingImage);
  };

  const imageUrl = isPart
    ? (initial as Part | null)?.imageUrl
    : (initial as Equipement | null)?.imageUrl;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal} style={{ maxWidth: 640 }}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            {initial ? `Edit ${isPart ? 'part' : 'equipment'}` : `New ${isPart ? 'part' : 'equipment'}`}
          </h3>
          <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close">✕</button>
        </div>

        {/* ── Part form ── */}
        {isPart && (
          <form onSubmit={partForm.handleSubmit(handlePartSubmit)} className={styles.form} noValidate>
            <div className={styles.field}>
              <label className={styles.label}>Name *</label>
              <input
                className={[styles.input, partForm.formState.errors.name ? styles.inputError : ''].join(' ')}
                placeholder="e.g. Front brake disc"
                {...partForm.register('name', { required: 'Name is required' })}
              />
              {partForm.formState.errors.name && (
                <span className={styles.errorMsg}>{partForm.formState.errors.name.message}</span>
              )}
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Reference *</label>
                <input
                  className={[styles.input, partForm.formState.errors.ref ? styles.inputError : ''].join(' ')}
                  placeholder="e.g. BRK-001"
                  {...partForm.register('ref', { required: 'Reference is required' })}
                />
                {partForm.formState.errors.ref && (
                  <span className={styles.errorMsg}>{partForm.formState.errors.ref.message}</span>
                )}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Price (MAD) *</label>
                <input
                  type="number"
                  step="0.01"
                  className={styles.input}
                  {...partForm.register('price', { required: true, valueAsNumber: true, min: 0 })}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Brand *</label>
                <select
                  className={styles.input}
                  {...partForm.register('partBrandId', { required: true })}
                >
                  <option value="">— Select brand —</option>
                  {partBrands?.content.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Category *</label>
                <select
                  className={styles.input}
                  {...partForm.register('partCategoryId', { required: true })}
                >
                  <option value="">— Select category —</option>
                  {partCategories?.content.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.input}
                rows={3}
                style={{ height: 'auto', padding: '8px 12px', resize: 'vertical' }}
                placeholder="Part description…"
                {...partForm.register('description')}
              />
            </div>

            <DynamicPropertiesEditor
              initialValue={initial?.properties}
              onChange={handlePropertiesChange}
            />

            <div className={styles.field}>
              <label className={styles.label}>Image</label>
              <ImageUploader
                existingUrls={imageUrl ? [imageUrl] : []}
                onFilesSelected={(files) => setPendingImage(files[0] ?? null)}
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
        )}

        {/* ── Equipment form ── */}
        {!isPart && (
          <form onSubmit={equipForm.handleSubmit(handleEquipSubmit)} className={styles.form} noValidate>
            <div className={styles.field}>
              <label className={styles.label}>Name *</label>
              <input
                className={[styles.input, equipForm.formState.errors.name ? styles.inputError : ''].join(' ')}
                placeholder="e.g. Racing helmet"
                {...equipForm.register('name', { required: 'Name is required' })}
              />
              {equipForm.formState.errors.name && (
                <span className={styles.errorMsg}>{equipForm.formState.errors.name.message}</span>
              )}
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Size *</label>
                <select className={styles.input} {...equipForm.register('size', { required: true })}>
                  {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Color *</label>
                <input
                  className={styles.input}
                  placeholder="e.g. Black"
                  {...equipForm.register('color', { required: 'Color is required' })}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Price (MAD) *</label>
                <input
                  type="number"
                  step="0.01"
                  className={styles.input}
                  {...equipForm.register('price', { required: true, valueAsNumber: true, min: 0 })}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Brand *</label>
                <select className={styles.input} {...equipForm.register('equipementBrandId', { required: true })}>
                  <option value="">— Select brand —</option>
                  {equipBrands?.content.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Category *</label>
              <select className={styles.input} {...equipForm.register('equipementCategoryId', { required: true })}>
                <option value="">— Select category —</option>
                {equipCategories?.content.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.input}
                rows={3}
                style={{ height: 'auto', padding: '8px 12px', resize: 'vertical' }}
                placeholder="Equipment description…"
                {...equipForm.register('description')}
              />
            </div>

            <DynamicPropertiesEditor
              initialValue={initial?.properties}
              onChange={handlePropertiesChange}
            />

            <div className={styles.field}>
              <label className={styles.label}>Image</label>
              <ImageUploader
                existingUrls={imageUrl ? [imageUrl] : []}
                onFilesSelected={(files) => setPendingImage(files[0] ?? null)}
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
        )}
      </div>
    </div>
  );
}