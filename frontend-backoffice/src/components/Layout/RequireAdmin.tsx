import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants/routes';

/** Set to true during development to bypass authentication. */
const DEV_BYPASS = false;

/**
 * Route guard — ensures the user is authenticated and has ADMIN or SUPERADMIN role.
 * In development mode (DEV_BYPASS = true), the guard is skipped entirely.
 * Roles come from Keycloak realm_access.roles as "ADMIN" or "SUPERADMIN".
 */
export default function RequireAdmin() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const location = useLocation();

  if (DEV_BYPASS) return <Outlet />;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access denied</h2>
        <p>You need ADMIN or SUPERADMIN privileges to access this area.</p>
      </div>
    );
  }

  return <Outlet />;
}
