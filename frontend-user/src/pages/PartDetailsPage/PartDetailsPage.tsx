import React, { useState, useCallback } from "react";
import styles from "./PartDetailsPage.module.css";
import { useParams } from "react-router-dom";
import usePart from "../../hooks/usePart";
import useCart  from "../../hooks/useCart";
import  useEquipments  from "../../hooks/useEquipments";
import type { EquipementResponse } from "../../types/equipement.types";
import type { UUID } from "../../types/common.types";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Button from "../../components/Button/Button";
import Loading from "../../components/common/Loading";
import Error from "../../components/common/Error";
import { MOCK_CATEGORIES } from "../../mocks/categories.mock";

// ─── Mock reviews (replace with useReviews hook if available) ─────────────────
interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

const MOCK_REVIEWS: Review[] = [
  { id: 1, author: "Karim B.", rating: 5, date: "2024-11-10", comment: "Pièce conforme, livraison rapide. Parfait !" },
  { id: 2, author: "Yassine M.", rating: 4, date: "2024-10-22", comment: "Bonne qualité, montage facile. Je recommande." },
  { id: 3, author: "Hamza R.", rating: 3, date: "2024-09-05", comment: "Correct mais l'emballage était un peu abîmé." },
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

// ─── PartDetailsPage ──────────────────────────────────────────────────────────
const PartDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // ── Data ──
  const { part, loading, error } = usePart(id ? (id as UUID) : null);
  const { addToCart }            = useCart();
  const { equipements }           = useEquipments();

  // ── Gallery ──
  const [activeImg, setActiveImg] = useState<number>(0);

  // ── Quantity ──
  const [qty, setQty] = useState<number>(1);

  // ── Add to cart ──
  const handleAddToCart = useCallback(() => {
    if (!part) return;
    addToCart(part.id, qty);
  }, [part, qty, addToCart]);

  // ── Average rating ──
  const avgRating =
    MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / MOCK_REVIEWS.length;

  // ── Images fallback ──
  const images: string[] = part?.image ? [part.image] : ["https://placehold.co/600x600?text=Image+indisponible"];

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

  if (error || !part) {
    return (
      <>
        <Navbar categories={MOCK_CATEGORIES} />
        <div className={styles.statePage}>
          <Error message={error ?? "Pièce introuvable."} />
        </div>
        <Footer />
      </>
    );
  }

  const inStock     = part.stock > 0;
  const lowStock    = inStock && part.stock <= 5;
  const maxQty      = Math.min(part.stock, 99);

  return (
    <>
      <Navbar categories={MOCK_CATEGORIES} />

      <main className={styles.page} aria-label={`Détails de la pièce : ${part.name}`}>

        {/* ── Breadcrumb ── */}
        <nav className={styles.breadcrumb} aria-label="Fil d'Ariane">
          <a href="/" className={styles.breadcrumbLink}>Accueil</a>
          <span className={styles.breadcrumbSep}>/</span>
          <a href="/parts" className={styles.breadcrumbLink}>Pièces</a>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{part.name}</span>
        </nav>

        {/* ══ Top section ══ */}
        <div className={styles.topGrid}>

          {/* ── Gallery ── */}
          <section className={styles.gallery} aria-label="Galerie d'images">
            <div className={styles.galleryMain}>
              <img
                src={images[activeImg]}
                alt={`${part.name} — vue ${activeImg + 1}`}
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
                  Stock limité : {part.stock} restant{part.stock > 1 ? "s" : ""}
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
                      alt={`${part.name} miniature ${i + 1}`}
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
            {part.ref && (
              <p className={styles.sku}>Réf. <span>{part.ref}</span></p>
            )}

            <h1 className={styles.partName}>{part.name}</h1>

            {/* Rating summary */}
            <div className={styles.ratingRow}>
              <StarRating value={Math.round(avgRating)} />
              <span className={styles.ratingCount}>({MOCK_REVIEWS.length} avis)</span>
            </div>

            {/* Price */}
            <div className={styles.priceRow}>
              <span className={styles.price}>{part.price} DH</span>
            </div>

            {/* Stock status */}
            <div className={styles.stockRow}>
              <span className={inStock ? styles.stockIn : styles.stockOut}>
                {inStock ? "● En stock" : "● Rupture de stock"}
              </span>
              {lowStock && (
                <span className={styles.stockLow}>
                  — seulement {part.stock} restant{part.stock > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Short description */}
            {part.description && (
              <p className={styles.description}>{part.description}</p>
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

            {/* Divider */}
            <hr className={styles.divider} />

            {/* Specs table */}
            {part.properties && Object.keys(part.properties).length > 0 && (
              <div className={styles.specsBlock}>
                <h2 className={styles.sectionTitle}>Spécifications</h2>
                <table className={styles.specsTable}>
                  <tbody>
                    {Object.entries(part.properties).map(([key, val]) => (
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

          {/* ── Equipments (related) ── */}
          {equipements && equipements.length > 0 && (
            <section className={styles.equipSection} aria-label="Équipements associés">
              <h2 className={styles.sectionTitle}>Équipements associés</h2>
              <ul className={styles.equipList} role="list">
                {equipements.slice(0, 4).map((eq: EquipementResponse) => (
                  <li key={eq.id} className={styles.equipItem}>
                    <img
                      src={eq.imageUrl || "https://placehold.co/80x80?text=N/A"}
                      alt={eq.name}
                      className={styles.equipImg}
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/80x80?text=N/A";
                      }}
                    />
                    <div className={styles.equipInfo}>
                      <p className={styles.equipName}>{eq.name}</p>
                      <p className={styles.equipPrice}>{eq.price} DH</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

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

export default PartDetailsPage;