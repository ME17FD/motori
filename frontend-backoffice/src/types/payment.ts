/**
 * Payment method — cash validation is done manually by an admin.
 */
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

/**
 * Payment status lifecycle.
 * PENDING → VALIDATED or REJECTED → optionally REFUNDED.
 */
export type PaymentStatus = 'PENDING' | 'VALIDATED' | 'REJECTED' | 'REFUNDED';

/**
 * Payment entity — to be wired when payment-service is ready.
 */
export interface Payment {
  id: number;
  orderId: string;
  userId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  notes?: string;
  validatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValidatePaymentRequest {
  notes?: string;
  reference?: string;
}

export interface RejectPaymentRequest {
  notes: string;
}

/**
 * Filters for the payments list.
 * Index signature required for TanStack Query key compatibility.
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