/**
 * UsersPage — user management with search and enable/disable actions.
 */

import { useState } from 'react';
import { Search, X, UserCheck, UserX } from 'lucide-react';
import { useUsers, useSetUserEnabled } from '../../hooks/useUsers';
import { ConfirmDialog } from '../../components/Modals/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';
import { formatDate, formatCurrency } from '../../utils/formatters';
import type { UserDto } from '../../types/user';
import styles from '../../styles/pages/Users/UsersPage.module.css';

const PAGE_SIZE = 20;

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className={styles.td}>
          <div className={styles.skeletonCell} />
        </td>
      ))}
    </tr>
  );
}

export function UsersPage() {
  const [email, setEmail]   = useState('');
  const [name, setName]     = useState('');
  const [page, setPage]     = useState(0);

  const [toggleTarget, setToggleTarget] = useState<UserDto | null>(null);

  const { data, isLoading, isError } = useUsers({
    email: email || undefined,
    name:  name  || undefined,
    page,
    size: PAGE_SIZE,
  });

  const setUserEnabled = useSetUserEnabled();

  const clearFilters = () => {
    setEmail('');
    setName('');
    setPage(0);
  };

  const hasFilters = email || name;

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Users</h2>
          {data && (
            <p className={styles.subtitle}>
              {data.totalElements.toLocaleString()} registered users
            </p>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by email…"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setPage(0); }}
          />
        </div>

        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name…"
            value={name}
            onChange={(e) => { setName(e.target.value); setPage(0); }}
          />
        </div>

        {hasFilters && (
          <button className={styles.clearBtn} onClick={clearFilters}>
            <X size={13} />
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {isError ? (
          <div className={styles.errorState}>
            Failed to load users. Please refresh.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>ID</th>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Roles</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Joined</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))
                  : data?.content.map((user) => (
                      <tr key={user.id} className={styles.row}>
                        <td className={styles.td}>
                          <span className={styles.idChip}>#{user.id}</span>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.userName}>
                            {user.firstName} {user.lastName}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.email}>{user.email}</span>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.roles}>
                            {user.roles.map((r) => (
                              <span
                                key={r}
                                className={`${styles.roleBadge} ${
                                  r === 'ADMIN' || r === 'SUPERADMIN'
                                    ? styles.roleAdmin
                                    : styles.roleUser
                                }`}
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className={styles.td}>
                          <span className={
                            user.enabled ? styles.statusEnabled : styles.statusDisabled
                          }>
                            {user.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className={styles.td}>
                          {formatDate(user.createdAt)}
                        </td>
                        <td className={styles.td}>
                          <button
                            className={`${styles.iconBtn} ${
                              user.enabled
                                ? styles.iconBtnDanger
                                : styles.iconBtnSuccess
                            }`}
                            onClick={() => setToggleTarget(user)}
                            title={user.enabled ? 'Disable user' : 'Enable user'}
                          >
                            {user.enabled
                              ? <UserX size={14} />
                              : <UserCheck size={14} />}
                          </button>
                        </td>
                      </tr>
                    ))}

                {!isLoading && data?.content.length === 0 && (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className={styles.paginationWrapper}>
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Toggle confirm */}
      {toggleTarget && (
        <ConfirmDialog
          title={toggleTarget.enabled ? 'Disable User' : 'Enable User'}
          message={
            toggleTarget.enabled
              ? `Disable ${toggleTarget.email}? They will lose access immediately.`
              : `Enable ${toggleTarget.email}? They will regain access.`
          }
          confirmLabel={toggleTarget.enabled ? 'Disable' : 'Enable'}
          isDangerous={toggleTarget.enabled}
          isLoading={setUserEnabled.isPending}
          onConfirm={async () => {
            await setUserEnabled.mutateAsync({
              id: toggleTarget.id,
              enabled: !toggleTarget.enabled,
            });
            setToggleTarget(null);
          }}
          onCancel={() => setToggleTarget(null)}
        />
      )}
    </div>
  );
}