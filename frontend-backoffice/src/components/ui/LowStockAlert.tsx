import { useLowStockItems } from '../../hooks/useInventory';
import styles from '../../styles/ui/LowStockAlert.module.css';

/**
 * Dismissible banner shown when low-stock items are detected.
 * Displayed at the top of the inventory page and the dashboard.
 */
export default function LowStockAlert() {
  const { data: items = [] } = useLowStockItems();

  if (items.length === 0) return null;

  return (
    <div className={styles.banner} role="alert">
      <span className={styles.icon}>⚠</span>
      <span className={styles.text}>
        <strong>{items.length} product{items.length > 1 ? 's' : ''}</strong> below low-stock threshold —{' '}
        {items
          .slice(0, 3)
          .map((i) => i.productName ?? `#${i.productId}`)
          .join(', ')}
        {items.length > 3 && ` and ${items.length - 3} more`}
      </span>
    </div>
  );
}