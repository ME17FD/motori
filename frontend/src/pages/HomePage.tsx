import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import "./HomePage.css";

import Navbar         from "../components/Navbar/Navbar";
import ProductSlider  from "../components/ProductSlider/ProductSlider";
import Button         from "../components/Button/Button";

import { HERO_IMAGES, ABOUT_DESCRIPTION, FOOTER_LINKS, AUTOPLAY_DELAY_MS } from "../constants/index";
import { MOCK_PRODUCTS, MOCK_BRANDS, MOCK_CATEGORIES }                       from "../mocks/index";
import { addToCart }                                                          from "../services/index";

// ─── HeroImageSlider ──────────────────────────────────────────────────────────
// Kept in this file as it is tightly coupled to the hero section layout.
// Extract to components/HeroSlider/ only if reused elsewhere.

interface HeroImageSliderProps {
  images: string[];
  autoplayDelay?: number;
}

const HeroImageSlider: React.FC<HeroImageSliderProps> = React.memo(
  ({ images, autoplayDelay = AUTOPLAY_DELAY_MS }) => {
    const [currentIndex, setCurrentIndex]       = useState(0);
    const [trackIndex, setTrackIndex]           = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isPaused, setIsPaused]               = useState(false);

    const autoplayRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
    const transitionLock = useRef(false);
    const touchStartX    = useRef(0);
    const touchStartY    = useRef(0);
    const isSwiping      = useRef(false);

    const extendedImages = useMemo(
      () => (images.length <= 1 ? images : [images[images.length - 1], ...images, images[0]]),
      [images]
    );

    useEffect(() => {
  const id = setTimeout(() => {
    setTrackIndex(1);
  }, 0);
  return () => clearTimeout(id);
}, [images]);

    const goNext = useCallback(() => {
      if (transitionLock.current || images.length <= 1) return;
      transitionLock.current = true;
      setIsTransitioning(true);
      setTrackIndex((p) => p + 1);
      setCurrentIndex((p) => (p + 1) % images.length);
    }, [images.length]);

    const goPrev = useCallback(() => {
      if (transitionLock.current || images.length <= 1) return;
      transitionLock.current = true;
      setIsTransitioning(true);
      setTrackIndex((p) => p - 1);
      setCurrentIndex((p) => (p - 1 + images.length) % images.length);
    }, [images.length]);

    const goToSlide = useCallback((index: number) => {
      if (transitionLock.current || index === currentIndex) return;
      transitionLock.current = true;
      setIsTransitioning(true);
      setTrackIndex(index + 1);
      setCurrentIndex(index);
    }, [currentIndex]);

    const handleTransitionEnd = useCallback(() => {
      setIsTransitioning(false);
      transitionLock.current = false;
      if (trackIndex >= extendedImages.length - 1) setTrackIndex(1);
      else if (trackIndex <= 0)                    setTrackIndex(extendedImages.length - 2);
    }, [trackIndex, extendedImages.length]);

    useEffect(() => {
      if (isPaused || images.length <= 1) return;
      autoplayRef.current = setTimeout(goNext, autoplayDelay);
      return () => { if (autoplayRef.current) clearTimeout(autoplayRef.current); };
    }, [currentIndex, isPaused, goNext, autoplayDelay, images.length]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      isSwiping.current   = false;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
      const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
      if (dx > dy && dx > 8) isSwiping.current = true;
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
      if (!isSwiping.current) return;
      const diff = e.changedTouches[0].clientX - touchStartX.current;
      if (diff > 50) goPrev(); else if (diff < -50) goNext();
      isSwiping.current = false;
    }, [goNext, goPrev]);

    if (!images.length) return null;

    const showControls = images.length > 1;

    return (
      <div
        className="his-root"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="his-track-wrapper"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="his-track"
            style={{
              transform:  `translate3d(-${trackIndex * 100}%, 0, 0)`,
              transition: isTransitioning ? "transform 0.65s cubic-bezier(0.77,0,0.175,1)" : "none",
              width: `${extendedImages.length * 100}%`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extendedImages.map((src, idx) => (
              <div key={idx} className="his-slide" style={{ width: `${100 / extendedImages.length}%` }}>
                <img
                  src={src}
                  alt={`Hero slide ${idx + 1}`}
                  className="his-image"
                  draggable={false}
                  loading={idx === 1 ? "eager" : "lazy"}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="his-gradient" />

        {showControls && (
          <div className="his-dots" role="tablist">
            {images.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === currentIndex}
                aria-label={`Slide ${i + 1}`}
                className={`his-dot${i === currentIndex ? " his-dot--active" : ""}`}
                onClick={() => goToSlide(i)}
              />
            ))}
          </div>
        )}

        {showControls && (
          <div className="his-progress">
            <div
              key={`${currentIndex}-${isPaused}`}
              className={`his-progress-bar${isPaused ? " his-progress-bar--paused" : ""}`}
              style={{ animationDuration: `${autoplayDelay}ms` }}
            />
          </div>
        )}
      </div>
    );
  }
);
HeroImageSlider.displayName = "HeroImageSlider";

// ─── HomePage ─────────────────────────────────────────────────────────────────

const HomePage: React.FC = () => {
  const handleAddToCart = useCallback(async (id: string) => {
    await addToCart(id);
  }, []);

  const handleSeeMore = useCallback(() => {
    window.location.href = "/shop";
  }, []);

  const handleSearch = useCallback((query: string) => {
    window.location.href = `/shop?q=${encodeURIComponent(query)}`;
  }, []);

  return (
    <div className="home-page">

      {/* ── Navigation ── */}
      <Navbar categories={MOCK_CATEGORIES} onSearchSubmit={handleSearch} />

      {/* ── Hero ── */}
      <section className="home-page__hero">
        <HeroImageSlider images={HERO_IMAGES} autoplayDelay={AUTOPLAY_DELAY_MS} />
      </section>

      {/* ── Products ── */}
      <section className="home-page__section">
        <h2 className="home-page__section-title">Nos Articles</h2>
        <ProductSlider
          products={MOCK_PRODUCTS}
          autoplay
          autoplayDelay={AUTOPLAY_DELAY_MS}
          onAddToCart={handleAddToCart}
        />
        <div className="home-page__cta">
          <Button text="Afficher plus" variant="primary" onClick={handleSeeMore} />
        </div>
      </section>

      {/* ── About ── */}
      <section className="home-page__section home-page__about">
        <h2 className="home-page__section-title">À Propos de nous</h2>
        <div className="home-page__about-content">
          <p className="home-page__about-text">{ABOUT_DESCRIPTION}</p>
          <div className="home-page__about-image">
            <img
              src="/assets/wheel.png"
              alt="Roue moto"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = "none"; }}
            />
          </div>
        </div>
      </section>

      {/* ── Brands ── */}
      <section className="home-page__section">
        <h2 className="home-page__section-title">Marques de motos disponibles</h2>
        <div className="home-page__brands-grid">
          {MOCK_BRANDS.map((brand) => (
            <div key={brand.name} className="home-page__brand-card">
              <img
                src={brand.src}
                alt={brand.name}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="home-page__section" style={{ backgroundColor: "#111111" }}>
        <nav style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "16px" }}>
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Assistant, sans-serif", fontSize: "14px", textDecoration: "none" }}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", fontFamily: "Assistant, sans-serif", fontSize: "13px", margin: 0 }}>
          &copy; {new Date().getFullYear()} MotoShop. Tous droits réservés.
        </p>
      </footer>

    </div>
  );
};

export default HomePage;
