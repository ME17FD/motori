import { CART_CONSTANTS } from "../constants/cart.constants";
import { cartToOrderRequest } from "../utils/orderUtils";
import type { CartItem } from "../types/cart.types";
import type { OrderRequest } from "../types/order.types";


// ─── Totals ───────────────────────────────────────────────────────────────────

/** Sum of `price * quantity` for all cart lines. */
export const calcSubtotal = (items: readonly CartItem[]): number =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

/** Line total for one SKU. */
export const calcLineTotal = (price: number, quantity: number): number =>
  price * quantity;

/** Percentage discount amount from subtotal (two decimal places). */
export const calcDiscount = (subtotal: number, percentOff: number): number =>
  parseFloat(((subtotal * percentOff) / 100).toFixed(2));

/** VAT applied to the taxable amount using `CART_CONSTANTS.TAX_RATE`. */
export const calcTax = (taxable: number): number =>
  parseFloat((taxable * CART_CONSTANTS.TAX_RATE).toFixed(2));

/** Flat shipping fee unless cart is empty or over the free-shipping threshold. */
export const calcShipping = (taxable: number): number =>
  taxable === 0 || taxable >= CART_CONSTANTS.FREE_SHIPPING_THRESHOLD
    ? 0
    : CART_CONSTANTS.SHIPPING_COST;

/** Grand total after discount, tax, and shipping (two decimal places). */
export const calcTotal = (
  subtotal: number,
  discount: number,
  taxes: number,
  shipping: number
): number =>
  parseFloat((subtotal - discount + taxes + shipping).toFixed(2));

// ─── Coupon ───────────────────────────────────────────────────────────────────

/**
 * Looks up a coupon code in `VALID_COUPONS` (case-insensitive).
 * @returns `{ valid: true, percent }` or `{ valid: false, error }`
 */
export const validateCoupon = (
  code: string
): { valid: true; percent: number } | { valid: false; error: string } => {
  const percent = CART_CONSTANTS.VALID_COUPONS[code.trim().toUpperCase()];
  if (percent === undefined) {
    return { valid: false, error: "Code promo invalide ou expiré." };
  }
  return { valid: true, percent };
};

// ─── Order ────────────────────────────────────────────────────────────────────

/** Maps cart lines to the API `OrderRequest` shape via `cartToOrderRequest`. */
export const buildOrderRequest = (items: readonly CartItem[]): OrderRequest =>
  cartToOrderRequest(items);

