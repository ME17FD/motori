import { useState, useCallback, useMemo } from "react";
import { loadCart, saveCart, clearCartStorage } from "../utils/cartStorage";
import type { CartItem, UseCartReturn } from "../types/cart.types";
import type { UUID } from "../types/common.types";

// ── Hook ──────────────────────────────────────────────────────────────────────

const useCart = (): UseCartReturn => {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  // Derive a Set of IDs in sync with items —
  // O(1) lookup for isInCart and deduplication vs O(n) .some()
  const itemIdSet = useMemo(
    () => new Set(items.map((item) => item.inventoryId)),
    [items]
  );

  // ── Internal updater ───────────────────────────────────────────────────────

  const updateCart = useCallback((updater: (prev: CartItem[]) => CartItem[]) => {
    setItems((prev) => {
      const next = updater(prev);
      saveCart(next);
      return next;
    });
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const addToCart = useCallback((inventoryId: UUID, quantity: number, price: number) => {
    updateCart((prev) => {
      const existing = prev.find(item => item.inventoryId === inventoryId);
      if (existing) {
        return prev.map(item =>
          item.inventoryId === inventoryId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { inventoryId, quantity, price: Number(price) }];
      }
    });
  }, [updateCart]);

  const removeFromCart = useCallback((inventoryId: UUID) => {
    updateCart((prev) => prev.filter((item) => item.inventoryId !== inventoryId));
  }, [updateCart]);

  const clearCart = useCallback(() => {
    clearCartStorage();
    setItems([]);
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────────

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  // O(1) lookup — reads from the memoized Set
  const isInCart = useCallback(
    (inventoryId: UUID): boolean => itemIdSet.has(inventoryId),
    [itemIdSet]
  );

  return useMemo(
    () => ({ items, totalItems, totalPrice, addToCart, removeFromCart, clearCart, isInCart }),
    [items, totalItems, totalPrice, addToCart, removeFromCart, clearCart, isInCart]
  );
};

export default useCart;