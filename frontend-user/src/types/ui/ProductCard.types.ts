export interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  dimensions: string;
  price: string;
  /**
   * When set, the main visual/body of the card links to this route (e.g. part detail).
   * The add-to-cart button stays a separate control so buying stays one click.
   */
  detailHref?: string;
  onAddToCart?: (id: string) => void;
  /**
   * Optional compatibility UI for the currently selected vehicle.
   * When omitted, the card behaves like the old implementation.
   */
  compatibility?: {
    readonly isCompatible: boolean;
  };
}
