import React, { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "../../styles/components/EquipmentPage.module.css";
import useEquipments from "../../hooks/useEquipments";
import useVehicleFilter from "../../hooks/useVehicleFilter";
import useCart from "../../hooks/useCart";
import { buildCleanParams } from "../../utils/buildParams";
import ProductCard from "../../components/product/ProductCard/ProductCard";
import Button from "../../components/ui/Button/Button";
import Error from "../../components/ui/Error/Error";
import Skeleton from "../../components/ui/Skeleton/Skeleton";
import Footer from "../../components/layout/Footer/Footer";
import Navbar from "../../components/layout/Navbar/Navbar";
import Header from "../../components/layout/Header/Header";
import { MOCK_CATEGORIES } from "../../mocks/categories.mock";
import { useVehicleStore } from "../../store/vehicleStore";
import { isProductCompatible } from "../../utils/compatibility/isProductCompatible";
import { ROUTES } from "../../constants/routes";
import type { UUID } from "../../types/common.types";

type SortOption = "price_asc" | "price_desc" | "name_asc" | "name_desc" | "newest";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest",     label: "Newest"             },
  { value: "price_asc",  label: "Prix : croissant"   },
  { value: "price_desc", label: "Prix : décroissant" },
  { value: "name_asc",   label: "Nom : A → Z"        },
  { value: "name_desc",  label: "Nom : Z → A"        },
];

const PAGE_SIZE = 12;

/**
 * Equipment catalog: search, sort, vehicle filter (compatible equipment), grid with stock badges, pagination.
 */
const EquipmentPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  /** URL is the source of truth — matches Navbar navigation (`?q=`) without `useEffect` sync. */
  const search = (searchParams.get("q") ?? "").trim();
  const [sort,  setSort]  = useState<SortOption>("newest");
  const [page,  setPage]  = useState<number>(1);
  const [year,  setYear]  = useState<string | null>(null);
  const [make,  setMake]  = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [showOnlyCompatible, setShowOnlyCompatible] = useState<boolean>(true);
  const years:  string[] = ["2020", "2021", "2022"];
  const makes:  string[] = ["Toyota", "Honda", "Ford"];
  const models: string[] = ["Model A", "Model B", "Model C"];

  const { selectedVehicleId, compatibleParts, loading: compatLoading, error: compatError } =
    useVehicleFilter();
  const selectedVehicle = useVehicleStore((s) => s.selectedVehicle);
  const { addToCart } = useCart();

  const compatibleEquipmentIdsSet = useMemo(
    () => new Set(compatibleParts.map((p) => p.id)),
    [compatibleParts]
  );

  const compatReady = !compatLoading && !compatError;
  const compatibilityCtx = selectedVehicle
    ? {
        ...selectedVehicle,
        compatiblePartIds: compatReady ? compatibleEquipmentIdsSet : undefined,
        assumeAllCompatible: showOnlyCompatible,
      }
    : null;

  const params = useMemo(
    () =>
      buildCleanParams({
        search,
        sort,
        page,
        pageSize: PAGE_SIZE,
        vehicleId: showOnlyCompatible ? selectedVehicleId : undefined,
        disableVehicleInjection: !showOnlyCompatible,
      }),
    [search, sort, page, selectedVehicleId, showOnlyCompatible]
  );

  const { equipements, totalPages, loading, error } = useEquipments(params);

  const equipmentsForDisplay = useMemo(() => {
    let list = [...equipements];

    // Strict filtering when toggle is ON (client-side enforcement for UX correctness).
    if (showOnlyCompatible && selectedVehicleId && compatReady) {
      list = list.filter((e) => compatibleEquipmentIdsSet.has(e.id));
    }

    // Prioritize compatible equipment visually when showing all.
    if (!showOnlyCompatible && selectedVehicleId && compatReady) {
      list.sort((a, b) => {
        const aOk = compatibleEquipmentIdsSet.has(a.id);
        const bOk = compatibleEquipmentIdsSet.has(b.id);
        if (aOk === bOk) return 0;
        return aOk ? -1 : 1;
      });
    }

    return list;
  }, [
    equipements,
    showOnlyCompatible,
    selectedVehicleId,
    compatReady,
    compatibleEquipmentIdsSet,
  ]);

  const total = Math.ceil((totalPages ?? 0) / PAGE_SIZE);
  const hasActiveFilters = Boolean(search || !showOnlyCompatible);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      const next = new URLSearchParams(searchParams);
      if (v.trim()) next.set("q", v.trim());
      else next.delete("q");
      setSearchParams(next, { replace: true });
      setPage(1);
    },
    [searchParams, setSearchParams]
  );

  const handleSort = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as SortOption);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setYear(null);
    setMake(null);
    setModel(null);
    setSearchParams({}, { replace: true });
    setSort("newest");
    setShowOnlyCompatible(true);
    setPage(1);
  }, [setSearchParams]);

  // Build ellipsis-collapsed page number list
  const pageList = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
    .reduce<(number | "…")[]>((acc, n, idx, arr) => {
      if (idx > 0 && (n as number) - (arr[idx - 1] as number) > 1) acc.push("…");
      acc.push(n);
      return acc;
    }, []);

  return (
    <>
      <main className={styles.page} aria-label="Catalogue équipements">

        {/* ── Header ── */}
        <Navbar categories={MOCK_CATEGORIES} />
        <Header eyebrow="Catalogue" title="Catalogue d'équipements" count={total} />

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
              placeholder="Rechercher un équipement…"
              value={search}
              onChange={handleSearch}
              aria-label="Rechercher un équipement"
            />
          </div>

          {/* Vehicle filters */}
          <div className={styles.filterGroup} role="group" aria-label="Filtres véhicule">
            <select
              className={styles.select}
              value={year ?? ""}
              onChange={(e) => { setYear(e.target.value || null); setPage(1); }}
              aria-label="Filtrer par année"
            >
              <option value="">Année</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>

            <select
              className={styles.select}
              value={make ?? ""}
              onChange={(e) => { setMake(e.target.value || null); setPage(1); }}
              aria-label="Filtrer par marque"
            >
              <option value="">Marque</option>
              {makes.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>

            <select
              className={styles.select}
              value={model ?? ""}
              onChange={(e) => { setModel(e.target.value || null); setPage(1); }}
              aria-label="Filtrer par modèle"
              disabled={!make}
            >
              <option value="">Modèle</option>
              {models.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div className={styles.sortWrap}>
            <label htmlFor="equipment-sort" className={styles.sortLabel}>Trier par</label>
            <select
              id="equipment-sort"
              className={`${styles.select} ${styles.sortSelect}`}
              value={sort}
              onChange={handleSort}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Compatibility filter toggle */}
          <div className={styles.compatToggleWrap} role="group" aria-label="Filtre compatibilité">
            <label className={styles.compatToggle}>
              <input
                type="checkbox"
                checked={showOnlyCompatible}
                disabled={!selectedVehicleId}
                onChange={(e) => {
                  setShowOnlyCompatible(e.target.checked);
                  setPage(1);
                }}
              />
              <span>Afficher uniquement les équipements compatibles</span>
            </label>
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <Button
              text="Réinitialiser"
              variant="secondary"
              onClick={clearFilters}
              ariaLabel="Réinitialiser les filtres"
            />
          )}
        </section>

        {/* ── Content ── */}
        <section className={styles.content}>

          {loading && (
            <div className={styles.skeletonWrap} aria-live="polite" aria-busy="true">
              <Skeleton variant="card" count={PAGE_SIZE} />
            </div>
          )}

          {error && !loading && (
            <div className={styles.stateWrap}>
              <Error message={error} />
            </div>
          )}

          {!loading && !error && equipmentsForDisplay.length === 0 && (
            <div className={styles.empty} role="status">
              <p className={styles.emptyText}>Aucun équipement trouvé.</p>
              <Button
                text="Effacer les filtres"
                variant="secondary"
                onClick={clearFilters}
                ariaLabel="Effacer les filtres"
              />
            </div>
          )}

          {!loading && !error && equipmentsForDisplay.length > 0 && (
            <>
              {/* Grid */}
              <ul className={styles.grid} role="list">
                {equipmentsForDisplay.map((equipment) => (
                  <li key={equipment.id} className={styles.gridItem}>
                    <ProductCard
                      id={equipment.id}
                      image={equipment.imageUrl}
                      title={equipment.name}
                      dimensions={equipment.size ?? equipment.reference ?? ""}
                      price={`${equipment.price} DH`}
                      detailHref={ROUTES.EQUIPDETAILS.replace(":id", equipment.id)}
                      onAddToCart={() => addToCart(equipment.id as UUID, 1, equipment.price)}
                      compatibility={
                        selectedVehicleId
                          ? (() => {
                              const compatible = isProductCompatible(equipment, compatibilityCtx);
                              return compatible === null
                                ? undefined
                                : { isCompatible: compatible };
                            })()
                          : undefined
                      }
                    />
                    {equipment.stock === 0 && (
                      <span className={styles.badgeOut} aria-label="Rupture de stock">
                        Rupture
                      </span>
                    )}
                    {equipment.stock > 0 && equipment.stock <= 5 && (
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
                    {pageList.map((n, i) =>
                      n === "…" ? (
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
      </main>
      <Footer />
    </>
  );
};

export default EquipmentPage;