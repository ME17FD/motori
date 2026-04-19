import type { UserRole } from '../../types/user';
import styles from '../../styles/ui/UserRoleBadge.module.css';

interface UserRoleBadgeProps {
  role: UserRole;
}

const ROLE_LABELS: Record<UserRole, string> = {
  USER:  'User',
  ADMIN: 'Admin',
  SUPERADMIN: 'Super Admin',
};

/**
 * Colored pill badge for user roles.
 */
export default function UserRoleBadge({ role }: UserRoleBadgeProps) {
  return (
    <span className={`${styles.badge} ${role === 'ADMIN' ? styles.admin : styles.user}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}