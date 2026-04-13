import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useNotificationPoller } from '../../hooks/useNotificationPoller';
import styles from '../../styles/layouts/AdminLayout.module.css';

/**
 * Shell layout for all authenticated admin pages.
 * Mounts the notification poller once at this level
 * so it runs for the entire admin session.
 */
export default function AdminLayout() {
  useNotificationPoller();

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Topbar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}