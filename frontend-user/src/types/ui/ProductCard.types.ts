import type { Article } from "../article";

// ─────────────────────────────────────────────
// ProductCard component props
// ─────────────────────────────────────────────

export interface ProductCardProps {
  article: Article;
  /** Receives the full Article object so the cart can store all needed data */
  onAddToCart: (article: Article) => void;
  /** Quantity of this article already in the cart — shows counter badge when > 0 */
  cartQuantity: number;
}