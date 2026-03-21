import { useState } from 'react';
import { usePartCategories, usePartCategoryMutations } from '../../hooks/usePartCategories';
import { useEquipementCategories, useEquipementCategoryMutations } from '../../hooks/useEquipementCategories';
import CatalogTable from '../../components/Tables/CatalogTable';
import type { CatalogColumn } from '../../components/Tables/CatalogTable';
import ConfirmDialog from '../../components/Modals/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import type { PartCategory, PartCategoryRequest } from '../../types/category';
import type { EquipementCategory, EquipementCategoryRequest } from '../../types/category';
import styles from '../../styles/pages/Catalog/CatalogPage.module.css';

const PAGE_SIZE = 10;

/**
 * Categories management page.
 * Split into two tabs: Part categories and Equipment categories.
 */
export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<'parts' | 'equipment'>('parts');

  const [partPage, setPartPage]                   = useState(0);
  const [partModalOpen, setPartModalOpen]         = useState(false);
  const [partEditTarget, setPartEditTarget]       = useState<PartCategory | null>(null);
  const [partDeleteTarget, setPartDeleteTarget]   = useState<PartCategory | null>(null);
  const [partName, setPartName]                   = useState('');
  const [partParentId, setPartParentId]           = useState('');

  const [equipPage, setEquipPage]                   = useState(0);
  const [equipModalOpen, setEquipModalOpen]         = useState(false);
  const [equipEditTarget, setEquipEditTarget]       = useState<EquipementCategory | null>(null);
  const [equipDeleteTarget, setEquipDeleteTarget]   = useState<EquipementCategory | null>(null);
  const [equipName, setEquipName]                   = useState('');
  const [equipParentId, setEquipParentId]           = useState('');

  const { data: partData,  isLoading: partLoading  } = usePartCategories({ page: partPage,  size: PAGE_SIZE });
  const { data: equipData, isLoading: equipLoading } = useEquipementCategories({ page: equipPage, size: PAGE_SIZE });

  const { create: createPart,  update: updatePart,  remove: removePart  } = usePartCategoryMutations();
  const { create: createEquip, update: updateEquip, remove: removeEquip } = useEquipementCategoryMutations();

  const handlePartSubmit = () => {
    if (!partName.trim()) return;
    const payload: PartCategoryRequest = {
      name: partName.trim(),
      parentCategoryId: partParentId || undefined,
    };
    if (partEditTarget) {
      updatePart.mutate(
        { id: partEditTarget.id, payload },
        { onSuccess: () => { setPartModalOpen(false); setPartName(''); setPartParentId(''); } },
      );
    } else {
      createPart.mutate(payload, {
        onSuccess: () => { setPartModalOpen(false); setPartName(''); setPartParentId(''); },
      });
    }
  };

  const handleEquipSubmit = () => {
    if (!equipName.trim()) return;
    const payload: EquipementCategoryRequest = {
      name: equipName.trim(),
      parentCategoryId: equipParentId || undefined,
    };
    if (equipEditTarget) {
      updateEquip.mutate(
        { id: equipEditTarget.id, payload },
        { onSuccess: () => { setEquipModalOpen(false); setEquipName(''); setEquipParentId(''); } },
      );
    } else {
      createEquip.mutate(payload, {
        onSuccess: () => { setEquipModalOpen(false); setEquipName(''); setEquipParentId(''); },
      });
    }
  };

  const partColumns: CatalogColumn<PartCategory>[] = [
    { key: 'name',             header: 'Name',   render: (c) => <strong>{c.name}</strong> },
    { key: 'parentCategoryName', header: 'Parent', render: (c) => c.parentCategoryName ?? <span style={{ color: '#888' }}>Root</span> },
  ];

  const equipColumns: CatalogColumn<EquipementCategory>[] = [
    { key: 'name',             header: 'Name',   render: (c) => <strong>{c.name}</strong> },
    { key: 'parentCategoryName', header: 'Parent', render: (c) => c.parentCategoryName ?? <span style={{ color: '#888' }}>Root</span> },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Categories</h2>
          <p className={styles.subtitle}>Manage part and equipment categories</p>
        </div>
        <div className={styles.tabs}>
          <button
            className={[styles.tab, activeTab === 'parts' ? styles.tabActive : ''].join(' ')}
            onClick={() => setActiveTab('parts')}
            type="button"
          >
            Part categories ({partData?.page.totalElements ?? 0})
          </button>
          <button
            className={[styles.tab, activeTab === 'equipment' ? styles.tabActive : ''].join(' ')}
            onClick={() => setActiveTab('equipment')}
            type="button"
          >
            Equipment categories ({equipData?.page.totalElements ?? 0})
          </button>
        </div>
      </div>

      {/* ── Part categories tab ── */}
      {activeTab === 'parts' && (
        <>
          <div className={styles.tableHeader}>
            <span className={styles.count}>{partData?.page.totalElements ?? 0} categories</span>
            <button
              className={styles.addBtn}
              onClick={() => { setPartEditTarget(null); setPartName(''); setPartParentId(''); setPartModalOpen(true); }}
              type="button"
            >
              + New category
            </button>
          </div>

          <CatalogTable
            columns={partColumns}
            data={partData?.content ?? []}
            loading={partLoading}
            onEdit={(c) => { setPartEditTarget(c); setPartName(c.name); setPartParentId(c.parentCategoryId ?? ''); setPartModalOpen(true); }}
            onDelete={(c) => setPartDeleteTarget(c)}
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

          {partModalOpen && (
            <div className={styles.overlay}>
              <div className={styles.inlineModal}>
                <h3>{partEditTarget ? 'Edit category' : 'New part category'}</h3>
                <input
                  className={styles.inlineInput}
                  placeholder="Category name"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  autoFocus
                />
                <input
                  className={styles.inlineInput}
                  placeholder="Parent category ID (optional)"
                  value={partParentId}
                  onChange={(e) => setPartParentId(e.target.value)}
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
            title="Delete category"
            message={`Delete "${partDeleteTarget?.name}"?`}
            confirmLabel="Delete"
            danger
            loading={removePart.isPending}
            onConfirm={() => {
              if (partDeleteTarget) removePart.mutate(partDeleteTarget.id, { onSuccess: () => setPartDeleteTarget(null) });
            }}
            onCancel={() => setPartDeleteTarget(null)}
          />
        </>
      )}

      {/* ── Equipment categories tab ── */}
      {activeTab === 'equipment' && (
        <>
          <div className={styles.tableHeader}>
            <span className={styles.count}>{equipData?.page.totalElements ?? 0} categories</span>
            <button
              className={styles.addBtn}
              onClick={() => { setEquipEditTarget(null); setEquipName(''); setEquipParentId(''); setEquipModalOpen(true); }}
              type="button"
            >
              + New category
            </button>
          </div>

          <CatalogTable
            columns={equipColumns}
            data={equipData?.content ?? []}
            loading={equipLoading}
            onEdit={(c) => { setEquipEditTarget(c); setEquipName(c.name); setEquipParentId(c.parentCategoryId ?? ''); setEquipModalOpen(true); }}
            onDelete={(c) => setEquipDeleteTarget(c)}
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
                <h3>{equipEditTarget ? 'Edit category' : 'New equipment category'}</h3>
                <input
                  className={styles.inlineInput}
                  placeholder="Category name"
                  value={equipName}
                  onChange={(e) => setEquipName(e.target.value)}
                  autoFocus
                />
                <input
                  className={styles.inlineInput}
                  placeholder="Parent category ID (optional)"
                  value={equipParentId}
                  onChange={(e) => setEquipParentId(e.target.value)}
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
            title="Delete category"
            message={`Delete "${equipDeleteTarget?.name}"?`}
            confirmLabel="Delete"
            danger
            loading={removeEquip.isPending}
            onConfirm={() => {
              if (equipDeleteTarget) removeEquip.mutate(equipDeleteTarget.id, { onSuccess: () => setEquipDeleteTarget(null) });
            }}
            onCancel={() => setEquipDeleteTarget(null)}
          />
        </>
      )}
    </div>
  );
}