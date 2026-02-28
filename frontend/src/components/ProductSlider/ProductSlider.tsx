import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import "../../styles/ProductSlider/ProductSlider.css";
import ProductCard from "../ProductCard/ProductCard";
import type { ProductSliderProps } from "./ProductSlider.types";
import type { Product } from "../../types";

const ProductSlider: React.FC<ProductSliderProps> = React.memo(
  ({ products, autoplay = true, autoplayDelay = 4000, onAddToCart }) => {
    const [itemsPerView, setItemsPerView] = useState<number>(3);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isAnimating, setIsAnimating]   = useState<boolean>(false);
    const [isPaused, setIsPaused]         = useState<boolean>(false);

    const trackRef    = useRef<HTMLDivElement>(null);
    const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const touchStartX = useRef<number>(0);
    const touchStartY = useRef<number>(0);
    const isSwiping   = useRef<boolean>(false);

    // ── Responsive ────────────────────────────────────────────────────────────
    useEffect(() => {
      const update = (): void => {
        if      (window.innerWidth < 640)  setItemsPerView(1);
        else if (window.innerWidth < 1024) setItemsPerView(2);
        else                               setItemsPerView(3);
      };
      update();
      const observer = new ResizeObserver(update);
      observer.observe(document.body);
      return () => observer.disconnect();
    }, []);

    const totalSlides = useMemo<number>(
      () => Math.ceil(products.length / itemsPerView),
      [products.length, itemsPerView]
    );

    // Clone-pad for infinite loop
    const extendedProducts = useMemo<Product[]>(
      () => [
        ...products.slice(-itemsPerView),
        ...products,
        ...products.slice(0, itemsPerView),
      ],
      [products, itemsPerView]
    );

    const showControls = products.length > itemsPerView;

    useEffect(() => {
      setCurrentIndex(itemsPerView);
      setIsAnimating(false);
    }, [itemsPerView]);

    // ── Navigation ────────────────────────────────────────────────────────────
    const goNext = useCallback((): void => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex((p) => p + 1);
    }, [isAnimating]);

    const goPrev = useCallback((): void => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex((p) => p - 1);
    }, [isAnimating]);

    const goToSlide = useCallback((index: number): void => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex(index + itemsPerView);
    }, [isAnimating, itemsPerView]);

    const handleTransitionEnd = useCallback((): void => {
      setIsAnimating(false);
      const track = trackRef.current;
      if (!track) return;
      if (currentIndex >= products.length + itemsPerView) {
        track.style.transition = "none";
        setCurrentIndex(itemsPerView);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => { track.style.transition = ""; })
        );
      }
      if (currentIndex <= 0) {
        track.style.transition = "none";
        setCurrentIndex(products.length);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => { track.style.transition = ""; })
        );
      }
    }, [currentIndex, products.length, itemsPerView]);

    // ── Autoplay ──────────────────────────────────────────────────────────────
    useEffect(() => {
      if (!autoplay || !showControls || isPaused) {
        if (autoplayRef.current) clearInterval(autoplayRef.current);
        return;
      }
      autoplayRef.current = setInterval(goNext, autoplayDelay);
      return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
    }, [autoplay, autoplayDelay, goNext, showControls, isPaused]);

    // ── Touch ─────────────────────────────────────────────────────────────────
    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>): void => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      isSwiping.current   = false;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>): void => {
      const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
      const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
      if (dx > dy && dx > 5) isSwiping.current = true;
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>): void => {
      if (!isSwiping.current) return;
      const diff = e.changedTouches[0].clientX - touchStartX.current;
      if (diff > 50)       goPrev();
      else if (diff < -50) goNext();
      isSwiping.current = false;
    }, [goNext, goPrev]);

    // ── Active dot ────────────────────────────────────────────────────────────
    const activeDot = useMemo<number>(() => {
      const normalized = currentIndex - itemsPerView;
      return ((normalized % totalSlides) + totalSlides) % totalSlides;
    }, [currentIndex, itemsPerView, totalSlides]);

    if (!products || products.length === 0) return null;

    const translateX = (currentIndex * 100) / itemsPerView;

    return (
      <div
        className="product-slider"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {showControls && (
          <button
            className="product-slider__arrow product-slider__arrow--left"
            onClick={goPrev}
            aria-label="Produits précédents"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        <div
          className="product-slider__viewport"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={trackRef}
            className="product-slider__track"
            style={{
              transform: `translate3d(-${translateX}%, 0, 0)`,
              transition: isAnimating
                ? "transform 0.52s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                : "none",
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extendedProducts.map((product, idx) => (
              <div
                key={`${product.id}-${idx}`}
                className="product-slider__slide"
                style={{ width: `${100 / itemsPerView}%` }}
              >
                <ProductCard {...product} onAddToCart={onAddToCart} />
              </div>
            ))}
          </div>
        </div>

        {showControls && (
          <button
            className="product-slider__arrow product-slider__arrow--right"
            onClick={goNext}
            aria-label="Produits suivants"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        {showControls && (
          <div className="product-slider__dots" role="tablist">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === activeDot}
                aria-label={`Page ${i + 1}`}
                className={`product-slider__dot${i === activeDot ? " product-slider__dot--active" : ""}`}
                onClick={() => goToSlide(i * itemsPerView)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);
ProductSlider.displayName = "ProductSlider";

export default ProductSlider;
