/**
 * Internal notification category — used by the notification store.
 */
export type NotificationType =
  | 'ORDER_PENDING'
  | 'PAYMENT_PENDING'
  | 'LOW_STOCK'
  | 'ORDER_CANCELLED'
  | 'NEW_USER';

/**
 * Internal backoffice notification — stored locally in Zustand.
 * Not persisted to any backend — client-side only.
 */
export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  linkTo?: string;
}