import { useUser } from '../../hooks/useUsers';
import { useOrders } from '../../hooks/useOrders';
import UserRoleBadge from '../ui/UserRoleBadge';
import { OrderStatusBadge } from '../ui/OrderStatusBadge';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/formatters';
import styles from '../../styles/Components/modals/UserDetailModal.module.css';

interface UserDetailModalProps {
  open: boolean;
  userId: number | null;
  onClose: () => void;
}

/**
 * Full user detail modal — profile, stats, order history and account actions.
 * Remounts via conditional render to avoid cascading setState in effects.
 */
export default function UserDetailModal(props: UserDetailModalProps) {
  if (!props.open || !props.userId) return null;
  return <UserDetailModalInner {...props} userId={props.userId} />;
}

function UserDetailModalInner({
  userId,
  onClose,
}: Omit<UserDetailModalProps, 'open'> & { userId: number }) {
  const { data: user,   isLoading: loadingUser  } = useUser(userId);
  // const { data: stats,  isLoading: loadingStats } = useUserStats(userId); // TODO: Implement user stats endpoint
  const { data: orders, isLoading: loadingOrders } = useOrders({
    userId,
    page: 0,
    size: 5,
  });
  // const { update } = useUserMutations(); // TODO: Implement user mutations hook

  // const toggleEnabled = () => {
  //   if (!user) return;
  //   update.mutate({ id: userId, payload: { enabled: !user.enabled } });
  // };

  // const toggleAdmin = () => {
  //   if (!user) return;
  //   const isAdmin = user.roles.includes('ADMIN');
  //   const newRoles: UserRole[] = isAdmin
  //     ? ['USER']
  //     : ['USER', 'ADMIN'];
  //   update.mutate({ id: userId, payload: { roles: newRoles } });
  // };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>User details</h3>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {loadingUser || !user ? (
          <div className={styles.loading}>Loading user…</div>
        ) : (
          <div className={styles.body}>
            {/* Profile */}
            <section className={styles.section}>
              <div className={styles.profileRow}>
                <div className={styles.avatar}>
                  {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
                </div>
                <div className={styles.profileInfo}>
                  <strong className={styles.profileName}>
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.email}
                  </strong>
                  <span className={styles.profileEmail}>{user.email}</span>
                  {user.phone && (
                    <span className={styles.profilePhone}>{user.phone}</span>
                  )}
                </div>
                <div className={styles.profileBadges}>
                  {user.roles.map((role) => (
                    <UserRoleBadge key={role} role={role} />
                  ))}
                  {!user.enabled && (
                    <span className={styles.disabledBadge}>Disabled</span>
                  )}
                </div>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaItem}>
                  Member since {formatDate(user.createdAt)}
                </span>
              </div>
            </section>

            {/* Stats - TODO: Implement user stats endpoint */}
            {/* <section className={styles.section}>
              <h4 className={styles.sectionTitle}>Activity</h4>
              {loadingStats || !stats ? (
                <div className={styles.statsGrid}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={styles.statSkeleton} />
                  ))}
                </div>
              ) : (
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.totalOrders}</span>
                    <span className={styles.statLabel}>Total orders</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>
                      {formatCurrency(stats.totalSpent)}
                    </span>
                    <span className={styles.statLabel}>Total spent</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>
                      {stats.lastOrderAt ? formatDate(stats.lastOrderAt) : '—'}
                    </span>
                    <span className={styles.statLabel}>Last order</span>
                  </div>
                </div>
              )}
            </section> */}

            {/* Recent orders */}
            <section className={styles.section}>
              <h4 className={styles.sectionTitle}>Recent orders</h4>
              {loadingOrders ? (
                <div className={styles.loading}>Loading orders…</div>
              ) : (orders?.content.length ?? 0) === 0 ? (
                <p className={styles.empty}>No orders yet.</p>
              ) : (
                <table className={styles.ordersTable}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders?.content.map((order) => (
                      <tr key={order.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td style={{ fontSize: 12, color: '#5c5c5c' }}>
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td><OrderStatusBadge status={order.status} /></td>
                        <td><strong>{formatCurrency(order.totalAmount)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* Account actions - TODO: Implement user management hooks */}
            {/* <section className={styles.section}>
              <h4 className={styles.sectionTitle}>Account actions</h4>
              <div className={styles.actionButtons}>
                <button
                  className={[
                    styles.actionBtn,
                    user.enabled ? styles.actionBtnDanger : styles.actionBtnSuccess,
                  ].join(' ')}
                  type="button"
                  onClick={toggleEnabled}
                  disabled={update.isPending}
                >
                  {user.enabled ? 'Disable account' : 'Enable account'}
                </button>

                <button
                  className={[
                    styles.actionBtn,
                    user.roles.includes('ADMIN')
                      ? styles.actionBtnWarning
                      : styles.actionBtnDefault,
                  ].join(' ')}
                  type="button"
                  onClick={toggleAdmin}
                  disabled={update.isPending}
                >
                  {user.roles.includes('ADMIN')
                    ? 'Remove admin role'
                    : 'Grant admin role'}
                </button>
              </div>
            </section> */}
          </div>
        )}
      </div>
    </div>
  );
}