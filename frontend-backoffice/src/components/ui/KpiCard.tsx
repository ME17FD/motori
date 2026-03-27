/**
 * KpiCard — metric display card for the dashboard KPI row.
 *
 * Props:
 *   title    — metric label
 *   value    — numeric value
 *   format   — 'number' (default) | 'currency'
 *   accent   — left border color
 *   isLoading / isError — loading and error states
 */

import styles from '../../styles/ui/KpiCard.module.css';

type Accent = 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'gray';

interface KpiCardProps {
  title: string;
  value: number;
  format?: 'number' | 'currency';
  accent?: Accent;
  isLoading?: boolean;
  isError?: boolean;
}

/** Formats a number as MAD currency or plain integer */
function formatValue(value: number, format: 'number' | 'currency'): string {
  if (format === 'currency') {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat('fr-MA').format(value);
}

export function KpiCard({
  title,
  value,
  format = 'number',
  accent = 'blue',
  isLoading = false,
  isError = false,
}: KpiCardProps) {
  return (
    <div className={`${styles.card} ${styles[`accent_${accent}`]}`}>
      <span className={styles.title}>{title}</span>

      {isLoading ? (
        <div className={styles.skeleton} aria-label="Loading..." />
      ) : isError ? (
        <span className={styles.error}>—</span>
      ) : (
        <span className={styles.value}>{formatValue(value, format)}</span>
      )}
    </div>
  );
}