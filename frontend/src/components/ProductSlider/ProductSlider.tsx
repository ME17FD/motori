import React, { useEffect, useRef, useState } from "react";
import ProductCard from "../ProductCard/ProductCard";
import "../../styles/ProductSlider/ProductSlider.css";

interface Product {
  id: string;
  image: string;
  title: string;
  dimensions: string;
  price: string;
}

interface SliderProps {
  products: Product[];
  autoplay?: boolean;
  autoplayDelay?: number;
}

const ProductSlider: React.FC<SliderProps> = ({
  products,
  autoplay = true,
  autoplayDelay = 4000,

}) => {
    
  const [itemsPerView, setItemsPerView] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  

  // RESPONSIVE
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Infinite clone logic
  const extendedProducts = [
    ...products.slice(-itemsPerView),
    ...products,
    ...products.slice(0, itemsPerView),
  ];

  const totalSlides = Math.ceil(products.length / itemsPerView);

  useEffect(() => {
    setCurrentIndex(itemsPerView);
  }, [itemsPerView]);

  const next = () => setCurrentIndex((prev) => prev + 1);
  const prev = () => setCurrentIndex((prev) => prev - 1);

  // Infinite correction
  useEffect(() => {
    const handleTransitionEnd = () => {
      if (currentIndex >= products.length + itemsPerView) {
        setIsTransitioning(false);
        setCurrentIndex(itemsPerView);
      }
      if (currentIndex <= 0) {
        setIsTransitioning(false);
        setCurrentIndex(products.length);
      }
    };

    const track = trackRef.current;
    track?.addEventListener("transitionend", handleTransitionEnd);
    return () =>
      track?.removeEventListener("transitionend", handleTransitionEnd);
  }, [currentIndex, products.length, itemsPerView]);

  useEffect(() => {
    setIsTransitioning(true);
  }, [currentIndex]);

  // Autoplay
  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      next();
    }, autoplayDelay);

    return () => clearInterval(interval);
  }, [currentIndex]);

  // Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const diff = e.changedTouches[0].clientX - startX.current;

    if (diff > 50) prev();
    if (diff < -50) next();

    isDragging.current = false;
  };

  if (!products || products.length === 0) {
  return (
    <div className="slider-empty">
      Aucun article disponible
    </div>
  );
}

  return (
    <div className="slider-container">
      <button className="slider-arrow left" onClick={prev}>
        ‹
      </button>

      <div
        className="slider-wrapper"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={trackRef}
          className="slider-track"
          style={{
            transform: `translateX(-${(currentIndex * 100) / itemsPerView}%)`,
            transition: isTransitioning ? "transform 0.5s ease" : "none",
          }}
        >
          {extendedProducts.map((product) => (
            <div
              key={product.id}
              className="slide"
              style={{ flex: `0 0 ${100 / itemsPerView}%` }}
            >
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>

      <button className="slider-arrow right" onClick={next}>
        ›
      </button>

      {/* DOTS */}
      <div className="slider-dots">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <span
            key={index}
            className={`dot ${
              index ===
              (currentIndex - itemsPerView + totalSlides) % totalSlides
                ? "active"
                : ""
            }`}
            onClick={() =>
              setCurrentIndex(index + itemsPerView)
            }
          />
        ))}
      </div>
    </div>
  );
};

export default ProductSlider;