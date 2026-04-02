import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrdersByUser,
  createOrder as createOrderService,
} from "../services/orderService";
import { cartToOrderRequest } from "../utils/orderUtils";
import { queryKeys } from "../api/queryKeys";
import parseError from "../utils/parseError";
import type { OrderResponse } from "../types/order.types";
import type { CartItem } from "../types/cart.types";
import type { UUID } from "../types/common.types";

export interface UseOrdersReturn {
  orders: readonly OrderResponse[];
  loading: boolean;
  error: string | null;
  fetchOrders: (userId: UUID) => Promise<void>;
  createOrder: (userId: UUID, cartItems: readonly CartItem[]) => Promise<OrderResponse | null>;
}

/**
 * Orders for the active user id (`fetchOrders` sets it). Creates use `useMutation` and invalidate the list.
 */
const useOrders = (): UseOrdersReturn => {
  const queryClient = useQueryClient();
  const [ordersUserId, setOrdersUserId] = useState<UUID | null>(null);

  const listQuery = useQuery({
    queryKey: ordersUserId ? queryKeys.orders.byUser(ordersUserId) : [...queryKeys.orders.all, "idle"],
    queryFn: () => getOrdersByUser(ordersUserId!),
    enabled: !!ordersUserId,
  });

  const createMutation = useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: UUID;
      payload: ReturnType<typeof cartToOrderRequest>;
    }) => createOrderService(userId, payload),
    onSuccess: (_order, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.byUser(userId) });
    },
  });

  const fetchOrders = useCallback(async (userId: UUID) => {
    setOrdersUserId(userId);
    await queryClient.fetchQuery({
      queryKey: queryKeys.orders.byUser(userId),
      queryFn: () => getOrdersByUser(userId),
    });
  }, [queryClient]);

  const createOrder = useCallback(
    async (userId: UUID, cartItems: readonly CartItem[]): Promise<OrderResponse | null> => {
      try {
        return await createMutation.mutateAsync({
          userId,
          payload: cartToOrderRequest(cartItems),
        });
      } catch {
        return null;
      }
    },
    [createMutation]
  );

  return useMemo(
    () => ({
      orders: listQuery.data ?? [],
      loading: listQuery.isFetching || createMutation.isPending,
      error: listQuery.isError
        ? parseError(listQuery.error)
        : createMutation.isError
          ? parseError(createMutation.error)
          : null,
      fetchOrders,
      createOrder,
    }),
    [
      listQuery.data,
      listQuery.isFetching,
      listQuery.isError,
      listQuery.error,
      createMutation.isPending,
      createMutation.isError,
      createMutation.error,
      fetchOrders,
      createOrder,
    ]
  );
};

export default useOrders;
