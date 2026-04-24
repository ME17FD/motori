import { type ReactElement, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import Loading from "../../ui/Loading/Loading";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Renders children only when `useAuth` reports an authenticated user; otherwise redirects to login.
 * Shows a loading state while auth/session restore is in progress.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps): ReactElement => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading label="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
