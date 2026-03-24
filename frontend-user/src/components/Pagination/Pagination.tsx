import React from "react";
import { getPageRange } from "../../utils/articleUtils";
import "../../styles/Pagination/Pagination.css";

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages   = getPageRange(currentPage, totalPages);
  const rangeStart = (currentPage - 1) * pageSize + 1;
  const rangeEnd   = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav className="pagination" aria-label="Pagination des articles">
      {/* ── Info ── */}
      <span className="pagination__info">
        {rangeStart}–{rangeEnd} sur {totalItems} articles
      </span>

      {/* ── Controls ── */}
      <div className="pagination__controls">
        {/* Prev */}
        <button
          className="pagination__btn pagination__btn--arrow"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Page précédente"
        >
          ‹
        </button>

        {/* Page numbers */}
        {pages.map((page, idx) =>
          page === -1 ? (
            // Ellipsis — use idx as key since value is always -1
            <span key={`ellipsis-${idx}`} className="pagination__ellipsis">
              …
            </span>
          ) : (
            <button
              key={page}
              className={`pagination__btn ${currentPage === page ? "pagination__btn--active" : ""}`}
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          className="pagination__btn pagination__btn--arrow"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Page suivante"
        >
          ›
        </button>
      </div>
    </nav>
  );
};

export default Pagination;