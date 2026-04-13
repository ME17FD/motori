/**
 * DynamicPropertiesEditor — key/value editor for product JSON properties.
 *
 * Renders a list of editable rows (key, type, value).
 * Controlled component — parent owns the properties state.
 *
 * Supported value types: string | number | boolean
 */

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { DynamicProperties } from '../../types/product';
import styles from '../../styles/Components/forms/DynamicPropertiesEditor.module.css';

type PropType = 'string' | 'number' | 'boolean';

interface PropRow {
  key: string;
  type: PropType;
  value: string; // always string in the UI, parsed on save
}

interface Props {
  value: DynamicProperties;
  onChange: (updated: DynamicProperties) => void;
}

/** Convert DynamicProperties → editable rows */
function toRows(props: DynamicProperties): PropRow[] {
  return Object.entries(props).map(([key, val]) => ({
    key,
    type: typeof val as PropType,
    value: String(val),
  }));
}

/** Convert editable rows → DynamicProperties */
function fromRows(rows: PropRow[]): DynamicProperties {
  const result: DynamicProperties = {};
  for (const row of rows) {
    if (!row.key.trim()) continue; // skip empty keys
    if (row.type === 'number') {
      result[row.key] = parseFloat(row.value) || 0;
    } else if (row.type === 'boolean') {
      result[row.key] = row.value === 'true';
    } else {
      result[row.key] = row.value;
    }
  }
  return result;
}

export function DynamicPropertiesEditor({ value, onChange }: Props) {
  const [rows, setRows] = useState<PropRow[]>(() => toRows(value));

  /** Propagate changes to parent after every mutation */
  const emit = (updated: PropRow[]) => {
    setRows(updated);
    onChange(fromRows(updated));
  };

  const addRow = () => {
    emit([...rows, { key: '', type: 'string', value: '' }]);
  };

  const removeRow = (index: number) => {
    emit(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, patch: Partial<PropRow>) => {
    emit(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  return (
    <div className={styles.editor}>
      {rows.length > 0 && (
        <div className={styles.header}>
          <span className={styles.colLabel}>Key</span>
          <span className={styles.colLabel}>Type</span>
          <span className={styles.colLabel}>Value</span>
          <span />
        </div>
      )}

      {rows.map((row, i) => (
        <div key={i} className={styles.row}>
          {/* Key */}
          <input
            type="text"
            className={styles.input}
            placeholder="property_key"
            value={row.key}
            onChange={(e) => updateRow(i, { key: e.target.value })}
          />

          {/* Type */}
          <select
            className={styles.select}
            value={row.type}
            onChange={(e) =>
              updateRow(i, {
                type:  e.target.value as PropType,
                value: '',
              })
            }
          >
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
          </select>

          {/* Value */}
          {row.type === 'boolean' ? (
            <select
              className={styles.select}
              value={row.value}
              onChange={(e) => updateRow(i, { value: e.target.value })}
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : (
            <input
              type={row.type === 'number' ? 'number' : 'text'}
              className={styles.input}
              placeholder={row.type === 'number' ? '0' : 'value'}
              value={row.value}
              onChange={(e) => updateRow(i, { value: e.target.value })}
            />
          )}

          {/* Remove */}
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => removeRow(i)}
            title="Remove property"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}

      <button type="button" className={styles.addBtn} onClick={addRow}>
        <Plus size={13} />
        Add property
      </button>
    </div>
  );
}