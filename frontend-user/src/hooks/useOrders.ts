import { useCallback, useMemo } from "react";
import {
  getOrdersByUser,
  createOrder as createOrderService,
} from "../services/orderService";
import { cartToOrderRequest } from "../utils/orderUtils";
import useAsyncState from "./useAsyncState";
import type { OrderResponse } from "../types/order.types";
import type { CartItem } from "../types/cart.types";
import type { UUID } from "../types/common.types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UseOrdersReturn {
  orders: readonly OrderResponse[];
  loading: boolean;
  error: string | null;
  fetchOrders: (userId: UUID) => Promise<void>;
  createOrder: (userId: UUID, cartItems: readonly CartItem[]) => Promise<OrderResponse | null>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

const useOrders = (): UseOrdersReturn => {
  const { state, setLoading, setSuccess, setError, setState } =
    useAsyncState<readonly OrderResponse[]>([]);

  // ── Fetch user orders ──────────────────────────────────────────────────────

  const fetchOrders = useCallback(async (userId: UUID) => {
    setLoading();
    try {
      const orders = await getOrdersByUser(userId);
      setSuccess(orders);
    } catch (err) {
      setError(err, "Failed to fetch orders.");
    }
  }, [setLoading, setSuccess, setError]);

  // ── Create order from cart ─────────────────────────────────────────────────

  const createOrder = useCallback(
    async (
      userId: UUID,
      cartItems: readonly CartItem[]
    ): Promise<OrderResponse | null> => {
      setLoading();
      try {
        const order = await createOrderService(
          userId,
          cartToOrderRequest(cartItems)
        );

        // Prepend new order — most recent first, no refetch needed
        setState((prev) => ({
          ...prev,
          data: [order, ...prev.data],
          loading: false,
          error: null,
        }));

        return order;
      } catch (err) {
        setError(err, "Failed to create order.");
        return null;
      }
    },
    [setLoading, setError, setState]
  );

  return useMemo(
    () => ({
      orders: state.data,
      loading: state.loading,
      error: state.error,
      fetchOrders,
      createOrder,
    }),
    [state, fetchOrders, createOrder]
  );
};

export default useOrders;