/**
 * Topbar — fixed top bar displayed on all admin pages.
 *
 * Contains:
 * - Hamburger menu button (mobile + desktop collapse toggle)
 * - Current page title (derived from the route)
 * - User avatar with username
 * - Notification bell (placeholder for future WebSocket integration)
 */

import { Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuthStore, selectUser } from '../../store/authStore';
import styles from '../../styles/layouts/Topbar.module.css';

// ─── Route → page title map ────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':          'Dashboard',
  '/catalog/brands':     'Brands',
  '/catalog/categories': 'Categories',
  '/catalog/vehicles':   'Vehicles',
  '/products/parts':     'Parts',
  '/products/equipment': 'Equipment',
  '/inventory':          'Inventory',
  '/orders':             'Orders',
  '/payments':           'Payments',
  '/users':              'Users',
  '/promotions':         'Promotions',
  '/reports':            'Reports',
};

// ─── Component ─────────────────────────────────────────────────────────────

interface TopbarProps {
  collapsed: boolean;
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const user = useAuthStore(selectUser);

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Backoffice';

  // Derive initials for the avatar (e.g. "John Doe" → "JD")
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() ||
      user.username[0].toUpperCase()
    : '?';

  return (
    <header className={styles.topbar}>
      {/* ── Left: menu toggle + page title ───────────────────────── */}
      <div className={styles.left}>
        <button
          className={styles.menuBtn}
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <span className={styles.menuIcon} />
          <span className={styles.menuIcon} />
          <span className={styles.menuIcon} />
        </button>

        <h1 className={styles.pageTitle}>{pageTitle}</h1>
      </div>

      {/* ── Right: notifications + user ──────────────────────────── */}
      <div className={styles.right}>
        {/* Notification bell — wired up in a later step with polling */}
        <button className={styles.iconBtn} aria-label="Notifications">
          <Bell size={18} />
        </button>

        {/* User avatar */}
        <div className={styles.avatar} title={user?.fullName}>
          {initials}
        </div>
      </div>
    </header>
  );
}