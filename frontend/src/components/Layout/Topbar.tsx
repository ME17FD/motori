import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import styles from '../../styles/layouts/Topbar.module.css';
import NotificationPanel from '../ui/NotificationPanel';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/catalog':    'Catalog',
  '/products':   'Products',
  '/inventory':  'Inventory',
  '/orders':     'Orders',
  '/payments':   'Payments',
  '/users':      'Users',
  '/promotions': 'Promotions',
  '/reports':    'Reports',
};

function resolveTitle(pathname: string): string {
  const match = Object.keys(PAGE_TITLES).find((prefix) =>
    pathname.startsWith(prefix),
  );
  return match ? PAGE_TITLES[match] : 'Backoffice';
}

/**
 * Fixed top navigation bar with notification bell.
 */
export default function Topbar() {
  const { pathname }   = useLocation();
  const { user }       = useAuthStore();
  const unreadCount    = useNotificationStore((s) => s.unreadCount);
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <header className={styles.topbar}>
      <h1 className={styles.pageTitle}>{resolveTitle(pathname)}</h1>

      <div className={styles.actions}>
        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            className={styles.bellBtn}
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            aria-label="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className={styles.bellBadge}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationPanel
            open={panelOpen}
            onClose={() => setPanelOpen(false)}
          />
        </div>

        <div className={styles.userChip}>
          <span className={styles.userAvatar} aria-hidden="true">
            {(user?.email?.[0] ?? 'A').toUpperCase()}
          </span>
          <span className={styles.userLabel}>{user?.email}</span>
        </div>
      </div>
    </header>
  );
}