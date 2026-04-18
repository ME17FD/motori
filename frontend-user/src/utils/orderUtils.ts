// Isolated mapping util — converts cart items to an OrderRequest.
// Extracted from the service so:
// 1. The service stays a pure API layer
// 2. This is unit-testable without importing axios
// 3. Consumers never build the payload shape manually

// utils/orderUtils.ts
import type { CartItem } from "../types/cart.types";
import type { OrderRequest } from "../types/order.types";

// ─── Existing ────────────────────────────────────────────────────────────────
export const cartToOrderRequest = (items: readonly CartItem[]): OrderRequest => ({
  items: items.map(({ inventoryId }) => ({ inventoryId })),
});

// ─── Cart calculation helpers ─────────────────────────────────────────────────
export const orderUtils = {
  calcSubtotal: (items: readonly CartItem[]): number =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),

  calcLineTotal: (price: number, quantity: number): string =>
    (price * quantity).toFixed(2),

  calcDiscount: (subtotal: number, percentOff: number): number =>
    parseFloat(((subtotal * percentOff) / 100).toFixed(2)),

  calcTax: (taxable: number, rate: number): number =>
    parseFloat((taxable * rate).toFixed(2)),

  calcShipping: (taxable: number, freeThreshold: number, shippingCost = 50): number =>
    taxable === 0 || taxable >= freeThreshold ? 0 : shippingCost,
} as const;