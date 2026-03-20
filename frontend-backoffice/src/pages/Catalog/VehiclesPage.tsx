/**
 * Vehicles Catalog Management Page
 * Admin page for CRUD operations on vehicle inventory.
 * Displays vehicle makes, models, engines, types with pagination.
 * Features modal dialogs for edit/create, and confirmation for delete.
 */

import { useState } from 'react';
import { useVehicles, useVehicleMutations } from '../../hooks/useVehicles';
import CatalogTable from '../../components/Tables/CatalogTable';
import type { CatalogColumn } from '../../components/Tables/CatalogTable';
import VehicleModal from '../../components/Modals/VehicleModal';
import ConfirmDialog from '../../components/Modals/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import type { Vehicle, CreateVehicleRequest } from '../../types/vehicle';
import styles from '../../styles/pages/Catalog/CatalogPage.module.css';

const PAGE_SIZE = 10;

export default function VehiclesPage() {
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Vehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

  const { data, isLoading } = useVehicles({ page, size: PAGE_SIZE });
  const { create, update, remove } = useVehicleMutations();

  const handleSubmit = (formData: CreateVehicleRequest) => {
    if (editTarget) {
      update.mutate(
        { id: editTarget.id, payload: formData },
        { onSuccess: () => setModalOpen(false) },
      );
    } else {
      create.mutate(formData, { onSuccess: () => setModalOpen(false) });
    }
  };

  const columns: CatalogColumn<Vehicle>[] = [
    { key: 'id',     header: 'ID',     render: (v) => v.id,                          width: '60px' },
    { key: 'make',   header: 'Make',   render: (v) => <strong>{v.make}</strong> },
    { key: 'model',  header: 'Model',  render: (v) => v.model },
    { key: 'year',   header: 'Year',   render: (v) => v.year,                        width: '80px' },
    { key: 'engine', header: 'Engine', render: (v) => v.engine ?? '—' },
    { key: 'type',   header: 'Type',   render: (v) => v.type ?? '—' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Vehicles</h2>
          <p className={styles.subtitle}>{data?.totalElements ?? 0} vehicles</p>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          type="button"
        >
          + New vehicle
        </button>
      </div>

      <CatalogTable
        columns={columns}
        data={data?.content ?? []}
        loading={isLoading}
        onEdit={(v) => { setEditTarget(v); setModalOpen(true); }}
        onDelete={(v) => setDeleteTarget(v)}
      />

      {data && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      <VehicleModal
        open={modalOpen}
        initial={editTarget}
        loading={create.isPending || update.isPending}
        onSubmit={handleSubmit}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete vehicle"
        message={`Delete "${deleteTarget?.make} ${deleteTarget?.model} (${deleteTarget?.year})"?`}
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onConfirm={() => {
          if (deleteTarget) remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}