import type { Product } from "../index";

export interface ProductSliderProps {
  products: Product[];
  autoplay?: boolean;
  autoplayDelay?: number;
  onAddToCart?: (id: string) => void;
}
