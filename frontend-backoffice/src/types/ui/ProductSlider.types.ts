/**
 * Product Slider / Carousel Component Type Definitions
 * Props interface for the product carousel component.
 */

import type { Product } from "../index";

/**
 * ProductSlider component props.
 * @param products - Array of products to display in carousel
 * @param autoplay - Enable automatic slide rotation
 * @param autoplayDelay - Milliseconds between auto-advance slides
 * @param onAddToCart - Callback when Add to Cart is clicked on a product
 */
export interface ProductSliderProps {
  products: Product[];
  autoplay?: boolean;
  autoplayDelay?: number;
  onAddToCart?: (id: string) => void;
}
