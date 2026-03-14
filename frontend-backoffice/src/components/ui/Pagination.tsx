import styles from '../../styles/ui/Pagination.module.css';

interface PaginationProps {
  page: number;           // 0-based (Spring Boot convention)
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

/**
 * Pagination controls compatible with Spring Boot's 0-based page index.
 */
export default function Pagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className={styles.wrapper}>
      <span className={styles.info}>
        {from}–{to} of {totalElements}
      </span>
      <div className={styles.controls}>
        <button
          className={styles.btn}
          onClick={() => onPageChange(0)}
          disabled={page === 0}
          type="button"
          aria-label="First page"
        >
          «
        </button>
        <button
          className={styles.btn}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          type="button"
          aria-label="Previous page"
        >
          ‹
        </button>
        <span className={styles.current}>
          {page + 1} / {totalPages}
        </span>
        <button
          className={styles.btn}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          type="button"
          aria-label="Next page"
        >
          ›
        </button>
        <button
          className={styles.btn}
          onClick={() => onPageChange(totalPages - 1)}
          disabled={page >= totalPages - 1}
          type="button"
          aria-label="Last page"
        >
          »
        </button>
      </div>
    </div>
  );
}