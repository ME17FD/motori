import React from "react";
import { useArticles } from "../../hooks/useArticles";
import { useCart } from "../../hooks/useCart";
import ArticleFilter from "../../components/ArticleFilter/ArticleFilter";
import ProductCard from "../../components/ProductCard/ProductCard";
import Pagination from "../../components/Pagination/Pagination";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Button from "../../components/Button/Button";
import { PAGE_SIZE_OPTIONS } from "../../constants/article";
import "../../styles/ArticleFilter/ArticleFilter.css";
import "../../styles/ProductCard/ProductCard.css";
import "../../styles/Pagination/Pagination.css";
import "./ArticlesPage.css";

// ─────────────────────────────────────────────
// Skeleton card — shown while loading
// ─────────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <div className="product-card product-card--skeleton" aria-hidden="true">
    <div className="skeleton skeleton--image" />
    <div className="product-card__body">
      <div className="skeleton skeleton--line skeleton--short" />
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--line skeleton--medium" />
      <div className="skeleton skeleton--line skeleton--short" />
      <div className="skeleton skeleton--btn" />
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────

const ArticlesPage: React.FC = () => {
  const {
    articles,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    resetFilters,
    setPage,
    setPageSize,
  } = useArticles();

  const { addToCart, getQuantity } = useCart();

  // ── Delegates navbar search to article filters ──
  const handleSearchSubmit = (query: string) => {
    setFilters({ search: query });
  };

  // ── Render states ──
  const showSkeleton = loading;
  const showError    = !loading && error !== null;
  const showEmpty    = !loading && !error && articles.length === 0;
  const showGrid     = !loading && !error && articles.length > 0;

  return (
    <>
      {/* ── Navbar ── */}
      <Navbar
        categories={[]}
        onSearchSubmit={handleSearchSubmit}
      />

      <main className="articles-page">
        {/* ── Breadcrumb ── */}
        <nav className="articles-page__breadcrumb" aria-label="Fil d'Ariane">
          <a href="/" className="articles-page__breadcrumb-link">
            Accueil
          </a>
          <span className="articles-page__breadcrumb-sep">›</span>
          <span className="articles-page__breadcrumb-current">
            Nos Articles
          </span>
        </nav>

        {/* ── Header ── */}
        <header className="articles-page__header">
          <h1 className="articles-page__title">
            Nos <span>Articles</span>
          </h1>
          <p className="articles-page__subtitle">
            Équipements, consommables et accessoires pour votre moto
          </p>
        </header>

        {/* ── Filters ── */}
        <ArticleFilter
          filters={filters}
          onFilterChange={setFilters}
          onReset={resetFilters}
          totalResults={pagination.totalItems}
        />

        {/* ── Error state ── */}
        {showError && (
          <div className="articles-page__error" role="alert">
            <span className="articles-page__error-icon">⚠️</span>
            <p className="articles-page__error-message">{error}</p>
            <Button
              text="Réessayer"
              variant="primary"
              onClick={resetFilters}
              ariaLabel="Réessayer le chargement des articles"
            />
          </div>
        )}

        {/* ── Empty state ── */}
        {showEmpty && (
          <div className="articles-page__empty">
            <span className="articles-page__empty-icon">🔍</span>
            <p className="articles-page__empty-title">Aucun article trouvé</p>
            <p className="articles-page__empty-sub">
              Essayez de modifier vos filtres ou votre recherche.
            </p>
            <Button
              text="Réinitialiser les filtres"
              variant="outline"
              onClick={resetFilters}
              ariaLabel="Réinitialiser tous les filtres"
            />
          </div>
        )}

        {/* ── Grid — skeleton ── */}
        {showSkeleton && (
          <div
            className="articles-page__grid"
            aria-busy="true"
            aria-label="Chargement des articles"
          >
            {Array.from({ length: pagination.pageSize }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Grid — articles ── */}
        {showGrid && (
          <div className="articles-page__grid">
            {articles.map((article) => (
              <ProductCard
                key={article.id}
                article={article}
                onAddToCart={addToCart}
                cartQuantity={getQuantity(article.id)}
              />
            ))}
          </div>
        )}

        {/* ── Footer row : page size + pagination ── */}
        {showGrid && (
          <div className="articles-page__footer-row">
            <div className="articles-page__page-size">
              <label
                htmlFor="page-size-select"
                className="articles-page__page-size-label"
              >
                Articles par page :
              </label>
              <select
                id="page-size-select"
                className="articles-page__page-size-select"
                value={pagination.pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
              onPageChange={setPage}
            />
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <Footer />
    </>
  );
};

export default ArticlesPage;