/**
 * Application entry point.
 *
 * Responsibilities:
 * - Mount React app with StrictMode
 * - Wrap with BrowserRouter for React Router v6
 * - Initialize TanStack Query client
 * - Initialize auth store from persisted localStorage tokens
 * - Mount Sonner toast provider
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/authStore';
import App from './App';
import './styles/global.css';

// ─── TanStack Query client ─────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 min — avoid redundant refetches
      gcTime: 10 * 60 * 1000,          // 10 min — keep unused data in cache
      retry: 1,                         // One retry on failure
      refetchOnWindowFocus: false,      // Avoid surprise refetches on tab switch
    },
    mutations: {
      retry: 0,                         // Never retry mutations automatically
    },
  },
});

// ─── Auth initialization ───────────────────────────────────────────────────

// Hydrate auth store from localStorage before first render.
// This runs synchronously so the app never flashes an unauthenticated state.
useAuthStore.getState().initialize();

// ─── Root mount ────────────────────────────────────────────────────────────

const container = document.getElementById('root');
if (!container) throw new Error('[main] Root element #root not found in index.html');

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        {/* Toaster outside router so it persists across navigations */}
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