/**
 * Product Card Component
 * Displays a single product with image, title, dimensions, price, and "Add to Cart" button.
 * Memoized for performance in lists.
 * Includes image error handling with fallback placeholder.
 */

import React, { useCallback } from "react";
import "../../styles/ProductCard/ProductCard.css";
import type { ProductCardProps } from "../../types/ui/ProductCard.types";

/**
 * Product card with image, info, and add-to-cart action.
 * @param id - Product unique identifier
 * @param image - Product image URL
 * @param title - Product name
 * @param dimensions - Product specifications/dimensions
 * @param price - Formatted price string
 * @param onAddToCart - Callback when Add to Cart button is clicked
 */
const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({ id, image, title, dimensions, price, onAddToCart }) => {
    const handleImageError = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src =
          "https://placehold.co/300x300?text=Image+indisponible";
      },
      []
    );

    return (
      <div className="product-card">
        <div className="product-card__image-wrapper">
          <img src={image} alt={title} onError={handleImageError} />
        </div>

        <div className="product-card__info">
          <h3 className="product-card__title">{title}</h3>
          <p className="product-card__dimensions">{dimensions}</p>
          <p className="product-card__price">{price}</p>
        </div>

        <button
          className="product-card__btn"
          onClick={() => onAddToCart?.(id)}
          aria-label={`Ajouter ${title} au panier`}
        >
          + Ajouter au panier
        </button>
      </div>
    );
  }
);
ProductCard.displayName = "ProductCard";

export default ProductCard;
