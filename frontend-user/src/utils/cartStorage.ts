import { CART_STORAGE_KEY } from "../constants/cart.constants";
import type { CartItem } from "../types/cart.types";

export const loadCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export const saveCart = (items: CartItem[]): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    console.warn("Cart could not be saved to localStorage.");
  }
};

export const clearCartStorage = (): void => {
  localStorage.removeItem(CART_STORAGE_KEY);
};