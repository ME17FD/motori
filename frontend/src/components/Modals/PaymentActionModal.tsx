import { useForm } from 'react-hook-form';
import type { Payment, ValidatePaymentRequest, RejectPaymentRequest } from '../../types/payment';
import { PaymentStatusBadge, PaymentMethodBadge } from '../ui/PaymentStatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import styles from '../../styles/Components/modals/FormModal.module.css';
import actionStyles from '../../styles/Components/modals/PaymentActionModal.module.css';

type ActionType = 'validate' | 'reject';

interface PaymentActionModalProps {
  open: boolean;
  payment: Payment | null;
  action: ActionType;
  loading?: boolean;
  onValidate: (payload: ValidatePaymentRequest) => void;
  onReject: (payload: RejectPaymentRequest) => void;
  onClose: () => void;
}

/**
 * Modal for validating or rejecting a cash payment.
 * Remounts via conditional render to avoid cascading setState in effects.
 */
export default function PaymentActionModal(props: PaymentActionModalProps) {
  if (!props.open || !props.payment) return null;
  return <PaymentActionModalInner {...props} payment={props.payment} />;
}

function PaymentActionModalInner({
  payment,
  action,
  loading = false,
  onValidate,
  onReject,
  onClose,
}: Omit<PaymentActionModalProps, 'open'> & { payment: Payment }) {
  const isValidate = action === 'validate';

  const { register, handleSubmit, formState: { errors } } =
    useForm<ValidatePaymentRequest & RejectPaymentRequest>({
      defaultValues: {
        notes:     payment.notes ?? '',
        reference: payment.reference ?? '',
      },
    });

  const onSubmit = (data: ValidatePaymentRequest & RejectPaymentRequest) => {
    if (isValidate) {
      onValidate({ notes: data.notes, reference: data.reference });
    } else {
      onReject({ notes: data.notes ?? '' });
    }
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            {isValidate ? 'Validate payment' : 'Reject payment'}
          </h3>
          <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.form}>
          {/* Payment summary */}
          <div className={actionStyles.summary}>
            <div className={actionStyles.summaryRow}>
              <span className={actionStyles.summaryLabel}>Order</span>
              <span className={actionStyles.summaryValue}>
                #{payment.orderId.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div className={actionStyles.summaryRow}>
              <span className={actionStyles.summaryLabel}>Amount</span>
              <span className={actionStyles.summaryValue}>
                <strong>{formatCurrency(payment.amount)}</strong>
              </span>
            </div>
            <div className={actionStyles.summaryRow}>
              <span className={actionStyles.summaryLabel}>Method</span>
              <PaymentMethodBadge method={payment.method} />
            </div>
            <div className={actionStyles.summaryRow}>
              <span className={actionStyles.summaryLabel}>Status</span>
              <PaymentStatusBadge status={payment.status} />
            </div>
            <div className={actionStyles.summaryRow}>
              <span className={actionStyles.summaryLabel}>Date</span>
              <span className={actionStyles.summaryValue}>
                {formatDateTime(payment.createdAt)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Reference (validate only) */}
              {isValidate && (
                <div className={styles.field}>
                  <label className={styles.label}>Reference / Receipt number</label>
                  <input
                    className={styles.input}
                    placeholder="e.g. REC-2024-001"
                    {...register('reference')}
                  />
                </div>
              )}

              {/* Notes */}
              <div className={styles.field}>
                <label className={styles.label}>
                  {isValidate ? 'Notes (optional)' : 'Reason for rejection *'}
                </label>
                <textarea
                  className={[
                    styles.input,
                    errors.notes ? styles.inputError : '',
                  ].join(' ')}
                  rows={3}
                  style={{ height: 'auto', padding: '8px 12px', resize: 'vertical' }}
                  placeholder={
                    isValidate
                      ? 'Internal notes…'
                      : 'Explain why this payment is being rejected…'
                  }
                  {...register('notes', {
                    required: !isValidate ? 'Reason is required' : false,
                  })}
                />
                {errors.notes && (
                  <span className={styles.errorMsg}>{errors.notes.message}</span>
                )}
              </div>

              <div className={styles.footer}>
                <button
                  className={styles.cancelBtn}
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className={[
                    styles.submitBtn,
                    !isValidate ? actionStyles.rejectBtn : '',
                  ].join(' ')}
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? 'Processing…'
                    : isValidate
                      ? 'Validate payment'
                      : 'Reject payment'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}