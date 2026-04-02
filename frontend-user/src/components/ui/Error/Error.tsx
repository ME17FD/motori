import parseError from "../../../utils/parseError";
import type { ReactElement } from "react";
import styles from "../../../styles/components/Error.module.css";

export interface ErrorProps {
  /** Raw error (axios, Error, string, etc.) — parsed when `message` is not set */
  error?: unknown;
  /** Fixed message; takes precedence over `error` */
  message?: string;
  /** Optional retry action (shows a button) */
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Inline error panel: resolves a user-facing string from `message` or `parseError(error)`.
 */
const Error = ({ error, message, onRetry, retryLabel = "Retry" }: ErrorProps): ReactElement => {
  const resolvedMessage = (() => {
    if (message) return message;
    if (typeof error === "string" && error.trim() !== "") return error;
    if (error === undefined) return "Something went wrong.";
    return parseError(error);
  })();

  return (
    <div className={styles.wrap} role="alert">
      <p className={styles.message}>{resolvedMessage}</p>
      {onRetry ? (
        <button type="button" className={styles.retryButton} onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
};

export default Error;
