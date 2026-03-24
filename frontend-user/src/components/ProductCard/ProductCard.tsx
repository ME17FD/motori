import React, { useCallback } from "react";
import type { ProductCardProps } from "../../types/ui/ProductCard.types";
import { formatPrice, getStatusLabel, isOrderable } from "../../utils/articleUtils";
import "../../styles/ProductCard/ProductCard.css";

const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({ article, onAddToCart, cartQuantity }) => {

    const orderable = isOrderable(article);

    const handleImageError = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src =
          "https://placehold.co/300x300?text=Image+indisponible";
      },
      []
    );

    const buttonText = !orderable
      ? "Rupture de stock"
      : cartQuantity > 0
      ? `+ Ajouter (${cartQuantity})`
      : "+ Ajouter au panier";

    return (
      <div className="product-card">
        {/* ── Image ── */}
        <div className="product-card__image-wrapper">
          <img
            src={article.imageUrl}
            alt={article.name}
            onError={handleImageError}
            loading="lazy"
          />
          {/* Category badge */}
          <span className="product-card__category-badge">
            {article.category}
          </span>
          {/* Cart quantity indicator */}
          {cartQuantity > 0 && (
            <span
              className="product-card__cart-count"
              aria-label={`${cartQuantity} dans le panier`}
            >
              {cartQuantity}
            </span>
          )}
        </div>

        {/* ── Info ── */}
        <div className="product-card__info">
          <span className="product-card__brand">{article.brand}</span>
          <h3 className="product-card__title">{article.name}</h3>
          <p className="product-card__dimensions">{article.description}</p>
          {/* Status badge — class-based, no inline style */}
          <span className={`product-card__status product-card__status--${article.status}`}>
            {getStatusLabel(article.status)}
          </span>
          <p className="product-card__price">{formatPrice(article.price)}</p>
        </div>

        {/* ── Button ── */}
        <button
          className={`product-card__btn${!orderable ? " product-card__btn--disabled" : ""}`}
          onClick={() => orderable && onAddToCart(article)}
          disabled={!orderable}
          aria-label={
            orderable
              ? `Ajouter ${article.name} au panier`
              : `${article.name} est en rupture de stock`
          }
        >
          {buttonText}
        </button>
      </div>
    );
  }
);

ProductCard.displayName = "ProductCard";
export default ProductCard;