export const CART_STORAGE_KEY = "cart_items" as const;
// constants/cart.constants.ts

export const CART_CONSTANTS = {

  // ─── Tax ────────────────────────────────────────────
  TAX_RATE: 0.20, // 20% TVA (Morocco standard rate)

  // ─── Shipping ────────────────────────────────────────
  FREE_SHIPPING_THRESHOLD: 500, // DH — free shipping above this
  SHIPPING_COST: 50,            // DH — flat rate below threshold

  // ─── Quantity limits ─────────────────────────────────
  MAX_QTY: 99,
  MIN_QTY: 1,

  // ─── Coupons — code: % discount ──────────────────────
  VALID_COUPONS: {
    MOTO10:  10,  // 10% off
    MOTO20:  20,  // 20% off
    WELCOME: 15,  // 15% off new users
    FLASH30: 30,  // 30% flash sale
  } as Record<string, number>,

} as const;