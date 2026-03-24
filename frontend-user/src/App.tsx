import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ROUTES } from './constants/routes';

import LoginPage from './pages/Login/LoginPage';
import HomePage from './pages/HomePage/HomePage';
import SignupPage from './pages/Signup/SignUpPage';
import ArticlesPage from './pages/ArticlesPage/ArticlesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          <Route path={ROUTES.ARTICLES} element={<ArticlesPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
