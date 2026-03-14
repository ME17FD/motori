/**
 * Payment method supported by the platform.
 */
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

/**
 * Payment status lifecycle.
 */
export type PaymentStatus =
  | 'PENDING'
  | 'VALIDATED'
  | 'REJECTED'
  | 'REFUNDED';

/**
 * Payment entity linked to an order.
 */
export interface Payment {
  id: number;
  orderId: string;           // UUID
  userId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;        // manual reference or transaction id
  notes?: string;            // admin notes
  validatedBy?: string;      // admin email who validated
  createdAt: string;
  updatedAt: string;
}

/**
 * Request body for manual cash payment validation.
 */
export interface ValidatePaymentRequest {
  notes?: string;
  reference?: string;
}

/**
 * Request body for rejecting a payment.
 */
export interface RejectPaymentRequest {
  notes: string;
}

/**
 * Filters for the payments list.
 */
export interface PaymentFilters {
  page?: number;
  size?: number;
  status?: PaymentStatus | '';
  method?: PaymentMethod | '';
  userId?: number;
  orderId?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: unknown;
}