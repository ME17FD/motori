import styles from "../../../styles/components/Loading.module.css";
import type { ReactElement } from "react";

export interface LoadingProps {
  /** Accessible status text (default: “Loading…”) */
  label?: string;
}

/**
 * Inline loading indicator: spinner plus optional label for `role="status"`.
 */
const Loading = ({ label = "Loading..." }: LoadingProps): ReactElement => {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.text}>{label}</span>
    </div>
  );
};

export default Loading;
