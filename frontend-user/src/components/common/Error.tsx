import parseError from '../../utils/parseError';
import type { ReactElement } from 'react';
import styles from './Error.module.css';

export interface ErrorProps {
  error?: unknown;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

const Error = ({ error, message, onRetry, retryLabel = 'Retry' }: ErrorProps): ReactElement => {
  const resolvedMessage = (() => {
    if (message) return message;
    if (typeof error === 'string' && error.trim() !== '') return error;
    if (error === undefined) return 'Something went wrong.';
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

