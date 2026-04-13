import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import type { AppNotification, NotificationType } from '../../types/notification';
import { formatRelative } from '../../utils/formatters';
import styles from '../../styles/ui/NotificationPanel.module.css';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

const TYPE_ICONS: Record<NotificationType, string> = {
  ORDER_PENDING:   '🛒',
  PAYMENT_PENDING: '💳',
  LOW_STOCK:       '⚠',
  ORDER_CANCELLED: '✕',
  NEW_USER:        '👤',
};

/**
 * Slide-in notification panel shown from the Topbar bell icon.
 * Closes when clicking outside.
 */
export default function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const navigate  = useNavigate();
  const panelRef  = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    dismiss,
    clearAll,
  } = useNotificationStore();

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  const handleClick = (notif: AppNotification) => {
    markRead(notif.id);
    if (notif.linkTo) {
      navigate(notif.linkTo);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className={styles.panel} ref={panelRef} role="region" aria-label="Notifications">
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.title}>
          Notifications
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount}</span>
          )}
        </span>
        <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <button className={styles.textBtn} type="button" onClick={markAllRead}>
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button className={styles.textBtn} type="button" onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className={styles.list}>
        {notifications.length === 0 ? (
          <div className={styles.empty}>No notifications</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={[styles.item, notif.read ? styles.itemRead : ''].join(' ')}
              onClick={() => handleClick(notif)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleClick(notif)}
            >
              <span className={styles.icon}>
                {TYPE_ICONS[notif.type]}
              </span>
              <div className={styles.content}>
                <span className={styles.itemTitle}>{notif.title}</span>
                <span className={styles.itemMessage}>{notif.message}</span>
                <span className={styles.itemTime}>
                  {formatRelative(notif.createdAt)}
                </span>
              </div>
              <button
                className={styles.dismissBtn}
                type="button"
                aria-label="Dismiss"
                onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}