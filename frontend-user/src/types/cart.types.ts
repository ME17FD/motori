import type { UUID } from "./common.types";

export interface CartItem {
  readonly inventoryId: UUID;
  readonly quantity: number;
  readonly price: number; // Unit price at the time of adding to cart
}

export interface UseCartReturn {
  items: CartItem[];
  totalItems: number;
  addToCart: (inventoryId: UUID, quantity: number, price: number) => void;
  removeFromCart: (inventoryId: UUID) => void;
  clearCart: () => void;
  isInCart: (inventoryId: UUID) => boolean;
}

export interface CartItemDisplay {
  inventoryId: UUID; // ✅ FIX: was number
  quantity: number;
  price: number;
  name: string;
  image: string;
  stock: number;
}