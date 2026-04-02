import { useState, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

interface UseAsyncStateReturn<T> {
  state: AsyncState<T>;
  setLoading: () => void;
  setSuccess: (data: T) => void;
  setError: (err: unknown, fallback: string) => void;
  setState: React.Dispatch<React.SetStateAction<AsyncState<T>>>;
}

/**
 * Minimal async UI state machine: loading preserves previous `data` to avoid empty flashes.
 *
 * @param initialData - Seed value for `state.data`
 */
const useAsyncState = <T>(initialData: T): UseAsyncStateReturn<T> => {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  // Transition to loading — preserves current data to avoid flash of empty content
  const setLoading = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
  }, []);

  // Transition to success
  const setSuccess = useCallback((data: T) => {
    setState({ data, loading: false, error: null });
  }, []);

  // Transition to error — preserves current data
  const setError = useCallback((err: unknown, fallback: string) => {
    setState((prev) => ({
      ...prev,
      loading: false,
      error: err instanceof Error ? err.message : fallback,
    }));
  }, []);

  return { state, setLoading, setSuccess, setError, setState };
};

export default useAsyncState;