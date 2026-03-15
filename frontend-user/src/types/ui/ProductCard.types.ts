export interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  dimensions: string;
  price: string;
  onAddToCart?: (id: string) => void;
}
