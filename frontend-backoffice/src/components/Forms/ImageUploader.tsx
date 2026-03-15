import { useRef, useState } from 'react';
import styles from '../../styles/Components/forms/ImageUploader.module.css';

interface ImageUploaderProps {
  /** Existing image URLs from Minio (when editing a product). */
  existingUrls?: string[];
  onFilesSelected: (files: File[]) => void;
  onDeleteExisting?: (url: string) => void;
}

/**
 * Drag-and-drop + click image uploader.
 * Previews selected files locally before upload.
 * Displays existing Minio URLs with a delete option.
 */
export default function ImageUploader({
  existingUrls = [],
  onFilesSelected,
  onDeleteExisting,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    const urls = fileArray.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...urls]);
    onFilesSelected(fileArray);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className={styles.wrapper}>
      {/* Drop zone */}
      <div
        className={[styles.dropZone, dragging ? styles.dragging : ''].join(' ')}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload images"
      >
        <span className={styles.dropIcon}>📎</span>
        <span className={styles.dropText}>
          Drop images here or <u>click to browse</u>
        </span>
        <span className={styles.dropHint}>PNG, JPG, WEBP — max 5MB each</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className={styles.hiddenInput}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Preview grid */}
      {(existingUrls.length > 0 || previews.length > 0) && (
        <div className={styles.previewGrid}>
          {/* Existing images from Minio */}
          {existingUrls.map((url) => (
            <div key={url} className={styles.previewItem}>
              <img src={url} alt="Product" className={styles.previewImg} />
              {onDeleteExisting && (
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => onDeleteExisting(url)}
                  aria-label="Remove image"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {/* Local previews (not yet uploaded) */}
          {previews.map((url) => (
            <div key={url} className={`${styles.previewItem} ${styles.pending}`}>
              <img src={url} alt="Preview" className={styles.previewImg} />
              <span className={styles.pendingBadge}>Pending</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}