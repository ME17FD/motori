import React, { useState, useCallback, useMemo } from "react";
import styles from "../../styles/components/Equipmentdetailspage.module.css";
import { Link, useParams } from "react-router-dom";
import useEquipments from "../../hooks/useEquipments";
import useCart from "../../hooks/useCart";
import useParts from "../../hooks/useParts";
import useVehicleFilter from "../../hooks/useVehicleFilter";
import type { UUID } from "../../types/common.types";
import Navbar from "../../components/layout/Navbar/Navbar";
import Footer from "../../components/layout/Footer/Footer";
import Button from "../../components/ui/Button/Button";
import Loading from "../../components/ui/Loading/Loading";
import Error from "../../components/ui/Error/Error";
import ProductCard from "../../components/product/ProductCard/ProductCard";
import { MOCK_CATEGORIES } from "../../mocks/categories.mock";
import { useVehicleStore } from "../../store/vehicleStore";
import { isProductCompatible } from "../../utils/compatibility/isProductCompatible";
import { ROUTES } from "../../constants/routes";

// ─── Mock reviews (replace with useReviews hook if available) ─────────────────
interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

const MOCK_REVIEWS: Review[] = [
  { id: 1, author: "Karim B.",   rating: 5, date: "2024-11-10", comment: "Équipement conforme, livraison rapide. Parfait !" },
  { id: 2, author: "Yassine M.", rating: 4, date: "2024-10-22", comment: "Bonne qualité, montage facile. Je recommande."    },
  { id: 3, author: "Hamza R.",   rating: 3, date: "2024-09-05", comment: "Correct mais l'emballage était un peu abîmé."     },
];

// ─── StarRating ───────────────────────────────────────────────────────────────
const StarRating: React.FC<{ value: number; max?: number }> = ({ value, max = 5 }) => (
  <span className={styles.stars} aria-label={`${value} sur ${max} étoiles`}>
    {Array.from({ length: max }, (_, i) => (
      <span key={i} className={i < value ? styles.starFilled : styles.starEmpty}>
        ★
      </span>
    ))}
  </span>
);

/**
 * Single-equipment PDP: gallery, pricing, quantity, cart add, compatibility check, related parts, mock reviews.
 */
const EquipmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // ── Data ──
  const { equipements, loading, error } = useEquipments();
  const { addToCart }                 = useCart();
  const { parts }                     = useParts();
  const { compatibleParts, loading: compatLoading, error: compatError } = useVehicleFilter();
  const selectedVehicle = useVehicleStore((s) => s.selectedVehicle);

  const compatibleEquipmentIdsSet = React.useMemo(
    () => new Set(compatibleParts.map((p) => p.id)),
    [compatibleParts]
  );

  const compatReady = !compatLoading && !compatError;
  const compatibilityCtx = selectedVehicle
    ? {
        ...selectedVehicle,
        compatiblePartIds: compatReady ? compatibleEquipmentIdsSet : undefined,
        assumeAllCompatible: false,
      }
    : null;

  const isCompatible = equipements && selectedVehicle
    ? isProductCompatible(equipements[0], compatibilityCtx)
    : null;

  const compatState = compatLoading
    ? "loading"
    : isCompatible === true
      ? "ok"
      : isCompatible === false
        ? "no"
        : "unknown";

  /** Optional upsell: show a few other equipment known-compatible with the same bike (excludes current SKU). */
  const similarCompatibleEquipment = useMemo(() => {
    if (!equipements || !selectedVehicle || !compatReady || isCompatible !== false) return [];
    return compatibleParts.filter((p) => p.id !== equipements[0].id).slice(0, 4);
  }, [compatibleParts, compatReady, isCompatible, equipements, selectedVehicle]);

  // ── Gallery ──
  const [activeImg, setActiveImg] = useState<number>(0);

  // ── Quantity ──
  const [qty, setQty] = useState<number>(1);

  // ── Add to cart ──
  const handleAddToCart = useCallback(() => {
    if (!equipements) return;
    addToCart(equipements[0].id, qty, equipements[0].price);
  }, [equipements, qty, addToCart]);

  // ── Average rating ──
  const avgRating =
    MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / MOCK_REVIEWS.length;

  // ── Images fallback ──
  const images: string[] = equipements?.[0]?.imageUrl
    ? [equipements[0].imageUrl]
    : ["https://placehold.co/600x600?text=Image+indisponible"];

  // ─────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <>
        <Navbar categories={MOCK_CATEGORIES} />
        <div className={styles.statePage}><Loading /></div>
        <Footer />
      </>
    );
  }

  if (error || !equipements) {
    return (
      <>
        <Navbar categories={MOCK_CATEGORIES} />
        <div className={styles.statePage}>
          <Error message={error ?? "Équipement introuvable."} />
        </div>
        <Footer />
      </>
    );
  }

  const inStock  = equipements[0].stock > 0;
  const lowStock = inStock && equipements[0].stock <= 5;
  const maxQty   = Math.min(equipements[0].stock, 99);

  return (
    <>
      <Navbar categories={MOCK_CATEGORIES} />

      <main className={styles.page} aria-label={`Détails de l'équipement : ${equipements[0].name}`}>

        {/* ── Breadcrumb ── */}
        <nav className={styles.breadcrumb} aria-label="Fil d'Ariane">
          <Link to={ROUTES.HOME}      className={styles.breadcrumbLink}>Accueil</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link to={ROUTES.EQUIPMENT} className={styles.breadcrumbLink}>Équipements</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{equipements[0].name}</span>
        </nav>

        {/* ══ Top section ══ */}
        <div className={styles.topGrid}>

          {/* ── Gallery ── */}
          <section className={styles.gallery} aria-label="Galerie d'images">
            <div className={styles.galleryMain}>
              <img
                src={images[activeImg]}
                alt={`${equipements[0].name} — vue ${activeImg + 1}`}
                className={styles.galleryMainImg}
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/600x600?text=Image+indisponible";
                }}
              />
              {!inStock && (
                <span className={styles.overlayBadge} aria-label="Rupture de stock">
                  Rupture de stock
                </span>
              )}
              {lowStock && (
                <span className={styles.overlayBadgeLow} aria-label="Stock limité">
                  Stock limité : {equipements[0].stock} restant{equipements[0].stock > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className={styles.galleryThumbs} role="list" aria-label="Miniatures">
                {images.map((src, i) => (
                  <button
                    key={i}
                    role="listitem"
                    className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ""}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`Vue ${i + 1}`}
                    aria-pressed={i === activeImg}
                  >
                    <img
                      src={src}
                      alt={`${equipements[0].name} miniature ${i + 1}`}
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/100x100?text=N/A";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* ── Info panel ── */}
          <section className={styles.info} aria-label="Informations produit">

            {/* SKU / ref */}
            {equipements[0].reference && (
              <p className={styles.sku}>Réf. <span>{equipements[0].reference}</span></p>
            )}

            <h1 className={styles.partName}>{equipements[0].name}</h1>

            {/* Rating summary */}
            <div className={styles.ratingRow}>
              <StarRating value={Math.round(avgRating)} />
              <span className={styles.ratingCount}>({MOCK_REVIEWS.length} avis)</span>
            </div>

            {/* Price */}
            <div className={styles.priceRow}>
              <span className={styles.price}>{equipements[0].price} DH</span>
            </div>

            {/* Stock status */}
            <div className={styles.stockRow}>
              <span className={inStock ? styles.stockIn : styles.stockOut}>
                {inStock ? "● En stock" : "● Rupture de stock"}
              </span>
              {lowStock && (
                <span className={styles.stockLow}>
                  — seulement {equipements[0].stock} restant{equipements[0].stock > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Compatibility */}
            {selectedVehicle ? (
              <div className={styles.compatBlock}>
                <h2 className={styles.compatHeading}>Compatibilité</h2>
                <p className={styles.compatHint}>
                  Basée sur la moto sélectionnée dans la barre de navigation (API compatibilités).
                </p>
                <div
                  className={[
                    styles.compatBanner,
                    compatState === "loading" || compatState === "unknown"
                      ? styles.compatBannerLoading
                      : compatState === "ok"
                        ? styles.compatBannerOk
                        : styles.compatBannerNo,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  role="status"
                  aria-live="polite"
                >
                  {compatState === "loading"
                    ? "Vérification de compatibilité…"
                    : compatState === "ok"
                      ? "Compatible avec votre véhicule"
                      : compatState === "no"
                        ? "Cet équipement n'est pas compatible avec votre véhicule"
                        : "Compatibilité indisponible"}
                </div>
              </div>
            ) : null}

            {/* Short description */}
            {equipements[0].description && (
              <p className={styles.description}>{equipements[0].description}</p>
            )}

            {/* Quantity + Add to cart */}
            {inStock && (
              <div className={styles.purchaseRow}>
                <div className={styles.qtyControl} role="group" aria-label="Quantité">
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    aria-label="Diminuer la quantité"
                  >
                    −
                  </button>
                  <span className={styles.qtyValue} aria-live="polite">{qty}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    disabled={qty >= maxQty}
                    aria-label="Augmenter la quantité"
                  >
                    +
                  </button>
                </div>

                <Button
                  text="Ajouter au panier"
                  variant="primary"
                  size="full"
                  onClick={handleAddToCart}
                  ariaLabel="Ajouter au panier"
                />
              </div>
            )}

            {!inStock && (
              <p className={styles.outOfStockMsg}>
                Cet article est actuellement indisponible.
              </p>
            )}

            <hr className={styles.divider} />

            {/* Specs table */}
            {equipements[0].properties && Object.keys(equipements[0].properties).length > 0 && (
              <div className={styles.specsBlock}>
                <h2 className={styles.sectionTitle}>Spécifications</h2>
                <table className={styles.specsTable}>
                  <tbody>
                    {Object.entries(equipements[0].properties).map(([key, val]) => (
                      <tr key={key} className={styles.specsRow}>
                        <th className={styles.specsKey}>{key}</th>
                        <td className={styles.specsVal}>{String(val)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* ══ Bottom section ══ */}
        <div className={styles.bottomGrid}>

          {/* ── Related parts ── */}
          {parts && parts.length > 0 && (
            <section className={styles.equipSection} aria-label="Pièces associées">
              <h2 className={styles.sectionTitle}>Pièces associées</h2>
              <ul className={styles.equipList} role="list">
                {parts.slice(0, 4).map((part: any) => (
                  <li key={part.id} className={styles.equipItem}>
                    <img
                      src={part.image || "https://placehold.co/80x80?text=N/A"}
                      alt={part.name}
                      className={styles.equipImg}
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/80x80?text=N/A";
                      }}
                    />
                    <div className={styles.equipInfo}>
                      <p className={styles.equipName}>{part.name}</p>
                      <p className={styles.equipPrice}>{part.price} DH</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* ── Similar compatible equipment (only when current SKU is a mismatch) ── */}
        {similarCompatibleEquipment.length > 0 ? (
          <section className={styles.similarSection} aria-label="Équipements compatibles suggérés">
            <h2 className={styles.sectionTitle}>Équipements compatibles avec votre moto</h2>
            <p className={styles.similarLead}>
              Voici quelques références qui correspondent à votre véhicule sélectionné.
            </p>
            <ul className={styles.similarGrid} role="list">
              {similarCompatibleEquipment.map((e) => (
                <li key={e.id} className={styles.similarItem}>
                  <ProductCard
                    id={e.id}
                    image={e.image}
                    title={e.name}
                    dimensions={e.dimensions ?? e.ref ?? ""}
                    price={`${e.price} DH`}
                    detailHref={ROUTES.EQUIPDETAILS.replace(":id", e.id)}
                    compatibility={{ isCompatible: true }}
                    onAddToCart={() => addToCart(e.id as UUID, 1, e.price)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ── Reviews ── */}
        <section className={styles.reviewsSection} aria-label="Avis clients">
          <div className={styles.reviewsHeader}>
            <h2 className={styles.sectionTitle}>Avis clients</h2>
            <div className={styles.reviewsSummary}>
              <span className={styles.reviewsAvg}>{avgRating.toFixed(1)}</span>
              <StarRating value={Math.round(avgRating)} />
              <span className={styles.ratingCount}>({MOCK_REVIEWS.length} avis)</span>
            </div>
          </div>

          <ul className={styles.reviewList} role="list">
            {MOCK_REVIEWS.map((r) => (
              <li key={r.id} className={styles.reviewCard}>
                <div className={styles.reviewTop}>
                  <span className={styles.reviewAuthor}>{r.author}</span>
                  <StarRating value={r.rating} />
                  <time className={styles.reviewDate} dateTime={r.date}>
                    {new Date(r.date).toLocaleDateString("fr-MA", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </time>
                </div>
                <p className={styles.reviewComment}>{r.comment}</p>
              </li>
            ))}
          </ul>
        </section>

      </main>

      <Footer />
    </>
  );
};

export default EquipmentDetailsPage;