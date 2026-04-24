import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ROUTES } from './constants/routes';

import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/Login/LoginPage';
import SignupPage from './pages/Signup/SignUpPage';
import PartsPage from './pages/PartsPage/PartsPage';
import PartDetailsPage from './pages/PartDetailsPage/PartDetailsPage';
import CartPage from './pages/CartPage/CartPage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import ProfilePage from './pages/ProfilePage/Profilepage';

/**
 * TanStack Query client shared by all data hooks.
 * - `staleTime` 30s — treat server data as fresh briefly to limit refetches.
 * - `retry` 1 — single retry on transient network errors.
 * - `refetchOnWindowFocus` false — avoids surprise reloads when switching tabs.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            30_000,
      retry:                1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/** Root layout: React Query provider + browser router and public routes. */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage/>}/>
          <Route path={ROUTES.SIGNUP} element={<SignupPage/>}/>
          <Route path={ROUTES.PARTS} element={<PartsPage/>}/>
          <Route path={ROUTES.PARTDETAILS} element={<PartDetailsPage/>}/>
          <Route path={ROUTES.CART} element={<CartPage/>}/>
          <Route path={ROUTES.CHECKOUT} element={<CheckoutPage/>}/>
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}