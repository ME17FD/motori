import { useState, useEffect } from 'react';
import type { DynamicProperties, PropertyField } from '../../types/product';
import styles from '../../styles/Components/forms/DynamicPropertiesEditor.module.css';

interface DynamicPropertiesEditorProps {
  initialValue?: DynamicProperties;
  onChange: (properties: DynamicProperties) => void;
}

/**
 * Wrapper that remounts the inner editor when initialValue changes.
 * Uses the JSON stringified value as a key to force remount cleanly
 * instead of syncing state inside effects.
 */
export default function DynamicPropertiesEditor({
  initialValue,
  onChange,
}: DynamicPropertiesEditorProps) {
  const stableKey = JSON.stringify(initialValue ?? {});
  return (
    <DynamicPropertiesEditorInner
      key={stableKey}
      initialValue={initialValue}
      onChange={onChange}
    />
  );
}

/**
 * Inner editor — remounts whenever the key (initialValue) changes.
 * State is initialized once from props, no effects needed.
 */
function DynamicPropertiesEditorInner({
  initialValue,
  onChange,
}: DynamicPropertiesEditorProps) {
  const [fields, setFields] = useState<PropertyField[]>(() => {
    if (!initialValue) return [];
    return Object.entries(initialValue).map(([key, value]) => ({
      key,
      value: String(value),
    }));
  });

  /**
   * Notify parent whenever fields change.
   * This effect only writes to an external callback — not to local state —
   * so it does not cause cascading renders.
   */
  useEffect(() => {
    const result: DynamicProperties = {};
    fields.forEach(({ key, value }) => {
      if (key.trim()) result[key.trim()] = value;
    });
    onChange(result);
  }, [fields, onChange]);

  const addField = () => {
    setFields((prev) => [...prev, { key: '', value: '' }]);
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: Partial<PropertyField>) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...field } : f)),
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <span className={styles.sectionLabel}>Dynamic properties (JSONB)</span>
        <button type="button" className={styles.addBtn} onClick={addField}>
          + Add field
        </button>
      </div>

      {fields.length === 0 && (
        <p className={styles.empty}>No properties defined. Click "Add field" to start.</p>
      )}

      {fields.map((field, index) => (
        <div key={index} className={styles.fieldRow}>
          <input
            className={styles.keyInput}
            placeholder="Key (e.g. material)"
            value={field.key}
            onChange={(e) => updateField(index, { key: e.target.value })}
          />
          <span className={styles.separator}>:</span>
          <input
            className={styles.valueInput}
            placeholder="Value (e.g. aluminum)"
            value={field.value}
            onChange={(e) => updateField(index, { value: e.target.value })}
          />
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => removeField(index)}
            aria-label="Remove field"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}