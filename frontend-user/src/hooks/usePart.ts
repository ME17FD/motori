import { useState, useEffect, useCallback, useMemo } from "react";
import { getPartById } from "../services/partService";
import type { PartResponse } from "../types/part.types";
import type { UUID } from "../types/common.types";

// ── Types ───────────────────────────────────────────────────────────────────

interface UsePartState {
  part: PartResponse | null;
  loading: boolean;
  error: string | null;
}

export interface UsePartReturn extends UsePartState {
  refetch: () => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const INITIAL_STATE: UsePartState = {
  part: null,
  loading: false,
  error: null,
};

// Isolated loading state — avoids resetting part/error on refetch start
const LOADING_STATE: Pick<UsePartState, "loading" | "error"> = {
  loading: true,
  error: null,
};

// ── Hook ─────────────────────────────────────────────────────────────────────

const usePart = (id: UUID | null): UsePartReturn => {
  const [state, setState] = useState<UsePartState>(INITIAL_STATE);

  const fetchPart = useCallback(async (partId: UUID) => {
    // Only reset loading + error — preserve stale part during refetch for smoother UX
    setState((prev) => ({ ...prev, ...LOADING_STATE }));

    try {
      const part = await getPartById(partId);
      setState({ part, loading: false, error: null });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch part.",
      }));
    }
  }, []); // Stable — no closure deps, receives partId as arg

  useEffect(() => {
    if (!id) {
      // Clear stale data when id is reset (e.g. modal closed, selection cleared)
      setState(INITIAL_STATE);
      return;
    }
    fetchPart(id);
  }, [id, fetchPart]);

  const refetch = useCallback(() => {
    if (id) fetchPart(id);
  }, [id, fetchPart]);

  // Memoize return — stable reference for consumers using this in a dep array
  return useMemo(
    () => ({ ...state, refetch }),
    [state, refetch]
  );
};

export default usePart;