import styles from '../../styles/ui/KpiCard.module.css';

interface KpiCardProps {
  label: string;
  value: string | number;
  /** Optional colored left border accent — CSS color string */
  accent?: string;
  /** Optional sublabel shown below the value */
  sublabel?: string;
  loading?: boolean;
}

/**
 * Single KPI metric card used in the dashboard header row.
 */
export default function KpiCard({
  label,
  value,
  accent,
  sublabel,
  loading = false,
}: KpiCardProps) {
  return (
    <div
      className={styles.card}
      style={accent ? { borderLeftColor: accent } : undefined}
    >
      <span className={styles.label}>{label}</span>
      {loading ? (
        <span className={styles.skeleton} aria-busy="true" />
      ) : (
        <span className={styles.value}>{value}</span>
      )}
      {sublabel && !loading && (
        <span className={styles.sublabel}>{sublabel}</span>
      )}
    </div>
  );
}