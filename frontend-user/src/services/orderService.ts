import apiClient from "../api/axiosInstance";
import type { OrderResponse, OrderRequest } from "../types/order.types";
import type { UUID } from "../types/common.types";

const BASE = "/orders" as const;

// X-User-ID header factory — avoids repeating the header object shape
// and makes it easy to add more per-request headers later
const userHeader = (userId: UUID) => ({ "X-User-ID": userId }) as const;

// ── POST /api/orders ──────────────────────────────────────────────────────────

export const createOrder = async (
  userId: UUID,
  payload: OrderRequest
): Promise<OrderResponse> => {
  const { data } = await apiClient.post<OrderResponse>(BASE, payload, {
    headers: userHeader(userId),
  });
  return data;
};

// ── GET /api/orders/user/:userId ──────────────────────────────────────────────

export const getOrdersByUser = async (userId: UUID): Promise<readonly OrderResponse[]> => {
  const { data: raw } = await apiClient.get<unknown>(`${BASE}/user/${userId}`);

  const resolveArray = (value: unknown): OrderResponse[] | null => {
    if (Array.isArray(value)) return value as OrderResponse[];

    if (typeof value === 'object' && value !== null) {
      const maybeContent = (value as { content?: unknown }).content;
      if (Array.isArray(maybeContent)) return maybeContent as OrderResponse[];
    }

    return null;
  };

  const resolved = (() => {
    if (typeof raw === 'string') {
      // Some backends may return JSON string bodies.
      try {
        const parsed: unknown = JSON.parse(raw);
        return resolveArray(parsed);
      } catch {
        return null;
      }
    }

    return resolveArray(raw);
  })();

  if (!resolved) {
    throw new Error('Invalid orders response from server.');
  }

  return resolved;
};

// ── GET /api/orders/:id ───────────────────────────────────────────────────────

export const getOrderById = async (id: UUID): Promise<OrderResponse> => {
  const { data } = await apiClient.get<OrderResponse>(`${BASE}/${id}`);
  return data;
};