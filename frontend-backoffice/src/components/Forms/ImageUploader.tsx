/**
 * ImageUploader — drag-and-drop image upload component.
 *
 * Uses react-dropzone for drag/drop handling.
 * Shows a preview of the selected image.
 * Calls onFileSelect when a file is chosen — actual upload
 * is handled by the parent after form submission.
 *
 * Install: npm install react-dropzone
 */

import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import styles from '../../styles/Components/forms/ImageUploader.module.css';

interface Props {
  /** Current image URL (from existing product) */
  currentImageUrl?: string;
  /** Called when the user selects a new file */
  onFileSelect: (file: File | null) => void;
}

const ACCEPTED = { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] };
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export function ImageUploader({ currentImageUrl, onFileSelect }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], fileRejections: FileRejection[]) => {
      setError(null);

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        const errorCode = rejection.errors[0]?.code;
        
        if (errorCode === 'file-too-large') {
          setError('Image must be under 5 MB.');
        } else if (errorCode === 'file-invalid-type') {
          setError('Please upload a valid image file (JPG, PNG, WebP).');
        } else {
          setError('Please upload a valid image file (JPG, PNG, WebP).');
        }
        return;
      }

      if (accepted.length === 0) return;

      const file = accepted[0];
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:   ACCEPTED,
    maxSize:  MAX_SIZE,
    multiple: false,
  });

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onFileSelect(null);
  };

  const displayUrl = preview ?? currentImageUrl;

  return (
    <div className={styles.wrapper}>
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''}`}
      >
        <input {...getInputProps()} />

        {displayUrl ? (
          /* Image preview */
          <div className={styles.preview}>
            <img
              src={displayUrl}
              alt="Product preview"
              className={styles.previewImg}
            />
            <button
              type="button"
              className={styles.clearBtn}
              onClick={clearImage}
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          /* Upload prompt */
          <div className={styles.prompt}>
            <Upload size={24} className={styles.promptIcon} />
            <p className={styles.promptText}>
              {isDragActive
                ? 'Drop the image here…'
                : 'Drag & drop or click to upload'}
            </p>
            <p className={styles.promptHint}>JPG, PNG, WebP — max 5 MB</p>
          </div>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}