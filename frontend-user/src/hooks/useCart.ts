import { useState, useCallback } from "react";
import type { Article, CartItem, CartState } from "../types/article";

// ─────────────────────────────────────────────
// Return type
// ─────────────────────────────────────────────

interface UseCartReturn {
  /** Full cart state */
  cart: CartState;
  /** Add one unit of an article, or increment if already in cart */
  addToCart: (article: Article) => void;
  /** Remove one unit of an article, remove entry if quantity reaches 0 */
  removeFromCart: (articleId: string) => void;
  /** Remove an article entirely regardless of quantity */
  removeAllOfItem: (articleId: string) => void;
  /** Empty the cart */
  clearCart: () => void;
  /** Whether a given article is already in the cart */
  isInCart: (articleId: string) => boolean;
  /** Quantity of a specific article currently in the cart */
  getQuantity: (articleId: string) => number;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Recomputes totalCount and totalPrice from the items array */
const computeTotals = (
  items: CartItem[]
): Pick<CartState, "totalCount" | "totalPrice"> => ({
  totalCount: items.reduce((sum, item) => sum + item.quantity, 0),
  totalPrice: items.reduce((sum, item) => sum + item.article.price * item.quantity, 0),
});

const EMPTY_CART: CartState = {
  items:      [],
  totalCount: 0,
  totalPrice: 0,
};

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export const useCart = (): UseCartReturn => {
  const [cart, setCart] = useState<CartState>(EMPTY_CART);

  // ── Handlers ──────────────────────────────

  /** Add one unit of an article to the cart */
  const addToCart = useCallback((article: Article) => {
    setCart((prev) => {
      const existing = prev.items.find((i) => i.article.id === article.id);

      const updatedItems: CartItem[] = existing
        ? prev.items.map((i) =>
            i.article.id === article.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...prev.items, { article, quantity: 1 }];

      return { items: updatedItems, ...computeTotals(updatedItems) };
    });
  }, []);

  /** Decrement quantity by 1 — removes entry if quantity reaches 0 */
  const removeFromCart = useCallback((articleId: string) => {
    setCart((prev) => {
      const updatedItems: CartItem[] = prev.items
        .map((i) =>
          i.article.id === articleId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0);

      return { items: updatedItems, ...computeTotals(updatedItems) };
    });
  }, []);

  /** Remove an article entirely from the cart */
  const removeAllOfItem = useCallback((articleId: string) => {
    setCart((prev) => {
      const updatedItems = prev.items.filter((i) => i.article.id !== articleId);
      return { items: updatedItems, ...computeTotals(updatedItems) };
    });
  }, []);

  /** Clear all items from the cart */
  const clearCart = useCallback(() => {
    setCart(EMPTY_CART);
  }, []);

  /** Returns true if the article is already in the cart */
  const isInCart = useCallback(
    (articleId: string): boolean =>
      cart.items.some((i) => i.article.id === articleId),
    [cart.items]
  );

  /** Returns the current quantity of an article in the cart (0 if absent) */
  const getQuantity = useCallback(
    (articleId: string): number =>
      cart.items.find((i) => i.article.id === articleId)?.quantity ?? 0,
    [cart.items]
  );

  return {
    cart,
    addToCart,
    removeFromCart,
    removeAllOfItem,
    clearCart,
    isInCart,
    getQuantity,
  };
};