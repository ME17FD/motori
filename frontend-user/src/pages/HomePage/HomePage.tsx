import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaShippingFast, FaUndo } from "react-icons/fa";
import "../../styles/components/HomePage.css";

import Navbar from "../../components/layout/Navbar/Navbar";
import ProductSlider from "../../components/product/ProductSlider/ProductSlider";
import Button from "../../components/ui/Button/Button";
import Footer from "../../components/layout/Footer/Footer";
import Skeleton from "../../components/ui/Skeleton/Skeleton";

import { HERO_IMAGES, ABOUT_DESCRIPTION, AUTOPLAY_DELAY_MS, ROUTES } from "../../constants";
import { MOCK_PRODUCTS, MOCK_BRANDS, MOCK_CATEGORIES } from "../../mocks/index";
import useCart from "../../hooks/useCart";
import useParts from "../../hooks/useParts";
import useVehicleFilter from "../../hooks/useVehicleFilter";
import { useVehicleStore } from "../../store/vehicleStore";
import type { UUID } from "../../types/common.types";
import type { Product } from "../../types";

/**
 * Full-width hero carousel with infinite-feel track, dots, progress bar, and touch swipe.
 * Lives here because it is only used on the home page layout.
 */
interface HeroImageSliderProps {
  /** Image URLs in display order */
  images: string[];
  /** Delay between autoplay transitions (ms) */
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

/** Trust signals — short, scannable, uses brand red only as accent (see `variables.css`). */
const TRUST_PILLARS: readonly { icon: React.ReactNode; title: string; text: string }[] = [
  {
    icon: <FaShieldAlt aria-hidden />,
    title: "Pièces sélectionnées",
    text: "Catalogue pensé pour la performance et la sécurité de votre moto.",
  },
  {
    icon: <FaShippingFast aria-hidden />,
    title: "Livraison soignée",
    text: "Expédition rapide et emballage adapté aux pièces fragiles.",
  },
  {
    icon: <FaUndo aria-hidden />,
    title: "Service clair",
    text: "Une expérience e-commerce moderne, sans friction inutile.",
  },
];

/**
 * Landing + storefront entry:
 * - **Hero:** premium first impression + primary CTA into the catalog.
 * - **Categories:** quick orientation into major families (uses the same mock tree as the navbar).
 * - **Featured:** real API parts when available; compatible items rise to the front if a bike is selected.
 * - **Brands:** social proof grid.
 * - **Trust:** reassurance row (delivery/quality/service).
 */
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const selectedVehicle = useVehicleStore((s) => s.selectedVehicle);
  const { compatibleParts, loading: compatLoading, error: compatError } = useVehicleFilter();
  const { parts: apiParts, loading: partsLoading, error: partsError } = useParts({
    page: 1,
    pageSize: 12,
    disableVehicleInjection: true,
  });

  const compatReady = !compatLoading && !compatError;
  const compatibleIds = useMemo(
    () => new Set(compatibleParts.map((p) => p.id)),
    [compatibleParts]
  );

  /**
   * Featured row is intentionally **API-first** (falls back to mocks if the service is down).
   * If a vehicle is selected, we sort compatible SKUs first so the “fits my bike” story is immediate.
   */
  const featuredProducts: Product[] = useMemo(() => {
    if (partsError || apiParts.length === 0) {
      return MOCK_PRODUCTS;
    }

    const list = [...apiParts];
    if (selectedVehicle && compatReady) {
      list.sort((a, b) => {
        const aOk = compatibleIds.has(a.id);
        const bOk = compatibleIds.has(b.id);
        if (aOk === bOk) return 0;
        return aOk ? -1 : 1;
      });
    }

    return list.slice(0, 12).map(
      (p): Product => ({
        id: p.id,
        image: p.image || p.imageUrl || "https://placehold.co/300x300?text=Motori",
        title: p.name,
        dimensions: p.dimensions ?? p.ref ?? "",
        price: `${p.price} DH`,
        detailHref: ROUTES.PARTDETAILS.replace(":id", p.id),
        compatibility:
          selectedVehicle && compatReady ? { isCompatible: compatibleIds.has(p.id) } : undefined,
      })
    );
  }, [apiParts, compatibleIds, compatReady, partsError, selectedVehicle]);

  const handleAddToCart = useCallback(
    (id: string) => {
      addToCart(id as UUID, 1, 0);
    },
    [addToCart]
  );

  const categoryPreview = useMemo(() => MOCK_CATEGORIES.slice(0, 6), []);

  return (
    <div className="home-page">

      <Navbar categories={MOCK_CATEGORIES} />

      {/* Hero: visual + concise value prop — overlay stays readable via gradient token combo */}
      <section className="home-page__hero" aria-label="Accueil Moto">
        <div className="home-page__hero-slider">
          <HeroImageSlider images={HERO_IMAGES} autoplayDelay={AUTOPLAY_DELAY_MS} />
        </div>
        <div className="home-page__hero-overlay">
          <div className="home-page__hero-inner section-wrapper">
            <p className="home-page__hero-kicker">Pièces de moto · Premium &amp; fluide</p>
            <h1 className="home-page__hero-title">
              Pilotez votre projet avec un catalogue pensé pour <span>votre moto</span>.
            </h1>
            <p className="home-page__hero-lead">
              {ABOUT_DESCRIPTION}
            </p>
            <div className="home-page__hero-actions">
              <Button
                text="Découvrir le catalogue"
                variant="primary"
                onClick={() => navigate(ROUTES.PARTS)}
                ariaLabel="Aller au catalogue"
              />
              <Button
                text="Compatibilité"
                variant="outline"
                onClick={() => {
                  const el = document.getElementById("featured-parts");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                ariaLabel="Voir les produits vedettes"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories: fast scanning — links reuse mock URLs (external shop paths) without changing backend */}
      <section className="home-page__section" aria-label="Catégories populaires">
        <h2 className="home-page__section-title">Explorez par catégorie</h2>
        <p className="home-page__section-subtitle">
          Moteur, freinage, transmission… retrouvez les familles les plus demandées.
        </p>
        <div className="home-page__category-grid">
          {categoryPreview.map((cat) => (
            <a key={cat.id} href={cat.href} className="home-page__category-card">
              <span className="home-page__category-label">{cat.label}</span>
              <span className="home-page__category-cta">Voir</span>
            </a>
          ))}
        </div>
      </section>

      {/* Featured: slider reuses ProductCard compatibility styling when `compatibility` is present */}
      <section className="home-page__section" id="featured-parts" aria-label="Produits vedettes">
        <h2 className="home-page__section-title">Sélection du moment</h2>
        <p className="home-page__section-subtitle">
          {selectedVehicle
            ? "Les pièces compatibles avec votre véhicule sont mises en avant automatiquement."
            : "Choisissez votre moto dans la barre du haut pour activer la compatibilité partout."}
        </p>

        {partsLoading && !partsError ? (
          <Skeleton variant="card" count={6} />
        ) : (
          <ProductSlider
            products={featuredProducts}
            autoplay
            autoplayDelay={AUTOPLAY_DELAY_MS}
            onAddToCart={handleAddToCart}
          />
        )}

        <div className="home-page__cta">
          <Button
            text="Tout voir"
            variant="primary"
            onClick={() => navigate(ROUTES.PARTS)}
            ariaLabel="Ouvrir le catalogue complet"
          />
        </div>
      </section>

      {/* Brands */}
      <section className="home-page__section" aria-label="Marques disponibles">
        <h2 className="home-page__section-title">Marques disponibles</h2>
        <p className="home-page__section-subtitle">
          Des références reconnues, présentées avec la même rigueur graphique que le reste du site.
        </p>
        <div className="home-page__brands-grid">
          {MOCK_BRANDS.map((brand) => (
            <div key={brand.name ?? brand.src} className="home-page__brand-card">
              <img
                src={brand.src}
                alt={brand.name}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="home-page__section home-page__trust" aria-label="Pourquoi nous faire confiance">
        <h2 className="home-page__section-title">Une expérience e-commerce premium</h2>
        <div className="home-page__trust-grid">
          {TRUST_PILLARS.map((pillar) => (
            <div key={pillar.title} className="home-page__trust-card">
              <div className="home-page__trust-icon">{pillar.icon}</div>
              <h3 className="home-page__trust-title">{pillar.title}</h3>
              <p className="home-page__trust-text">{pillar.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
