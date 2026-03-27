/**
 * RequireAdmin — route guard for ADMIN-only pages.
 *
 * Renders children only when the user is authenticated AND holds
 * the ADMIN or SUPERADMIN realm role.
 *
 * Redirects:
 *   - Unauthenticated users → /login  (with `from` state for post-login redirect)
 *   - Authenticated non-admins → /unauthorized
 *
 * Usage:
 *   <Route element={<RequireAdmin />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore, selectIsAdmin } from '../../store/authStore';

export function RequireAdmin() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore(selectIsAdmin);

  if (!isAuthenticated) {
    // Preserve intended destination for post-login redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}