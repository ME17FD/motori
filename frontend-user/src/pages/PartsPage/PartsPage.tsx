import React, { useCallback, useState } from "react";
import styles from "./PartsPage.module.css";
import useParts  from "../../hooks/useParts";
import useVehicleFilter from "../../hooks/useVehicleFilter";
import  { buildCleanParams }  from "../../utils/buildParams";
import ProductCard from "../../components/ProductCard/ProductCard";
import Button from "../../components/Button/Button";
import Loading from "../../components/common/Loading";
import Error from "../../components/common/Error";
import Footer from "../../components/Footer/Footer";
import Navbar from "../../components/Navbar/Navbar";
import Header from "../../components/Header/Header";
import { MOCK_CATEGORIES } from "../../mocks/categories.mock";

type SortOption = "price_asc" | "price_desc" | "name_asc" | "name_desc" | "newest";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest",     label: "Newest"              },
  { value: "price_asc",  label: "Prix : croissant"    },
  { value: "price_desc", label: "Prix : décroissant"  },
  { value: "name_asc",   label: "Nom : A → Z"         },
  { value: "name_desc",  label: "Nom : Z → A"         },
];

const PAGE_SIZE = 12;

const PartsPage: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [sort,   setSort]   = useState<SortOption>("newest");
  const [page,   setPage]   = useState<number>(1);
  const [year, setYear] = useState<string | null>(null);
  const [make, setMake] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const years: string[] = ["2020", "2021", "2022"];
  const makes: string[] = ["Toyota", "Honda", "Ford"];
  const models: string[] = ["Model A", "Model B", "Model C"];

  const {
    selectedVehicleId, compatibleParts
  } = useVehicleFilter();

  const params = buildCleanParams({
    search,
    sort,
    page,
    pageSize: PAGE_SIZE,
    vehicleId: selectedVehicleId,
    compatibleParts: compatibleParts.length > 0 ? compatibleParts.map((p) => p.id) : undefined,
  });

  const { parts,totalPages,loading, error } = useParts(params);

  const total = Math.ceil((totalPages ?? 0) / PAGE_SIZE);
  const hasActiveFilters = Boolean( selectedVehicleId || compatibleParts.length > 0 || search);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleSort = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as SortOption);
    setPage(1);
  }, []);

  const clearVehicle = useCallback(() => {
    setYear(null);
    setMake(null);
    setModel(null);
  }, []);

  // Build ellipsis-collapsed page number list
  const pageList = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
    .reduce<(number | "…")[]>((acc, n, idx, arr) => {
      if (idx > 0 && (n as number) - (arr[idx - 1] as number) > 1) acc.push("…");
      acc.push(n);
      return acc;
    }, []);

  return (
    <><main className={styles.page} aria-label="Catalogue pièces">

          {/* ── Header ── */}
          <Navbar categories={MOCK_CATEGORIES} />
          <Header eyebrow="Catalogue" title="Catalogue de pièces" count={total} />

          {/* ── Controls ── */}
          <section className={styles.controls} aria-label="Filtres et recherche">

              {/* Search */}
              <div className={styles.searchWrap}>
                  <svg className={styles.searchIcon} viewBox="0 0 20 20" aria-hidden="true">
                      <circle cx="8.5" cy="8.5" r="5.5" strokeWidth="1.8" />
                      <line x1="12.5" y1="12.5" x2="17" y2="17" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <input
                      type="search"
                      className={styles.searchInput}
                      placeholder="Rechercher une pièce…"
                      value={search}
                      onChange={handleSearch}
                      aria-label="Rechercher une pièce" />
              </div>

              {/* Vehicle filters */}
              <div className={styles.filterGroup} role="group" aria-label="Filtres véhicule">
                  <select
                      className={styles.select}
                      value={year ?? ""}
                      onChange={(e) => { setYear(e.target.value || null); setPage(1); } }
                      aria-label="Filtrer par année"
                  >
                      <option value="">Année</option>
                      {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>

                  <select
                      className={styles.select}
                      value={make ?? ""}
                      onChange={(e) => { setMake(e.target.value || null); setPage(1); } }
                      aria-label="Filtrer par marque"
                  >
                      <option value="">Marque</option>
                      {makes.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>

                  <select
                      className={styles.select}
                      value={model ?? ""}
                      onChange={(e) => { setModel(e.target.value || null); setPage(1); } }
                      aria-label="Filtrer par modèle"
                      disabled={!make}
                  >
                      <option value="">Modèle</option>
                      {models.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
              </div>

              {/* Sort */}
              <div className={styles.sortWrap}>
                  <label htmlFor="parts-sort" className={styles.sortLabel}>Trier par</label>
                  <select
                      id="parts-sort"
                      className={`${styles.select} ${styles.sortSelect}`}
                      value={sort}
                      onChange={handleSort}
                  >
                      {SORT_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                  </select>
              </div>

              {/* Reset — uses your Button component */}
              {hasActiveFilters && (
                  <Button
                      text="Réinitialiser"
                      variant="secondary"
                      onClick={clearVehicle}
                      ariaLabel="Réinitialiser les filtres" />
              )}
          </section>

          {/* ── Content ── */}
          <section className={styles.content}>

              {loading && (
                  <div className={styles.stateWrap} aria-live="polite" aria-busy="true">
                      <Loading />
                  </div>
              )}

              {error && !loading && (
                  <div className={styles.stateWrap}>
                      <Error message={error} />
                  </div>
              )}

              {!loading && !error && parts.length === 0 && (
                  <div className={styles.empty} role="status">
                      <p className={styles.emptyText}>Aucun article trouvé.</p>
                      <Button
                          text="Effacer les filtres"
                          variant="secondary"
                          onClick={clearVehicle}
                          ariaLabel="Effacer les filtres" />
                  </div>
              )}

              {!loading && !error && parts.length > 0 && (
                  <>
                      {/* Grid — ProductCard expects: id, image, title, dimensions, price, onAddToCart */}
                      <ul className={styles.grid} role="list">
                          {parts.map((part) => (
                              <li key={part.id} className={styles.gridItem}>
                                  <ProductCard
                                      id={part.id}
                                      image={part.image}
                                      title={part.name}
                                      dimensions={part.dimensions ?? ""}
                                      price={`${part.price} DH`}
                                      onAddToCart={(id) => console.log("add to cart", id)} // wire to useCart
                                  />
                                  {/* Stock badge overlaid via CSS on the card wrapper */}
                                  {part.stock === 0 && (
                                      <span className={styles.badgeOut} aria-label="Rupture de stock">
                                          Rupture
                                      </span>
                                  )}
                                  {part.stock > 0 && part.stock <= 5 && (
                                      <span className={styles.badgeLow} aria-label="Stock limité">
                                          Stock limité
                                      </span>
                                  )}
                              </li>
                          ))}
                      </ul>

                      {/* Pagination */}
                      {totalPages > 1 && (
                          <nav className={styles.pagination} aria-label="Pagination">
                              <button
                                  className={styles.pageBtn}
                                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                                  disabled={page === 1}
                                  aria-label="Page précédente"
                              >
                                  ←
                              </button>

                              <div className={styles.pageNumbers}>
                                  {pageList.map((n, i) => n === "…" ? (
                                      <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
                                  ) : (
                                      <button
                                          key={n}
                                          className={`${styles.pageNumber} ${n === page ? styles.active : ""}`}
                                          onClick={() => setPage(n as number)}
                                          aria-label={`Page ${n}`}
                                          aria-current={n === page ? "page" : undefined}
                                      >
                                          {n}
                                      </button>
                                  )
                                  )}
                              </div>

                              <button
                                  className={styles.pageBtn}
                                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                  disabled={page === totalPages}
                                  aria-label="Page suivante"
                              >
                                  →
                              </button>
                          </nav>
                      )}
                  </>
              )}
          </section>
      </main><Footer /></>
  );
};

export default PartsPage;
