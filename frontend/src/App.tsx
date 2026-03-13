import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ROUTES } from './constants/routes';

import RequireAdmin   from './components/Layout/RequireAdmin';
import AdminLayout    from './components/Layout/AdminLayout';

import LoginPage      from './pages/Auth/Login';
import DashboardPage  from './pages/Dashboard/index';
import BrandsPage     from './pages/Catalog/BrandsPage';
import CategoriesPage from './pages/Catalog/CategoriesPage';
import VehiclesPage   from './pages/Catalog/VehiclesPage';
import EquipmentPage from './pages/Products/EquipmentPage';
import PartsPage from './pages/Products/PartsPage';
import InventoryPage from './pages/Inventory/InventoryPage';
import OrdersPage from './pages/Orders/OrdersPage';
import PaymentsPage from './pages/Payments/PaymentsPage';
import UsersPage from './pages/Users/UsersPage';
import PromotionsPage from './pages/Promotions/PromotionsPage';

/**
 * TanStack Query client with sensible defaults for a backoffice.
 * - staleTime: 30s — backoffice data changes infrequently.
 * - retry: 1 — one retry on network errors, fail fast for UX.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            30_000,
      retry:                1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />

          {/* Protected — ADMIN only */}
          <Route element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
              <Route path={ROUTES.DASHBOARD}   element={<DashboardPage />} />
              <Route path={ROUTES.BRANDS}      element={<BrandsPage />} />
              <Route path={ROUTES.CATEGORIES}  element={<CategoriesPage />} />
              <Route path={ROUTES.VEHICLES}    element={<VehiclesPage />} />
              <Route path={ROUTES.PARTS}      element={<PartsPage />} />
              <Route path={ROUTES.EQUIPMENT}  element={<EquipmentPage />} />
              <Route path={ROUTES.INVENTORY} element={<InventoryPage />} />
              <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
              <Route path={ROUTES.PAYMENTS} element={<PaymentsPage />} />
              <Route path={ROUTES.USERS}       element={<UsersPage />} />
              <Route path={ROUTES.PROMOTIONS} element={<PromotionsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}