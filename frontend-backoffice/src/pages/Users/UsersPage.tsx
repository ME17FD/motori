import { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import CatalogTable from '../../components/Tables/CatalogTable';
import type { CatalogColumn } from '../../components/Tables/CatalogTable';
import UserDetailModal from '../../components/Modals/UserDetailModal';
import UserRoleBadge from '../../components/ui/UserRoleBadge';
import Pagination from '../../components/ui/Pagination';
import type { User, UserFilters, UserRole } from '../../types/user';
import { formatDate } from '../../utils/formatters';
import styles from '../../styles/pages/Users/UsersPage.module.css';

const PAGE_SIZE = 15;

const ROLE_OPTIONS: Array<{ label: string; value: UserRole | '' }> = [
  { label: 'All roles', value: '' },
  { label: 'User',      value: 'ROLE_USER' },
  { label: 'Admin',     value: 'ROLE_ADMIN' },
];

/**
 * Users management page.
 * Supports search, role filter, enabled filter
 * and opens a detail modal with order history and account actions.
 */
export default function UsersPage() {
  const [page, setPage]       = useState(0);
  const [search, setSearch]   = useState('');
  const [role, setRole]       = useState<UserRole | ''>('');
  const [enabledFilter, setEnabledFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const filters: UserFilters = {
    page,
    size: PAGE_SIZE,
    search:  search || undefined,
    role:    role   || undefined,
    enabled: enabledFilter === 'all'
      ? undefined
      : enabledFilter === 'enabled',
  };

  const { data, isLoading } = useUsers(filters);

  const columns: CatalogColumn<User>[] = [
    {
      key: 'id',
      header: 'ID',
      width: '60px',
      render: (u) => (
        <span style={{ color: 'var(--color-gray)', fontSize: 12 }}>#{u.id}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name / Email',
      render: (u) => (
        <div>
          {(u.firstName || u.lastName) && (
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {[u.firstName, u.lastName].filter(Boolean).join(' ')}
            </div>
          )}
          <div style={{ fontSize: 12, color: '#5c5c5c' }}>{u.email}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (u) => (
        <span style={{ fontSize: 12, color: '#5c5c5c' }}>
          {u.phone ?? '—'}
        </span>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (u) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {u.roles.map((r) => (
            <UserRoleBadge key={r} role={r} />
          ))}
        </div>
      ),
    },
    {
      key: 'enabled',
      header: 'Status',
      width: '90px',
      render: (u) => (
        <span style={{
          fontSize: 12,
          fontWeight: 500,
          color: u.enabled ? '#065f46' : '#b91c1c',
        }}>
          {u.enabled ? 'Active' : 'Disabled'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (u) => (
        <span style={{ fontSize: 12, color: '#5c5c5c' }}>
          {formatDate(u.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Users</h2>
          <p className={styles.subtitle}>
            {data?.totalElements ?? 0} registered users
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />

        <select
          className={styles.select}
          value={role}
          onChange={(e) => { setRole(e.target.value as UserRole | ''); setPage(0); }}
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={enabledFilter}
          onChange={(e) => {
            setEnabledFilter(e.target.value as 'all' | 'enabled' | 'disabled');
            setPage(0);
          }}
        >
          <option value="all">All statuses</option>
          <option value="enabled">Active only</option>
          <option value="disabled">Disabled only</option>
        </select>

        {(search || role || enabledFilter !== 'all') && (
          <button
            className={styles.clearBtn}
            type="button"
            onClick={() => {
              setSearch('');
              setRole('');
              setEnabledFilter('all');
              setPage(0);
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <CatalogTable
        columns={columns}
        data={data?.content ?? []}
        loading={isLoading}
        onEdit={(u) => setSelectedUserId(u.id)}
        emptyMessage="No users found."
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

      <UserDetailModal
        open={!!selectedUserId}
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
}