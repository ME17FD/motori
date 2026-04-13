import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/authStore';
import App from './App';
import './styles/global.css';

// ─── TanStack Query ────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            5 * 60 * 1000,
      gcTime:               10 * 60 * 1000,
      retry:                1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ─── Auth initialization ───────────────────────────────────────────────────

/**
 * CRITICAL: Call initialize() synchronously before createRoot().
 *
 * This reads tokens directly from localStorage (flat keys, no JSON wrapping)
 * and populates the Zustand store BEFORE any component renders.
 *
 * Because we no longer use Zustand's persist middleware, there is no async
 * rehydration — initialize() is purely synchronous and always completes
 * before the first render cycle begins.
 */
useAuthStore.getState().initialize();

// ─── Root ──────────────────────────────────────────────────────────────────

const container = document.getElementById('root');
if (!container) {
  throw new Error('[main] Root element #root not found in index.html');
}

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);