/**
 * Generic Catalog Table Component
 * Reusable data table for displaying and managing catalog entities.
 * Supports templated columns with custom rendering, loading states,
 * and edit/delete action handlers.
 */

import styles from '../../styles/Components/tables/CatalogTable.module.css';

/**
 * Column definition for CatalogTable.
 * @template T - Row data type (must have id field for React key)
 */
export interface CatalogColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string;
}

interface CatalogTableProps<T> {
  columns: CatalogColumn<T>[];
  data: T[];
  loading?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  emptyMessage?: string;
}

/**
 * Generic reusable table for catalog and order entities.
 * T is constrained to have either a numeric or string id field
 * to safely use as React key.
 */
export default function CatalogTable<T extends { id: number | string }>({
  columns,
  data,
  loading = false,
  onEdit,
  onDelete,
  emptyMessage = 'No records found.',
}: CatalogTableProps<T>) {
  if (loading) {
    return (
      <div className={styles.wrapper}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.skeletonRow} />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <div className={styles.empty}>{emptyMessage}</div>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete) && <th style={{ width: '100px' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key}>{col.render(row)}</td>
              ))}
              {(onEdit || onDelete) && (
                <td>
                  <div className={styles.actions}>
                    {onEdit && (
                      <button
                        className={styles.editBtn}
                        onClick={() => onEdit(row)}
                        type="button"
                        aria-label="Edit"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className={styles.deleteBtn}
                        onClick={() => onDelete(row)}
                        type="button"
                        aria-label="Delete"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}