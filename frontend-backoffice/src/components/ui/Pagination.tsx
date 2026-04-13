/**
 * Pagination — page navigation component.
 *
 * Shows: Prev | 1 2 … 5 6 7 … 12 13 | Next
 * Always shows first, last, and a window of 2 around current page.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../../styles/ui/Pagination.module.css';

interface Props {
  currentPage: number;    // 0-indexed
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  /** Build the page number list with ellipsis markers (-1) */
  function buildPages(): (number | -1)[] {
    const pages: (number | -1)[] = [];
    const delta = 2;

    for (let i = 0; i < totalPages; i++) {
      if (
        i === 0 ||
        i === totalPages - 1 ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (
        pages[pages.length - 1] !== -1
      ) {
        pages.push(-1); // ellipsis marker
      }
    }
    return pages;
  }

  const pages = buildPages();

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      {/* Previous */}
      <button
        className={styles.navBtn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === -1 ? (
          <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
        ) : (
          <button
            key={p}
            className={`${styles.pageBtn} ${p === currentPage ? styles.pageBtnActive : ''}`}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p + 1}`}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p + 1}
          </button>
        )
      )}

      {/* Next */}
      <button
        className={styles.navBtn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}