/**
 * App — root route configuration.
 *
 * Route structure:
 *   /login                  → Login page (public)
 *   /unauthorized           → 403 page (public)
 *   /                       → Redirect to /dashboard
 *   /* (admin routes)       → Protected by RequireAdmin
 *       /dashboard
 *       /products/parts
 *       /products/equipment
 *       /inventory
 *       /orders
 *       /payments
 *       /catalog/brands
 *       /catalog/categories
 *       /catalog/vehicles
 *       /users
 *       /promotions
 *       /reports
 *   *                       → 404 fallback
 *
 * All admin routes are lazy-loaded to keep the initial bundle small.
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAdmin } from './components/Layout/RequireAdmin';
import { AdminLayout } from './components/Layout/AdminLayout';
import { PageLoader } from './components/ui/PageLoader';

// ─── Public pages (eager — small, needed immediately) ─────────────────────

import { LoginPage } from './pages/Auth/Login';
import { UnauthorizedPage } from './pages/Auth/Unauthorized';
import { NotFoundPage } from './pages/NotFound';

// ─── Admin pages (lazy — only loaded after authentication) ────────────────

const Dashboard       = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.DashboardPage })));
const PartsPage       = lazy(() => import('./pages/Products/PartsPage').then(m => ({ default: m.PartsPage })));
const EquipmentPage   = lazy(() => import('./pages/Products/EquipmentPage').then(m => ({ default: m.EquipmentPage })));
const InventoryPage   = lazy(() => import('./pages/Inventory/InventoryPage').then(m => ({ default: m.InventoryPage })));
const OrdersPage      = lazy(() => import('./pages/Orders/OrdersPage').then(m => ({ default: m.OrdersPage })));
const PaymentsPage    = lazy(() => import('./pages/Payments/PaymentsPage').then(m => ({ default: m.PaymentsPage })));
const BrandsPage      = lazy(() => import('./pages/Catalog/BrandsPage').then(m => ({ default: m.BrandsPage })));
const CategoriesPage  = lazy(() => import('./pages/Catalog/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const VehiclesPage    = lazy(() => import('./pages/Catalog/VehiclesPage').then(m => ({ default: m.VehiclesPage })));
const UsersPage       = lazy(() => import('./pages/Users/UsersPage').then(m => ({ default: m.UsersPage })));
const PromotionsPage  = lazy(() => import('./pages/Promotions/PromotionsPage').then(m => ({ default: m.PromotionsPage })));
const ReportsPage     = lazy(() => import('./pages/Reports/ReportsPage').then(m => ({ default: m.ReportsPage })));

// ─── App ───────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      {/* ── Public routes ──────────────────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ── Root redirect ──────────────────────────────────────────── */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* ── Protected admin routes ─────────────────────────────────── */}
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/products/parts"
            element={
              <Suspense fallback={<PageLoader />}>
                <PartsPage />
              </Suspense>
            }
          />
          <Route
            path="/products/equipment"
            element={
              <Suspense fallback={<PageLoader />}>
                <EquipmentPage />
              </Suspense>
            }
          />
          <Route
            path="/inventory"
            element={
              <Suspense fallback={<PageLoader />}>
                <InventoryPage />
              </Suspense>
            }
          />
          <Route
            path="/orders"
            element={
              <Suspense fallback={<PageLoader />}>
                <OrdersPage />
              </Suspense>
            }
          />
          <Route
            path="/payments"
            element={
              <Suspense fallback={<PageLoader />}>
                <PaymentsPage />
              </Suspense>
            }
          />
          <Route
            path="/catalog/brands"
            element={
              <Suspense fallback={<PageLoader />}>
                <BrandsPage />
              </Suspense>
            }
          />
          <Route
            path="/catalog/categories"
            element={
              <Suspense fallback={<PageLoader />}>
                <CategoriesPage />
              </Suspense>
            }
          />
          <Route
            path="/catalog/vehicles"
            element={
              <Suspense fallback={<PageLoader />}>
                <VehiclesPage />
              </Suspense>
            }
          />
          <Route
            path="/users"
            element={
              <Suspense fallback={<PageLoader />}>
                <UsersPage />
              </Suspense>
            }
          />
          <Route
            path="/promotions"
            element={
              <Suspense fallback={<PageLoader />}>
                <PromotionsPage />
              </Suspense>
            }
          />
          <Route
            path="/reports"
            element={
              <Suspense fallback={<PageLoader />}>
                <ReportsPage />
              </Suspense>
            }
          />
        </Route>
      </Route>

      {/* ── 404 fallback ───────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}