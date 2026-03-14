import type { UserRole } from '../../types/user';
import styles from '../../styles/ui/UserRoleBadge.module.css';

interface UserRoleBadgeProps {
  role: UserRole;
}

const ROLE_LABELS: Record<UserRole, string> = {
  ROLE_USER:  'User',
  ROLE_ADMIN: 'Admin',
};

/**
 * Colored pill badge for user roles.
 */
export default function UserRoleBadge({ role }: UserRoleBadgeProps) {
  return (
    <span className={`${styles.badge} ${role === 'ROLE_ADMIN' ? styles.admin : styles.user}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}