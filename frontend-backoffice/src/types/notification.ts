/**
 * Internal notification category.
 */
export type NotificationType =
  | 'ORDER_PENDING'
  | 'PAYMENT_PENDING'
  | 'LOW_STOCK'
  | 'ORDER_CANCELLED'
  | 'NEW_USER';

/**
 * Internal backoffice notification.
 */
export interface AppNotification {
  id: string;               // local UUID
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;        // ISO datetime
  linkTo?: string;          // route to navigate on click
}