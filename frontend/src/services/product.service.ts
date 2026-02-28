import type { Product } from "../types";
import { MOCK_PRODUCTS } from "../mocks";

/**
 * Fetch featured products for the home page.
 * Swap the mock return for a real fetch() call when the API is ready.
 *
 * @example
 *   const products = await getProducts();
 */
export async function getProducts(): Promise<Product[]> {
  // TODO: replace with real endpoint
  // const res = await fetch("/api/products?featured=true");
  // if (!res.ok) throw new Error("Failed to fetch products");
  // return res.json();
  return Promise.resolve(MOCK_PRODUCTS);
}
