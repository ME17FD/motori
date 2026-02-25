import React from "react";
import Button from "../Button/Button";
import "../../styles/ProductCard/ProductCard.css";

interface ProductCardProps {
  image: string;
  title: string;
  dimensions: string;
  price: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  image,
  title,
  dimensions,
  price,
}) => {
  return (
    <div className="product-card">
      <div className="image-wrapper">
        <img src={image} alt={title} />
      </div>

      <div className="product-info">
        <h3 className="product-title">{title}</h3>
        <p className="product-dimensions">{dimensions}</p>
        <p className="product-price">{price}</p>
      </div>

      <Button text="+ Ajouter au panier" />
    </div>
  );
};

export default ProductCard;