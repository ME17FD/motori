import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuthStore } from '../../store/authStore';
import styles from '../../styles/layouts/Sidebar.module.css';

interface NavItem {
  label: string;
  path: string;
  icon: string; // CSS class or SVG — kept as string for flexibility
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',   path: ROUTES.DASHBOARD,  icon: 'icon-dashboard' },
  { label: 'Brands',      path: ROUTES.BRANDS,     icon: 'icon-tag' },
  { label: 'Categories',  path: ROUTES.CATEGORIES, icon: 'icon-grid' },
  { label: 'Vehicles',    path: ROUTES.VEHICLES,   icon: 'icon-truck' },
  { label: 'Parts',       path: ROUTES.PARTS,      icon: 'icon-wrench' },
  { label: 'Equipment',   path: ROUTES.EQUIPMENT,  icon: 'icon-shield' },
  { label: 'Inventory',   path: ROUTES.INVENTORY,  icon: 'icon-box' },
  { label: 'Orders',      path: ROUTES.ORDERS,     icon: 'icon-shopping-bag' },
  { label: 'Payments',    path: ROUTES.PAYMENTS,   icon: 'icon-credit-card' },
  { label: 'Users',       path: ROUTES.USERS,      icon: 'icon-users' },
  { label: 'Promotions',  path: ROUTES.PROMOTIONS, icon: 'icon-percent' },
  { label: 'Reports',     path: ROUTES.REPORTS,    icon: 'icon-bar-chart' },
];

/**
 * Persistent left sidebar with navigation links.
 * Active route is highlighted via NavLink's built-in active class.
 */
export default function Sidebar() {
  const navigate = useNavigate();
  const { clearAuth, user } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate(ROUTES.LOGIN);
  };

  return (
    <aside className={styles.sidebar}>
      {/* Brand logo */}
      <div className={styles.logo}>
        <span className={styles.logoText}>Motori</span>
        <span className={styles.logoBadge}>Admin</span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.navItemActive : ''].join(' ')
            }
          >
            <span className={`${styles.navIcon} ${item.icon}`} aria-hidden="true" />
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className={styles.footer}>
        <span className={styles.userEmail}>{user?.email}</span>
        <button className={styles.logoutBtn} onClick={handleLogout} type="button">
          Sign out
        </button>
      </div>
    </aside>
  );
}