import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants/routes';

/** Set to true during development to bypass authentication. */
const DEV_BYPASS = import.meta.env.DEV;

/**
 * Route guard that ensures the user is authenticated AND has ROLE_ADMIN.
 * In development mode (DEV_BYPASS = true), the guard is skipped entirely.
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
        <p>You need administrator privileges to access this area.</p>
      </div>
    );
  }

  return <Outlet />;
}