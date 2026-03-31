import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ROUTES } from './constants/routes';

import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/Login/LoginPage';
import SignupPage from './pages/Signup/SignUpPage';
import PartsPage from './pages/PartsPage/PartsPage';
import PartDetailsPage from './pages/PartDetailsPage/PartDetailsPage';
import CartPage from './pages/CartPage/CartPage';

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
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage/>}/>
          <Route path={ROUTES.SIGNUP} element={<SignupPage/>}/>
          <Route path={ROUTES.PARTS} element={<PartsPage/>}/>
          <Route path={ROUTES.PARTDETAILS} element={<PartDetailsPage/>}/>
          <Route path={ROUTES.CART} element={<CartPage/>}/>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}