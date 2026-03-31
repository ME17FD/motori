import styles from './Loading.module.css';
import type { ReactElement } from 'react';

export interface LoadingProps {
  label?: string;
}

const Loading = ({ label = 'Loading...' }: LoadingProps): ReactElement => {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.text}>{label}</span>
    </div>
  );
};

export default Loading;

