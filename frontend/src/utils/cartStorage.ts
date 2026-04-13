import { CART_STORAGE_KEY } from "../constants/cart.constants";
import type { CartItem } from "../types/cart.types";

/** Reads and parses cart JSON from `localStorage`; returns `[]` on missing or invalid data. */
export const loadCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

/** Persists the full cart array under `CART_STORAGE_KEY`. */
export const saveCart = (items: CartItem[]): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    console.warn("Cart could not be saved to localStorage.");
  }
};

/** Removes the cart key from `localStorage`. */
export const clearCartStorage = (): void => {
  localStorage.removeItem(CART_STORAGE_KEY);
};