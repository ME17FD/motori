import { useState } from 'react';
import { usePartBrands, usePartBrandMutations } from '../../hooks/usePartBrands';
import { useEquipementBrands, useEquipementBrandMutations } from '../../hooks/useEquipementBrands';
import CatalogTable from '../../components/Tables/CatalogTable';
import type { CatalogColumn } from '../../components/Tables/CatalogTable';
import ConfirmDialog from '../../components/Modals/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import type { PartBrand, PartBrandRequest, EquipementBrand, EquipementBrandRequest } from '../../types/brand';
import { formatDate } from '../../utils/formatters';
import styles from '../../styles/pages/Catalog/CatalogPage.module.css';

const PAGE_SIZE = 10;

/**
 * Brands management page.
 * Split into two tabs: Part brands and Equipment brands.
 * Each tab has its own paginated table with CRUD operations.
 */
export default function BrandsPage() {
  const [activeTab, setActiveTab] = useState<'parts' | 'equipment'>('parts');

  // Part brands state
  const [partPage, setPartPage]               = useState(0);
  const [partModalOpen, setPartModalOpen]     = useState(false);
  const [partEditTarget, setPartEditTarget]   = useState<PartBrand | null>(null);
  const [partDeleteTarget, setPartDeleteTarget] = useState<PartBrand | null>(null);
  const [partName, setPartName]               = useState('');

  // Equipment brands state
  const [equipPage, setEquipPage]               = useState(0);
  const [equipModalOpen, setEquipModalOpen]     = useState(false);
  const [equipEditTarget, setEquipEditTarget]   = useState<EquipementBrand | null>(null);
  const [equipDeleteTarget, setEquipDeleteTarget] = useState<EquipementBrand | null>(null);
  const [equipName, setEquipName]               = useState('');

  const { data: partData, isLoading: partLoading } = usePartBrands({ page: partPage, size: PAGE_SIZE });
  const { create: createPart, update: updatePart, remove: removePart } = usePartBrandMutations();

  const { data: equipData, isLoading: equipLoading } = useEquipementBrands({ page: equipPage, size: PAGE_SIZE });
  const { create: createEquip, update: updateEquip, remove: removeEquip } = useEquipementBrandMutations();

  /* ── Part brand handlers ── */
  const handlePartSubmit = () => {
    if (!partName.trim()) return;
    const payload: PartBrandRequest = { name: partName.trim() };
    if (partEditTarget) {
      updatePart.mutate(
        { id: partEditTarget.id, payload },
        { onSuccess: () => { setPartModalOpen(false); setPartName(''); } },
      );
    } else {
      createPart.mutate(payload, {
        onSuccess: () => { setPartModalOpen(false); setPartName(''); },
      });
    }
  };

  /* ── Equipment brand handlers ── */
  const handleEquipSubmit = () => {
    if (!equipName.trim()) return;
    const payload: EquipementBrandRequest = { name: equipName.trim() };
    if (equipEditTarget) {
      updateEquip.mutate(
        { id: equipEditTarget.id, payload },
        { onSuccess: () => { setEquipModalOpen(false); setEquipName(''); } },
      );
    } else {
      createEquip.mutate(payload, {
        onSuccess: () => { setEquipModalOpen(false); setEquipName(''); },
      });
    }
  };

  const partColumns: CatalogColumn<PartBrand>[] = [
    { key: 'name',      header: 'Name',    render: (b) => <strong>{b.name}</strong> },
    { key: 'createdAt', header: 'Created', render: (b) => b.createdAt ? formatDate(b.createdAt) : '—' },
  ];

  const equipColumns: CatalogColumn<EquipementBrand>[] = [
    { key: 'name',      header: 'Name',    render: (b) => <strong>{b.name}</strong> },
    { key: 'createdAt', header: 'Created', render: (b) => b.createdAt ? formatDate(b.createdAt) : '—' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Brands</h2>
          <p className={styles.subtitle}>Manage part and equipment brands</p>
        </div>
        <div className={styles.tabs}>
          <button
            className={[styles.tab, activeTab === 'parts' ? styles.tabActive : ''].join(' ')}
            onClick={() => setActiveTab('parts')}
            type="button"
          >
            Part brands ({partData?.page.totalElements ?? 0})
          </button>
          <button
            className={[styles.tab, activeTab === 'equipment' ? styles.tabActive : ''].join(' ')}
            onClick={() => setActiveTab('equipment')}
            type="button"
          >
            Equipment brands ({equipData?.page.totalElements ?? 0})
          </button>
        </div>
      </div>

      {/* ── Part brands tab ── */}
      {activeTab === 'parts' && (
        <>
          <div className={styles.tableHeader}>
            <span className={styles.count}>
              {partData?.page.totalElements ?? 0} part brands
            </span>
            <button
              className={styles.addBtn}
              onClick={() => { setPartEditTarget(null); setPartName(''); setPartModalOpen(true); }}
              type="button"
            >
              + New brand
            </button>
          </div>

          <CatalogTable
            columns={partColumns}
            data={partData?.content ?? []}
            loading={partLoading}
            onEdit={(b) => { setPartEditTarget(b); setPartName(b.name); setPartModalOpen(true); }}
            onDelete={(b) => setPartDeleteTarget(b)}
          />

          {partData && (
            <Pagination
              page={partPage}
              totalPages={partData.page.totalPages}
              totalElements={partData.page.totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={setPartPage}
            />
          )}

          {/* Inline modal */}
          {partModalOpen && (
            <div className={styles.overlay}>
              <div className={styles.inlineModal}>
                <h3>{partEditTarget ? 'Edit part brand' : 'New part brand'}</h3>
                <input
                  className={styles.inlineInput}
                  placeholder="Brand name"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  autoFocus
                />
                <div className={styles.inlineActions}>
                  <button className={styles.cancelBtn} onClick={() => setPartModalOpen(false)} type="button">Cancel</button>
                  <button
                    className={styles.addBtn}
                    onClick={handlePartSubmit}
                    disabled={createPart.isPending || updatePart.isPending}
                    type="button"
                  >
                    {createPart.isPending || updatePart.isPending ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <ConfirmDialog
            open={!!partDeleteTarget}
            title="Delete part brand"
            message={`Delete "${partDeleteTarget?.name}"? This cannot be undone.`}
            confirmLabel="Delete"
            danger
            loading={removePart.isPending}
            onConfirm={() => {
              if (partDeleteTarget) {
                removePart.mutate(partDeleteTarget.id, { onSuccess: () => setPartDeleteTarget(null) });
              }
            }}
            onCancel={() => setPartDeleteTarget(null)}
          />
        </>
      )}

      {/* ── Equipment brands tab ── */}
      {activeTab === 'equipment' && (
        <>
          <div className={styles.tableHeader}>
            <span className={styles.count}>
              {equipData?.page.totalElements ?? 0} equipment brands
            </span>
            <button
              className={styles.addBtn}
              onClick={() => { setEquipEditTarget(null); setEquipName(''); setEquipModalOpen(true); }}
              type="button"
            >
              + New brand
            </button>
          </div>

          <CatalogTable
            columns={equipColumns}
            data={equipData?.content ?? []}
            loading={equipLoading}
            onEdit={(b) => { setEquipEditTarget(b); setEquipName(b.name); setEquipModalOpen(true); }}
            onDelete={(b) => setEquipDeleteTarget(b)}
          />

          {equipData && (
            <Pagination
              page={equipPage}
              totalPages={equipData.page.totalPages}
              totalElements={equipData.page.totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={setEquipPage}
            />
          )}

          {equipModalOpen && (
            <div className={styles.overlay}>
              <div className={styles.inlineModal}>
                <h3>{equipEditTarget ? 'Edit equipment brand' : 'New equipment brand'}</h3>
                <input
                  className={styles.inlineInput}
                  placeholder="Brand name"
                  value={equipName}
                  onChange={(e) => setEquipName(e.target.value)}
                  autoFocus
                />
                <div className={styles.inlineActions}>
                  <button className={styles.cancelBtn} onClick={() => setEquipModalOpen(false)} type="button">Cancel</button>
                  <button
                    className={styles.addBtn}
                    onClick={handleEquipSubmit}
                    disabled={createEquip.isPending || updateEquip.isPending}
                    type="button"
                  >
                    {createEquip.isPending || updateEquip.isPending ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <ConfirmDialog
            open={!!equipDeleteTarget}
            title="Delete equipment brand"
            message={`Delete "${equipDeleteTarget?.name}"? This cannot be undone.`}
            confirmLabel="Delete"
            danger
            loading={removeEquip.isPending}
            onConfirm={() => {
              if (equipDeleteTarget) {
                removeEquip.mutate(equipDeleteTarget.id, { onSuccess: () => setEquipDeleteTarget(null) });
              }
            }}
            onCancel={() => setEquipDeleteTarget(null)}
          />
        </>
      )}
    </div>
  );
}   