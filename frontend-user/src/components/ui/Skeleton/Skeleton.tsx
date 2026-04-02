import styles from "../../../styles/components/Skeleton.module.css";
import type { ReactElement } from "react";

export type SkeletonVariant = "card" | "line";

export interface SkeletonProps {
  /** `card` — grid of placeholder tiles; `line` — stacked bars */
  variant?: SkeletonVariant;
  /** Number of repeated skeleton blocks */
  count?: number;
}

/**
 * Placeholder shimmer for loading lists (product grid or text lines).
 */
const Skeleton = ({ variant = "card", count = 6 }: SkeletonProps): ReactElement => {
  const safeCount = Number.isFinite(count) && count > 0 ? count : 6;
  const items = Array.from({ length: safeCount });

  if (variant === "line") {
    return (
      <div className={styles.lineList} aria-hidden="true">
        {items.map((_, idx) => (
          <div key={idx} className={styles.line} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.cardGrid} aria-hidden="true">
      {items.map((_, idx) => (
        <div key={idx} className={styles.card}>
          <div className={styles.imageBlock} />
          <div className={styles.textBlock}>
            <div className={styles.lineShort} />
            <div className={styles.line} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
