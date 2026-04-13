/**
 * Sidebar — fixed left navigation for the backoffice.
 *
 * Features:
 * - Collapsible (icon-only mode when collapsed)
 * - Active route highlighting via NavLink
 * - Grouped navigation sections
 * - Logout button at the bottom
 *
 * Nav groups:
 *   Main      → Dashboard
 *   Catalogue → Brands, Categories, Vehicles
 *   Products  → Parts, Equipment
 *   Stock     → Inventory
 *   Sales     → Orders, Payments
 *   CRM       → Users, Promotions
 *   Reports   → Reports
 */

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Tag,
  FolderTree,
  Car,
  Wrench,
  Shield,
  Package,
  ShoppingCart,
  CreditCard,
  Users,
  Percent,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/layouts/Sidebar.module.css';

// ─── Nav item type ─────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

// ─── Navigation config ─────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      { label: 'Brands',     path: '/catalog/brands',     icon: <Tag size={18} /> },
      { label: 'Categories', path: '/catalog/categories', icon: <FolderTree size={18} /> },
      { label: 'Vehicles',   path: '/catalog/vehicles',   icon: <Car size={18} /> },
    ],
  },
  {
    title: 'Products',
    items: [
      { label: 'Parts',      path: '/products/parts',      icon: <Wrench size={18} /> },
      { label: 'Equipment',  path: '/products/equipment',  icon: <Shield size={18} /> },
    ],
  },
  {
    title: 'Stock',
    items: [
      { label: 'Inventory',  path: '/inventory', icon: <Package size={18} /> },
    ],
  },
  {
    title: 'Sales',
    items: [
      { label: 'Orders',   path: '/orders',   icon: <ShoppingCart size={18} /> },
      { label: 'Payments', path: '/payments', icon: <CreditCard size={18} /> },
    ],
  },
  {
    title: 'CRM',
    items: [
      { label: 'Users',       path: '/users',       icon: <Users size={18} /> },
      { label: 'Promotions',  path: '/promotions',  icon: <Percent size={18} /> },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Reports', path: '/reports', icon: <BarChart2 size={18} /> },
    ],
  },
];

// ─── Component ─────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { logout, user } = useAuth();

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
      aria-label="Main navigation"
    >
      {/* ── Logo / brand ────────────────────────────────────────── */}
      <div className={styles.brand}>
        {!collapsed && (
          <span className={styles.brandName}>
            <span className={styles.brandAccent}>M</span>otori
          </span>
        )}
        <button
          className={styles.toggleBtn}
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* ── Navigation groups ────────────────────────────────────── */}
      <nav className={styles.nav}>
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className={styles.group}>
            {/* Group title hidden when collapsed */}
            {!collapsed && (
              <span className={styles.groupTitle}>{group.title}</span>
            )}

            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {!collapsed && (
                  <span className={styles.navLabel}>{item.label}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── User + logout ────────────────────────────────────────── */}
      <div className={styles.footer}>
        {!collapsed && user && (
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.fullName}</span>
            <span className={styles.userRole}>
              {user.roles.includes('SUPERADMIN') ? 'Super Admin' : 'Admin'}
            </span>
          </div>
        )}
        <button
          className={styles.logoutBtn}
          onClick={logout}
          title="Log out"
          aria-label="Log out"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}