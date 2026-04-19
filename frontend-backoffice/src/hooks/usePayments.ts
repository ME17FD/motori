import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPayments,
  fetchPayment,
  fetchPaymentsByOrder,
  fetchPendingPayments,
  validatePayment,
  rejectPayment,
} from '../services/paymentService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { PaymentFilters, ValidatePaymentRequest, RejectPaymentRequest } from '../types/payment';

/**
 * Paginated payments list with filters.
 */
export function usePayments(params: PaymentFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.payments(params),
    queryFn: () => fetchPayments(params),
  });
}

/**
 * Single payment by id.
 */
export function usePayment(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.payment(id),
    queryFn: () => fetchPayment(id),
    enabled: !!id,
  });
}

/**
 * All payments linked to a specific order.
 */
export function usePaymentsByOrder(orderId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.paymentsByOrder(orderId),
    queryFn: () => fetchPaymentsByOrder(orderId),
    enabled: !!orderId,
  });
}

/**
 * All payments awaiting manual validation.
 * Refreshes every 60s to surface new cash payments quickly.
 */
export function usePendingPayments() {
  return useQuery({
    queryKey: QUERY_KEYS.pendingPayments(),
    queryFn: fetchPendingPayments,
    refetchInterval: 60_000,
  });
}

/**
 * Validate and reject mutations.
 */
export function usePaymentMutations() {
  const qc = useQueryClient();

  const invalidate = (id?: string) => {
    qc.invalidateQueries({ queryKey: ['payments'] });
    if (id) qc.invalidateQueries({ queryKey: QUERY_KEYS.payment(id) });
  };

  const validate = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ValidatePaymentRequest }) =>
      validatePayment(id, payload),
    onSuccess: (_, { id }) => invalidate(id),
  });

  const reject = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RejectPaymentRequest }) =>
      rejectPayment(id, payload),
    onSuccess: (_, { id }) => invalidate(id),
  });

  return { validate, reject };
}