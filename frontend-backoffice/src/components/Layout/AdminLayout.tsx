/**
 * AdminLayout — shell layout for all protected backoffice pages.
 *
 * Structure:
 *   ┌─────────────────────────────────────┐
 *   │  Sidebar (fixed, collapsible)        │
 *   │  ┌───────────────────────────────┐  │
 *   │  │  Topbar (fixed)               │  │
 *   │  │  ┌─────────────────────────┐  │  │
 *   │  │  │  <Outlet /> (page)      │  │  │
 *   │  │  └─────────────────────────┘  │  │
 *   │  └───────────────────────────────┘  │
 *   └─────────────────────────────────────┘
 *
 * Sidebar collapse state is stored in localStorage so it persists
 * across page navigations and browser refreshes.
 */

import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import styles from '../../styles/layouts/AdminLayout.module.css';

const SIDEBAR_COLLAPSED_KEY = 'motori_sidebar_collapsed';

export function AdminLayout() {
  // Restore collapsed state from localStorage
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  });

  // Persist collapsed state on change
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  return (
    <div
      className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}
    >
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />

      {/* ── Main area ────────────────────────────────────────────── */}
      <div className={styles.main}>
        <Topbar collapsed={collapsed} onMenuClick={toggleSidebar} />

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}