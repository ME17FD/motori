/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * InventoryPage — stock management with filters and actions.
 */

import { useState } from 'react';
import { Plus, Search, X, CheckCircle, Trash2 } from 'lucide-react';
import {
  useInventory,
  useMarkAsSold,
  useUpdatePaymentStatus,
  useDeleteInventoryItem,
} from '../../hooks/useInventory';
import { ConfirmDialog } from '../../components/Modals/ConfirmDialog';
import { InventoryModal } from '../../components/Modals/InventoryModal';
import { Pagination } from '../../components/ui/Pagination';
import { formatDate } from '../../utils/formatters';
import type {
  InventoryItemDto,
  InventoryFilters,
  InventoryItemType,
  PaymentStatus,
} from '../../types/inventory';
import styles from '../../styles/pages/Inventory/InventoryPage.module.css';

const PAGE_SIZE = 20;

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, { label: string; cls: string }> = {
    PENDING:   { label: 'Pending',   cls: styles.payPending },
    PAID:      { label: 'Paid',      cls: styles.payPaid },
    CANCELLED: { label: 'Cancelled', cls: styles.payCancelled },
  };
  const { label, cls } = map[status];
  return <span className={`${styles.payBadge} ${cls}`}>{label}</span>;
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className={styles.td}>
          <div className={styles.skeletonCell} />
        </td>
      ))}
    </tr>
  );
}

export function InventoryPage() {
  const [productName, setProductName] = useState('');
  const [type, setType] = useState<InventoryItemType | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('');
  const [available, setAvailable] = useState<boolean | undefined>();
  const [page, setPage] = useState(0);

  const [showAddStock, setShowAddStock] = useState(false);
  const [sellTarget, setSellTarget] = useState<InventoryItemDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItemDto | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<InventoryItemDto | null>(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('PAID');

  const filters: InventoryFilters = {
    productName: productName || undefined,
    type: type || undefined,
    paymentStatus: paymentStatus || undefined,
    available,
    page,
    size: PAGE_SIZE,
  };

  const { data, isLoading, isError } = useInventory(filters);
  const markAsSold = useMarkAsSold();
  const updatePayment = useUpdatePaymentStatus();
  const deleteItem = useDeleteInventoryItem();

  const clearFilters = () => {
    setProductName('');
    setType('');
    setPaymentStatus('');
    setAvailable(undefined);
    setPage(0);
  };

  const hasFilters = !!(productName || type || paymentStatus || available !== undefined);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Inventory</h2>
          {data && <p className={styles.subtitle}>{data.totalElements.toLocaleString()} items</p>}
        </div>
        <button className={styles.addBtn} onClick={() => setShowAddStock(true)}>
          <Plus size={15} /> Add Stock
        </button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by product name…"
            value={productName}
            onChange={(e) => { setProductName(e.target.value); setPage(0); }}
          />
        </div>
        <select
          className={styles.select}
          value={type}
          onChange={(e) => { setType(e.target.value as InventoryItemType | ''); setPage(0); }}
        >
          <option value="">All types</option>
          <option value="PART">Part</option>
          <option value="EQUIPEMENT">Equipment</option>
        </select>
        <select
          className={styles.select}
          value={paymentStatus}
          onChange={(e) => { setPaymentStatus(e.target.value as PaymentStatus | ''); setPage(0); }}
        >
          <option value="">All payment statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          className={styles.select}
          value={available === undefined ? '' : String(available)}
          onChange={(e) => {
            const v = e.target.value;
            setAvailable(v === '' ? undefined : v === 'true');
            setPage(0);
          }}
        >
          <option value="">Available + Sold</option>
          <option value="true">Available only</option>
          <option value="false">Sold only</option>
        </select>
        {hasFilters && (
          <button className={styles.clearBtn} onClick={clearFilters}>
            <X size={13} /> Clear
          </button>
        )}
      </div>

      <div className={styles.tableCard}>
        {isError ? (
          <div className={styles.errorState}>Failed to load inventory. Please refresh.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Product</th>
                  <th className={styles.th}>Type</th>
                  <th className={styles.th}>Qty</th>
                  <th className={styles.th}>Payment</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Created</th>
                  <th className={styles.th}>Expires</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
                  : data?.content.map((item) => (
                      <tr key={item.id} className={styles.row}>
                        <td className={styles.td}>
                          <span className={styles.productName}>
                            {item.productName ?? `Product #${item.productId}`}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span className={item.type === 'PART' ? styles.typePart : styles.typeEquip}>
                            {item.type === 'PART' ? 'Part' : 'Equipment'}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span className={item.soldAt ? styles.stockZero : styles.stockOk}>
                            {item.soldAt ? '0' : '1'}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <PaymentBadge status={item.paymentStatus} />
                        </td>
                        <td className={styles.td}>
                          {item.soldAt ? (
                            <span className={styles.statusSold}>Out of stock</span>
                          ) : (
                            <span className={styles.statusAvail}>In stock</span>
                          )}
                        </td>
                        <td className={styles.td}>{formatDate(item.createdAt)}</td>
                        <td className={styles.td}>
                          {item.expiresAt ? formatDate(item.expiresAt) : <span className={styles.na}>—</span>}
                        </td>
                        <td className={styles.td}>
                          <div className={styles.rowActions}>
                            {!item.soldAt && (
                              <button
                                className={styles.iconBtn}
                                onClick={() => setSellTarget(item)}
                                title="Mark as sold"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}
                            <button
                              className={styles.iconBtn}
                              onClick={() => {
                                setPaymentTarget(item);
                                setNewPaymentStatus(item.paymentStatus);
                              }}
                              title="Update payment status"
                            >
                              <span className={styles.payIcon}>$</span>
                            </button>
                            <button
                              className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                              onClick={() => setDeleteTarget(item)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                {!isLoading && data?.content.length === 0 && (
                  <tr>
                    <td colSpan={8} className={styles.emptyState}>
                      No inventory items match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {data && data.totalPages > 1 && (
          <div className={styles.paginationWrapper}>
            <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {showAddStock && <InventoryModal onClose={() => setShowAddStock(false)} />}

      {sellTarget && (
        <ConfirmDialog
          title="Mark as Sold"
          message={`Mark item #${sellTarget.id} (${sellTarget.productName ?? 'Product #' + sellTarget.productId}) as sold?`}
          confirmLabel="Mark as Sold"
          isLoading={markAsSold.isPending}
          onConfirm={async () => {
            await markAsSold.mutateAsync(sellTarget.id);
            setSellTarget(null);
          }}
          onCancel={() => setSellTarget(null)}
        />
      )}

      {paymentTarget && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 'var(--bo-z-modal)' as never,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setPaymentTarget(null); }}
        >
          <div className={styles.paymentDialog}>
            <h3 className={styles.paymentDialogTitle}>Update Payment Status</h3>
            <p className={styles.paymentDialogSub}>
              Item #{paymentTarget.id} — {paymentTarget.productName ?? `Product #${paymentTarget.productId}`}
            </p>
            <select
              className={styles.select}
              value={newPaymentStatus}
              onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <div className={styles.paymentDialogActions}>
              <button className={styles.cancelBtn} onClick={() => setPaymentTarget(null)}>Cancel</button>
              <button
                className={styles.confirmBtn}
                disabled={updatePayment.isPending}
                onClick={async () => {
                  await updatePayment.mutateAsync({ id: paymentTarget.id, payload: { paymentStatus: newPaymentStatus } });
                  setPaymentTarget(null);
                }}
              >
                {updatePayment.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Remove Inventory Item"
          message={`Remove item #${deleteTarget.id} from inventory? This cannot be undone.`}
          confirmLabel="Remove"
          isLoading={deleteItem.isPending}
          onConfirm={async () => {
            await deleteItem.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}