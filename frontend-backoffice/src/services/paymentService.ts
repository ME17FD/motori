/**
 * Payment Service
 * API client for payment queries, validation, and rejection.
 * Handles cash payment validation workflow and payment audit trails.
 */

import axiosInstance from '../api/axiosInstance';
import type {
  Payment,
  PaymentFilters,
  ValidatePaymentRequest,
  RejectPaymentRequest,
} from '../types/payment';
import type { PageResponse } from '../types/api';

const BASE = '/api/payments';

/**
 * GET /api/payments — paginated + filtered list.
 */
export async function fetchPayments(
  params: PaymentFilters = {},
): Promise<PageResponse<Payment>> {
  const { data } = await axiosInstance.get<PageResponse<Payment>>(BASE, { params });
  return data;
}

/**
 * GET /api/payments/:id
 */
export async function fetchPayment(id: number): Promise<Payment> {
  const { data } = await axiosInstance.get<Payment>(`${BASE}/${id}`);
  return data;
}

/**
 * GET /api/payments/order/:orderId
 * Returns all payments linked to a specific order.
 */
export async function fetchPaymentsByOrder(orderId: string): Promise<Payment[]> {
  const { data } = await axiosInstance.get<Payment[]>(`${BASE}/order/${orderId}`);
  return data;
}

/**
 * GET /api/payments/pending
 * Returns all payments awaiting manual admin validation.
 */
export async function fetchPendingPayments(): Promise<Payment[]> {
  const { data } = await axiosInstance.get<Payment[]>(`${BASE}/pending`);
  return data;
}

/**
 * PATCH /api/payments/:id/validate
 * Manually validates a cash payment.
 */
export async function validatePayment(
  id: number,
  payload: ValidatePaymentRequest,
): Promise<Payment> {
  const { data } = await axiosInstance.patch<Payment>(
    `${BASE}/${id}/validate`,
    payload,
  );
  return data;
}

/**
 * PATCH /api/payments/:id/reject
 * Rejects a payment with a mandatory reason.
 */
export async function rejectPayment(
  id: number,
  payload: RejectPaymentRequest,
): Promise<Payment> {
  const { data } = await axiosInstance.patch<Payment>(
    `${BASE}/${id}/reject`,
    payload,
  );
  return data;
}