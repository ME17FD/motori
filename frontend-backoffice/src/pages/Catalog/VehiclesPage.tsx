/**
 * VehiclesPage — manage vehicles with brand filter.
 */

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useVehicles, useDeleteVehicle } from '../../hooks/useVehicles';
import { useBrands } from '../../hooks/useBrands';
import { VehicleModal } from '../../components/Modals/VehicleModal';
import { ConfirmDialog } from '../../components/Modals/ConfirmDialog';
import type { VehicleDto } from '../../types/vehicle';
import styles from '../../styles/pages/Catalog/CatalogPage.module.css';

export function VehiclesPage() {
  const [brandFilter, setBrandFilter]   = useState<string | undefined>();
  const [showCreate, setShowCreate]     = useState(false);
  const [editTarget, setEditTarget]     = useState<VehicleDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VehicleDto | null>(null);

  const { data: vehicles = [], isLoading } = useVehicles(brandFilter);
  const { data: brands = [] }              = useBrands('VehiculeBrand');
  const deleteVehicle                      = useDeleteVehicle();


  

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteVehicle.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Vehicles</h2>
        <p className={styles.pageSubtitle}>
          {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.listSection}>
          <div className={styles.toolbar}>
            <select
              className={styles.filterSelect}
              value={brandFilter ?? ''}
              onChange={(e) =>
                setBrandFilter(e.target.value ? e.target.value : undefined)
              }
            >
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <button
              className={styles.addBtn}
              onClick={() => setShowCreate(true)}
            >
              <Plus size={15} />
              Add Vehicle
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>ID</th>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Model</th>
                  <th className={styles.th}>Brand</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className={styles.td}>
                          <div className={styles.skeleton} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>
                      No vehicles found.
                    </td>
                  </tr>
                ) : (
                  vehicles.map((v) => (
                    <tr key={v.id} className={styles.row}>
                      <td className={styles.td}>
                        <span className={styles.idChip}>#{v.id}</span>
                      </td>
                      <td className={styles.td}>{v.name}</td>
                      <td className={styles.td}>
                        <span className={styles.modelChip}>{v.model}</span>
                      </td>
                      <td className={styles.td}>
                        {v.brand?.name || '—'}
                      </td>
                      <td className={styles.td}>
                        <div className={styles.rowActions}>
                          <button
                            className={styles.iconBtn}
                            onClick={() => setEditTarget(v)}
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                            onClick={() => setDeleteTarget(v)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && (
            <p className={styles.count}>
              {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
              {brandFilter && ' for selected brand'}
            </p>
          )}
        </div>
      </div>

      {showCreate && (
        <VehicleModal onClose={() => setShowCreate(false)} />
      )}
      {editTarget && (
        <VehicleModal
          editVehicle={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Vehicle"
          message={`Delete "${deleteTarget.name} ${deleteTarget.model}"?`}
          confirmLabel="Delete"
          isLoading={deleteVehicle.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}