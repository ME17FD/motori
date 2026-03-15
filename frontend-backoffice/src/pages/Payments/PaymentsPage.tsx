import { useState } from 'react';
import { usePayments, usePaymentMutations } from '../../hooks/usePayments';
import CatalogTable from '../../components/Tables/CatalogTable';
import type { CatalogColumn } from '../../components/Tables/CatalogTable';
import PaymentActionModal from '../../components/Modals/PaymentActionModal';
import PendingPaymentsAlert from '../../components/ui/PendingPaymentsAlert';
import { PaymentStatusBadge, PaymentMethodBadge } from '../../components/ui/PaymentStatusBadge';
import Pagination from '../../components/ui/Pagination';
import type {
  Payment, PaymentStatus, PaymentMethod,
  ValidatePaymentRequest, RejectPaymentRequest,
  PaymentFilters,
} from '../../types/payment';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import styles from '../../styles/pages/Payments/PaymentsPage.module.css';

const PAGE_SIZE = 15;

const STATUS_OPTIONS: Array<{ label: string; value: PaymentStatus | '' }> = [
  { label: 'All statuses', value: '' },
  { label: 'Pending',      value: 'PENDING' },
  { label: 'Validated',    value: 'VALIDATED' },
  { label: 'Rejected',     value: 'REJECTED' },
  { label: 'Refunded',     value: 'REFUNDED' },
];

const METHOD_OPTIONS: Array<{ label: string; value: PaymentMethod | '' }> = [
  { label: 'All methods', value: '' },
  { label: 'Cash',        value: 'CASH' },
  { label: 'Card',        value: 'CARD' },
  { label: 'Transfer',    value: 'TRANSFER' },
];

type ActionType = 'validate' | 'reject';

/**
 * Payments management page.
 * Focuses on manual cash payment validation with full audit trail.
 */
export default function PaymentsPage() {
  const [page, setPage]         = useState(0);
  const [status, setStatus]     = useState<PaymentStatus | ''>('');
  const [method, setMethod]     = useState<PaymentMethod | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]   = useState('');

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [action, setAction]     = useState<ActionType>('validate');

  const filters: PaymentFilters = {
    page,
    size: PAGE_SIZE,
    status: status || undefined,
    method: method || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const { data, isLoading } = usePayments(filters);
  const { validate, reject } = usePaymentMutations();

  const openModal = (payment: Payment, type: ActionType) => {
    setSelectedPayment(payment);
    setAction(type);
  };

  const handleValidate = (payload: ValidatePaymentRequest) => {
    if (!selectedPayment) return;
    validate.mutate(
      { id: selectedPayment.id, payload },
      { onSuccess: () => setSelectedPayment(null) },
    );
  };

  const handleReject = (payload: RejectPaymentRequest) => {
    if (!selectedPayment) return;
    reject.mutate(
      { id: selectedPayment.id, payload },
      { onSuccess: () => setSelectedPayment(null) },
    );
  };

  const columns: CatalogColumn<Payment>[] = [
    {
      key: 'id',
      header: 'ID',
      width: '60px',
      render: (p) => <span style={{ color: 'var(--color-gray)', fontSize: 12 }}>#{p.id}</span>,
    },
    {
      key: 'orderId',
      header: 'Order',
      render: (p) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          #{p.orderId.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'userId',
      header: 'User',
      width: '80px',
      render: (p) => `#${p.userId}`,
    },
    {
      key: 'amount',
      header: 'Amount',
      width: '120px',
      render: (p) => <strong>{formatCurrency(p.amount)}</strong>,
    },
    {
      key: 'method',
      header: 'Method',
      render: (p) => <PaymentMethodBadge method={p.method} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <PaymentStatusBadge status={p.status} />,
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (p) => (
        <span style={{ fontSize: 12, color: 'var(--color-gray)' }}>
          {p.reference ?? '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (p) => (
        <span style={{ fontSize: 12, color: 'var(--color-gray)' }}>
          {formatDateTime(p.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      {/* Pending alert */}
      <PendingPaymentsAlert />

      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Payments</h2>
          <p className={styles.subtitle}>
            {data?.totalElements ?? 0} payments total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select
          className={styles.select}
          value={status}
          onChange={(e) => { setStatus(e.target.value as PaymentStatus | ''); setPage(0); }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={method}
          onChange={(e) => { setMethod(e.target.value as PaymentMethod | ''); setPage(0); }}
        >
          {METHOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <input
          type="date"
          className={styles.select}
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
        />
        <input
          type="date"
          className={styles.select}
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
        />

        {(status || method || startDate || endDate) && (
          <button
            className={styles.clearBtn}
            type="button"
            onClick={() => {
              setStatus(''); setMethod('');
              setStartDate(''); setEndDate('');
              setPage(0);
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table with custom action buttons */}
      <div className={styles.tableWrapper}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))
        ) : (
          <>
            <CatalogTable
              columns={columns}
              data={data?.content ?? []}
              loading={false}
              emptyMessage="No payments found."
            />

            {/* Validate / Reject buttons rendered outside CatalogTable for custom logic */}
            {data && data.content.length > 0 && (
              <div className={styles.actionsColumn}>
                {data.content.map((payment) => (
                  <div key={payment.id} className={styles.rowActions}>
                    {payment.status === 'PENDING' && (
                      <>
                        <button
                          className={styles.validateBtn}
                          type="button"
                          onClick={() => openModal(payment, 'validate')}
                        >
                          Validate
                        </button>
                        <button
                          className={styles.rejectBtn}
                          type="button"
                          onClick={() => openModal(payment, 'reject')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {data && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      <PaymentActionModal
        open={!!selectedPayment}
        payment={selectedPayment}
        action={action}
        loading={validate.isPending || reject.isPending}
        onValidate={handleValidate}
        onReject={handleReject}
        onClose={() => setSelectedPayment(null)}
      />
    </div>
  );
}