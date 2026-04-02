import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import "../../../styles/components/ProductCard.css";
import type { ProductCardProps } from "../../../types/ui/ProductCard.types";

/**
 * Product tile: image, title, dimensions line, price, and add-to-cart control.
 *
 * @param props - Product fields plus optional `onAddToCart(id)` when the CTA is used
 */
const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({
    id,
    image,
    title,
    dimensions,
    price,
    onAddToCart,
    compatibility,
    detailHref,
  }) => {
    const handleImageError = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src =
          "https://placehold.co/300x300?text=Image+indisponible";
      },
      []
    );

    const isCompatible = compatibility?.isCompatible;
    const compatStatus = isCompatible === undefined ? null : isCompatible ? "compatible" : "not-compatible";

    const body = (
      <>
        <div className="product-card__image-wrapper">
          <img src={image} alt={title} onError={handleImageError} />
        </div>

        <div className="product-card__info">
          <h3 className="product-card__title">{title}</h3>
          <p className="product-card__dimensions">{dimensions}</p>
          <p className="product-card__price">{price}</p>
        </div>
      </>
    );

    return (
      <div
        className={[
          "product-card",
          compatStatus === "compatible" ? "product-card--compatible" : "",
          compatStatus === "not-compatible" ? "product-card--not-compatible" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {compatStatus ? (
          <span
            className={[
              "product-card__compat-badge",
              compatStatus === "compatible"
                ? "product-card__compat-badge--ok"
                : "product-card__compat-badge--no",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {compatStatus === "compatible" ? "Compatible" : "Non compatible"}
          </span>
        ) : null}

        {detailHref ? (
          <Link to={detailHref} className="product-card__main-link">
            {body}
          </Link>
        ) : (
          body
        )}

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
