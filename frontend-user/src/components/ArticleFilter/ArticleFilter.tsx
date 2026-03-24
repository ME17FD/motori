import React, { useCallback } from "react";
import type { ArticleFilters } from "../../types/article";
import {
  ARTICLE_CATEGORIES,
  ARTICLE_BRANDS,
  SORT_OPTIONS,
} from "../../constants/article";
import "../../styles/ArticleFilter/ArticleFilter.css";

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface ArticleFilterProps {
  filters: ArticleFilters;
  onFilterChange: (partial: Partial<ArticleFilters>) => void;
  onReset: () => void;
  totalResults: number;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

const ArticleFilter: React.FC<ArticleFilterProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalResults,
}) => {
  const hasActiveFilters =
    filters.search   !== "" ||
    filters.category !== "" ||
    filters.brand    !== "" ||
    filters.status   !== "all";

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange({ search: e.target.value });
    },
    [onFilterChange]
  );

  const handleSelect = useCallback(
    (key: keyof ArticleFilters) =>
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({ [key]: e.target.value } as Partial<ArticleFilters>);
      },
    [onFilterChange]
  );

  return (
    <div className="article-filter">
      {/* ── Search ── */}
      <div className="article-filter__search">
        <svg
          className="article-filter__search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Rechercher un article..."
          value={filters.search}
          onChange={handleSearch}
          className="article-filter__search-input"
          aria-label="Rechercher un article"
        />
        {filters.search && (
          <button
            className="article-filter__search-clear"
            onClick={() => onFilterChange({ search: "" })}
            aria-label="Effacer la recherche"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Selects row ── */}
      <div className="article-filter__selects">
        {/* Category */}
        <select
          value={filters.category}
          onChange={handleSelect("category")}
          className="article-filter__select"
          aria-label="Filtrer par catégorie"
        >
          <option value="">Toutes les catégories</option>
          {ARTICLE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Brand */}
        <select
          value={filters.brand}
          onChange={handleSelect("brand")}
          className="article-filter__select"
          aria-label="Filtrer par marque"
        >
          <option value="">Toutes les marques</option>
          {ARTICLE_BRANDS.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status}
          onChange={handleSelect("status")}
          className="article-filter__select"
          aria-label="Filtrer par disponibilité"
        >
          <option value="all">Disponibilité</option>
          <option value="in_stock">En stock</option>
          <option value="low_stock">Stock limité</option>
          <option value="out_of_stock">Rupture</option>
        </select>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={handleSelect("sortBy")}
          className="article-filter__select"
          aria-label="Trier les articles"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Footer row: results count + reset ── */}
      <div className="article-filter__footer">
        <span className="article-filter__count">
          {totalResults} article{totalResults !== 1 ? "s" : ""} trouvé
          {totalResults !== 1 ? "s" : ""}
        </span>

        {hasActiveFilters && (
          <button
            className="article-filter__reset"
            onClick={onReset}
            aria-label="Réinitialiser les filtres"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>
    </div>
  );
};

export default ArticleFilter;