import { useState } from 'react';
import { NavLink, useNavigate} from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuthStore } from '../../store/authStore';
import styles from '../../styles/layouts/Sidebar.module.css';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',   path: ROUTES.DASHBOARD,  icon: '◈',  group: 'Main' },
  { label: 'Brands',      path: ROUTES.BRANDS,     icon: '◉',  group: 'Catalog' },
  { label: 'Categories',  path: ROUTES.CATEGORIES, icon: '▦',  group: 'Catalog' },
  { label: 'Vehicles',    path: ROUTES.VEHICLES,   icon: '⊟',  group: 'Catalog' },
  { label: 'Parts',       path: ROUTES.PARTS,      icon: '⚙',  group: 'Products' },
  { label: 'Equipment',   path: ROUTES.EQUIPMENT,  icon: '⊞',  group: 'Products' },
  { label: 'Inventory',   path: ROUTES.INVENTORY,  icon: '▤',  group: 'Operations' },
  { label: 'Orders',      path: ROUTES.ORDERS,     icon: '◎',  group: 'Operations' },
  { label: 'Payments',    path: ROUTES.PAYMENTS,   icon: '◈',  group: 'Operations' },
  { label: 'Users',       path: ROUTES.USERS,      icon: '◯',  group: 'Admin' },
  { label: 'Promotions',  path: ROUTES.PROMOTIONS, icon: '◇',  group: 'Admin' },
  { label: 'Reports',     path: ROUTES.REPORTS,    icon: '▨',  group: 'Admin' },
];

/**
 * Groups nav items by their group label.
 */
function groupItems(items: NavItem[]): Array<{ group: string; items: NavItem[] }> {
  const map = new Map<string, NavItem[]>();
  items.forEach((item) => {
    const g = item.group ?? 'Other';
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(item);
  });
  return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
}

const GROUPS = groupItems(NAV_ITEMS);

/**
 * Responsive sidebar:
 * - Desktop (>= 1024px): fixed 240px sidebar, always visible.
 * - Tablet (768–1023px): collapsed to 64px icon-only rail.
 * - Mobile (< 768px): hidden by default, slides in as a full drawer
 *   triggered by a hamburger button injected into the Topbar.
 */
export default function Sidebar() {
  const navigate  = useNavigate();
  const { clearAuth, user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate(ROUTES.LOGIN);
  };

  /* Close mobile drawer on navigation */
  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        className={styles.hamburger}
        type="button"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMobileOpen((v) => !v)}
      >
        <span className={[styles.bar, mobileOpen ? styles.barTop : ''].join(' ')} />
        <span className={[styles.bar, mobileOpen ? styles.barMid : ''].join(' ')} />
        <span className={[styles.bar, mobileOpen ? styles.barBot : ''].join(' ')} />
      </button>

      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside className={[styles.sidebar, mobileOpen ? styles.sidebarOpen : ''].join(' ')}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoText}>Motori</span>
          <span className={styles.logoBadge}>Admin</span>
        </div>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Main navigation">
          {GROUPS.map(({ group, items }) => (
            <div key={group} className={styles.group}>
              <span className={styles.groupLabel}>{group}</span>
              {items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    [styles.navItem, isActive ? styles.navItemActive : ''].join(' ')
                  }
                  title={item.label}
                >
                  <span className={styles.navIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className={styles.navLabel}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <span className={styles.userAvatar} aria-hidden="true">
              {(user?.email?.[0] ?? 'A').toUpperCase()}
            </span>
            <span className={styles.userEmail}>{user?.email}</span>
          </div>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            type="button"
          >
            <span aria-hidden="true">⎋</span>
            <span className={styles.navLabel}>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}