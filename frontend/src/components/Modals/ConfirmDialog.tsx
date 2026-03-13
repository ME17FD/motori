import styles from '../../styles/Components/modals/ConfirmDialog.module.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Reusable confirmation dialog for destructive actions (delete, cancel order…).
 * Uses a faux-viewport wrapper to avoid position:fixed inside the iframe.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.dialog}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button
            className={styles.cancelBtn}
            onClick={onCancel}
            type="button"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={[styles.confirmBtn, danger ? styles.danger : ''].join(' ')}
            onClick={onConfirm}
            type="button"
            disabled={loading}
          >
            {loading ? 'Loading…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}