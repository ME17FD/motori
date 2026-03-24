import { useState } from 'react';
import { useVehicules, useVehiculeMutations, useVehiculeBrands, useVehiculeBrandMutations } from '../../hooks/useVehicles';
import CatalogTable from '../../components/Tables/CatalogTable';
import type { CatalogColumn } from '../../components/Tables/CatalogTable';
import ConfirmDialog from '../../components/Modals/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import type { Vehicule, VehiculeRequest, VehiculeBrand, VehiculeBrandRequest } from '../../types/vehicle';
import styles from '../../styles/pages/Catalog/CatalogPage.module.css';

const PAGE_SIZE = 10;

/**
 * Vehicles management page.
 * Split into two tabs: Vehicles and Vehicle brands.
 */
export default function VehiclesPage() {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'brands'>('vehicles');

  /* ── Vehicles state ── */
  const [vPage, setVPage]                   = useState(0);
  const [vModalOpen, setVModalOpen]         = useState(false);
  const [vEditTarget, setVEditTarget]       = useState<Vehicule | null>(null);
  const [vDeleteTarget, setVDeleteTarget]   = useState<Vehicule | null>(null);
  const [vForm, setVForm]                   = useState<VehiculeRequest>({ name: '', model: '', vehiculeBrandId: '' });

  /* ── Vehicle brands state ── */
  const [bPage, setBPage]                   = useState(0);
  const [bModalOpen, setBModalOpen]         = useState(false);
  const [bEditTarget, setBEditTarget]       = useState<VehiculeBrand | null>(null);
  const [bDeleteTarget, setBDeleteTarget]   = useState<VehiculeBrand | null>(null);
  const [bName, setBName]                   = useState('');

  const { data: vData,  isLoading: vLoading } = useVehicules({ page: vPage, size: PAGE_SIZE });
  const { data: bData,  isLoading: bLoading } = useVehiculeBrands({ page: bPage, size: PAGE_SIZE });
  const { create: createV, update: updateV, remove: removeV } = useVehiculeMutations();
  const { create: createB, update: updateB, remove: removeB } = useVehiculeBrandMutations();

  const handleVehicleSubmit = () => {
    if (!vForm.name || !vForm.model || !vForm.vehiculeBrandId) return;
    if (vEditTarget) {
      updateV.mutate(
        { id: vEditTarget.id, payload: vForm },
        { onSuccess: () => setVModalOpen(false) },
      );
    } else {
      createV.mutate(vForm, { onSuccess: () => setVModalOpen(false) });
    }
  };

  const handleBrandSubmit = () => {
    if (!bName.trim()) return;
    const payload: VehiculeBrandRequest = { name: bName.trim() };
    if (bEditTarget) {
      updateB.mutate(
        { id: bEditTarget.id, payload },
        { onSuccess: () => { setBModalOpen(false); setBName(''); } },
      );
    } else {
      createB.mutate(payload, { onSuccess: () => { setBModalOpen(false); setBName(''); } });
    }
  };

  const vColumns: CatalogColumn<Vehicule>[] = [
    { key: 'name',  header: 'Name',  render: (v) => <strong>{v.name}</strong> },
    { key: 'model', header: 'Model', render: (v) => v.model },
    { key: 'brand', header: 'Brand', render: (v) => v.brand?.name ?? '—' },
  ];

  const bColumns: CatalogColumn<VehiculeBrand>[] = [
    { key: 'name', header: 'Name', render: (b) => <strong>{b.name}</strong> },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Vehicles</h2>
          <p className={styles.subtitle}>Manage vehicles and vehicle brands</p>
        </div>
        <div className={styles.tabs}>
          <button
            className={[styles.tab, activeTab === 'vehicles' ? styles.tabActive : ''].join(' ')}
            onClick={() => setActiveTab('vehicles')}
            type="button"
          >
            Vehicles ({vData?.page.totalElements ?? 0})
          </button>
          <button
            className={[styles.tab, activeTab === 'brands' ? styles.tabActive : ''].join(' ')}
            onClick={() => setActiveTab('brands')}
            type="button"
          >
            Vehicle brands ({bData?.page.totalElements ?? 0})
          </button>
        </div>
      </div>

      {/* ── Vehicles tab ── */}
      {activeTab === 'vehicles' && (
        <>
          <div className={styles.tableHeader}>
            <span className={styles.count}>{vData?.page.totalElements ?? 0} vehicles</span>
            <button
              className={styles.addBtn}
              onClick={() => {
                setVEditTarget(null);
                setVForm({ name: '', model: '', vehiculeBrandId: '' });
                setVModalOpen(true);
              }}
              type="button"
            >
              + New vehicle
            </button>
          </div>

          <CatalogTable
            columns={vColumns}
            data={vData?.content ?? []}
            loading={vLoading}
            onEdit={(v) => {
              setVEditTarget(v);
              setVForm({ name: v.name, model: v.model, vehiculeBrandId: v.brand?.id ?? '' });
              setVModalOpen(true);
            }}
            onDelete={(v) => setVDeleteTarget(v)}
          />

          {vData && (
            <Pagination
              page={vPage}
              totalPages={vData.page.totalPages}
              totalElements={vData.page.totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={setVPage}
            />
          )}

          {vModalOpen && (
            <div className={styles.overlay}>
              <div className={styles.inlineModal}>
                <h3>{vEditTarget ? 'Edit vehicle' : 'New vehicle'}</h3>
                <input
                  className={styles.inlineInput}
                  placeholder="Name (e.g. CBR 600)"
                  value={vForm.name}
                  onChange={(e) => setVForm((f) => ({ ...f, name: e.target.value }))}
                  autoFocus
                />
                <input
                  className={styles.inlineInput}
                  placeholder="Model (e.g. Sport)"
                  value={vForm.model}
                  onChange={(e) => setVForm((f) => ({ ...f, model: e.target.value }))}
                />
                <input
                  className={styles.inlineInput}
                  placeholder="Vehicle brand UUID"
                  value={vForm.vehiculeBrandId}
                  onChange={(e) => setVForm((f) => ({ ...f, vehiculeBrandId: e.target.value }))}
                />
                <div className={styles.inlineActions}>
                  <button className={styles.cancelBtn} onClick={() => setVModalOpen(false)} type="button">Cancel</button>
                  <button
                    className={styles.addBtn}
                    onClick={handleVehicleSubmit}
                    disabled={createV.isPending || updateV.isPending}
                    type="button"
                  >
                    {createV.isPending || updateV.isPending ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <ConfirmDialog
            open={!!vDeleteTarget}
            title="Delete vehicle"
            message={`Delete "${vDeleteTarget?.name}"?`}
            confirmLabel="Delete"
            danger
            loading={removeV.isPending}
            onConfirm={() => {
              if (vDeleteTarget) removeV.mutate(vDeleteTarget.id, { onSuccess: () => setVDeleteTarget(null) });
            }}
            onCancel={() => setVDeleteTarget(null)}
          />
        </>
      )}

      {/* ── Vehicle brands tab ── */}
      {activeTab === 'brands' && (
        <>
          <div className={styles.tableHeader}>
            <span className={styles.count}>{bData?.page.totalElements ?? 0} vehicle brands</span>
            <button
              className={styles.addBtn}
              onClick={() => { setBEditTarget(null); setBName(''); setBModalOpen(true); }}
              type="button"
            >
              + New brand
            </button>
          </div>

          <CatalogTable
            columns={bColumns}
            data={bData?.content ?? []}
            loading={bLoading}
            onEdit={(b) => { setBEditTarget(b); setBName(b.name); setBModalOpen(true); }}
            onDelete={(b) => setBDeleteTarget(b)}
          />

          {bData && (
            <Pagination
              page={bPage}
              totalPages={bData.page.totalPages}
              totalElements={bData.page.totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={setBPage}
            />
          )}

          {bModalOpen && (
            <div className={styles.overlay}>
              <div className={styles.inlineModal}>
                <h3>{bEditTarget ? 'Edit vehicle brand' : 'New vehicle brand'}</h3>
                <input
                  className={styles.inlineInput}
                  placeholder="Brand name (e.g. Honda)"
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  autoFocus
                />
                <div className={styles.inlineActions}>
                  <button className={styles.cancelBtn} onClick={() => setBModalOpen(false)} type="button">Cancel</button>
                  <button
                    className={styles.addBtn}
                    onClick={handleBrandSubmit}
                    disabled={createB.isPending || updateB.isPending}
                    type="button"
                  >
                    {createB.isPending || updateB.isPending ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <ConfirmDialog
            open={!!bDeleteTarget}
            title="Delete vehicle brand"
            message={`Delete "${bDeleteTarget?.name}"?`}
            confirmLabel="Delete"
            danger
            loading={removeB.isPending}
            onConfirm={() => {
              if (bDeleteTarget) removeB.mutate(bDeleteTarget.id, { onSuccess: () => setBDeleteTarget(null) });
            }}
            onCancel={() => setBDeleteTarget(null)}
          />
        </>
      )}
    </div>
  );
}