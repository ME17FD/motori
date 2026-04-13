/**
 * Product Card Component Type Definitions
 * Props interface for individual product card rendering.
 */

/**
 * ProductCard component props.
 * @param id - Product unique identifier
 * @param image - Product image URL
 * @param title - Product name
 * @param dimensions - Specifications/dimensions display text
 * @param price - Formatted price string
 * @param onAddToCart - Callback when Add to Cart is clicked
 */
export interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  dimensions: string;
  price: string;
  onAddToCart?: (id: string) => void;
}
