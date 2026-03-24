import type { Order } from '../../types/order';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { toPublicMinioUrl } from '../../utils/minioUrl';
import styles from '../../styles/Components/modals/FormModal.module.css';

interface OrderDetailModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetailModal({ open, order, onClose }: OrderDetailModalProps) {
  if (!open || !order) return null;

  const statusColors: Record<string, { bg: string; color: string }> = {
    PENDING:    { bg: 'rgba(245,158,11,0.12)',  color: '#b45309' },
    CONFIRMED:  { bg: 'rgba(59,130,246,0.12)',  color: '#1d4ed8' },
    PROCESSING: { bg: 'rgba(139,92,246,0.12)',  color: '#6d28d9' },
    SHIPPED:    { bg: 'rgba(20,184,166,0.12)',  color: '#0f766e' },
    DELIVERED:  { bg: 'rgba(16,185,129,0.12)',  color: '#065f46' },
    CANCELLED:  { bg: 'rgba(239,68,68,0.12)',   color: '#b91c1c' },
  };

  const s = order.status ?? (order.completed ? 'DELIVERED' : 'PENDING');
  const c = statusColors[s] ?? { bg: '#f4f5f7', color: '#666' };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal} style={{ maxWidth: 600 }}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h3>
            <span style={{
              fontSize:     11,
              padding:      '2px 8px',
              borderRadius: 12,
              background:   c.bg,
              color:        c.color,
              fontWeight:   500,
            }}>
              {s}
            </span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} type="button">✕</button>
        </div>

        <div className={styles.form} style={{ gap: 16 }}>
          {/* Meta */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: '1fr 1fr',
            gap:                 12,
            background:          'var(--color-bg-light)',
            borderRadius:        8,
            padding:             12,
          }}>
            <div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>User ID</div>
              <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
                {order.userId?.toString().slice(0, 16)}…
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Date</div>
              <div style={{ fontSize: 12 }}>{formatDateTime(order.createdAt)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Completed</div>
              <div style={{ fontSize: 12 }}>{order.completed ? '✅ Yes' : '⏳ No'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Total</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-red)' }}>
                {formatCurrency(order.totalPrice)}
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
              Items ({order.items?.length ?? 0})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(order.items ?? []).map((item) => {
                const inv  = item.inventoryId;
                const prod = inv?.part ?? inv?.equipement;
                const img  = toPublicMinioUrl(prod?.imageUrl);

                return (
                  <div
                    key={item.id}
                    style={{
                      display:      'flex',
                      alignItems:   'center',
                      gap:          12,
                      padding:      10,
                      background:   'var(--bo-card-bg)',
                      borderRadius: 8,
                      border:       '1px solid var(--color-border)',
                    }}
                  >
                    {img
                      ? <img src={img} alt={prod?.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                      : <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                          {inv?.part ? '🔧' : '🛡️'}
                        </div>
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {prod?.name ?? '—'}
                      </div>
                      <div style={{ fontSize: 11, color: '#888' }}>
                        {inv?.part ? 'Part' : 'Equipment'} · Qty: {item.quantity || 1}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} type="button">Close</button>
        </div>
      </div>
    </div>
  );
}