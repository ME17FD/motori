import { CART_CONSTANTS } from "../constants/cart.constants";
import { cartToOrderRequest } from "../utils/orderUtils";
import type { CartItem } from "../types/cart.types";
import type { OrderRequest } from "../types/order.types";


// ─── Totals ───────────────────────────────────────────────────────────────────
export const calcSubtotal = (items: readonly CartItem[]): number =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const calcLineTotal = (price: number, quantity: number): number =>
  price * quantity;

export const calcDiscount = (subtotal: number, percentOff: number): number =>
  parseFloat(((subtotal * percentOff) / 100).toFixed(2));

export const calcTax = (taxable: number): number =>
  parseFloat((taxable * CART_CONSTANTS.TAX_RATE).toFixed(2));

export const calcShipping = (taxable: number): number =>
  taxable === 0 || taxable >= CART_CONSTANTS.FREE_SHIPPING_THRESHOLD
    ? 0
    : CART_CONSTANTS.SHIPPING_COST;

export const calcTotal = (
  subtotal: number,
  discount: number,
  taxes: number,
  shipping: number
): number =>
  parseFloat((subtotal - discount + taxes + shipping).toFixed(2));

// ─── Coupon ───────────────────────────────────────────────────────────────────

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

export const buildOrderRequest = (items: readonly CartItem[]): OrderRequest =>
  cartToOrderRequest(items);

