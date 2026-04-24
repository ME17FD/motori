// pages/ProfilePage/ProfilePage.tsx
import { useState, useCallback } from 'react';
import styles from '../../styles/components/Profilepage.module.css';
import useAuth from '../../hooks/useAuth';
import  useOrders  from '../../hooks/useOrders';
import parseError from '../../utils/parseError';
import Loading from '../../components/ui/Loading/Loading';
import Error from '../../components/ui/Error/Error';
import type { UpdateProfilePayload, ChangePasswordPayload} from '../../types/auth';
import type { OrderResponse } from '../../types/order.types';

/* ── Types ─────────────────────────────────────────────────── */
type Tab = 'info' | 'edit' | 'password' | 'orders';

/* ── TabBar ────────────────────────────────────────────────── */
function TabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'info',     label: 'Mon profil',   icon: '👤' },
    { id: 'edit',     label: 'Modifier',     icon: '✏️' },
    { id: 'password', label: 'Mot de passe', icon: '🔒' },
    { id: 'orders',   label: 'Commandes',    icon: '📦' },
  ];

  return (
    <nav className={styles.tabBar} role="tablist" aria-label="Sections profil">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          aria-controls={`panel-${t.id}`}
          id={`tab-${t.id}`}
          className={`${styles.tab} ${active === t.id ? styles.tabActive : ''}`}
          onClick={() => onChange(t.id)}
        >
          <span className={styles.tabIcon} aria-hidden="true">{t.icon}</span>
          <span className={styles.tabLabel}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ── InfoPanel ─────────────────────────────────────────────── */
function InfoPanel({
  user,
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
}) {
  const initials =
    `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?';

  return (
    <section
      id="panel-info"
      role="tabpanel"
      aria-labelledby="tab-info"
      className={styles.panel}
    >
      <div className={styles.avatarRing}>
        <div className={styles.avatar} aria-label={`Avatar de ${user.firstName}`}>
          {initials}
        </div>
      </div>

      <h2 className={styles.userName}>
        {user.firstName} {user.lastName}
      </h2>
      <p className={styles.userEmail}>{user.email}</p>

      <dl className={styles.infoGrid}>
        {(
          [
            ['Prénom',    user.firstName],
            ['Nom',       user.lastName],
            ['Email',     user.email],
            ['Téléphone', (user as any as { phone?: string }).phone ?? '—'],
            ['Rôle',      (user as any as { roles?: string[] }).roles?.[0] ?? 'CLIENT'],
          ] as [string, string | undefined][]
        ).map(([label, value]) => (
          <div key={label} className={styles.infoItem}>
            <dt className={styles.infoLabel}>{label}</dt>
            <dd className={styles.infoValue}>
              {label === 'Rôle' ? (
                <span className={styles.roleBadge}>{value ?? '—'}</span>
              ) : (
                value || '—'
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ── EditPanel ─────────────────────────────────────────────── */
function EditPanel({
  user,
  onSaved,
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  onSaved: () => void;
}) {
  const { updateProfile } = useAuth();

  const [form, setForm] = useState<UpdateProfilePayload>({
    firstname: user.firstName ?? '',
    lastname:  user.lastName  ?? '',
    email:     user.email     ?? '',
    phone:     (user as any as { phone?: string }).phone ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [success,    setSuccess]    = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstname?.trim() || !form.lastname?.trim()) {
      setError('Le prénom et le nom sont obligatoires.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await updateProfile(form);
      setSuccess(true);
      onSaved();
    } catch (err) {
      setError(parseError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="panel-edit"
      role="tabpanel"
      aria-labelledby="tab-edit"
      className={styles.panel}
    >
      <h2 className={styles.panelTitle}>Modifier le profil</h2>

      {error   && <div className={styles.alertError}   role="alert"  >{error}</div>}
      {success && <div className={styles.alertSuccess} role="status" >Profil mis à jour avec succès.</div>}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.formRow}>
          <div className={styles.fieldGroup}>
            <label htmlFor="firstName" className={styles.label}>Prénom</label>
            <input
              id="firstName" name="firstName" type="text"
              className={styles.input}
              value={form.firstname} onChange={handleChange}
              autoComplete="given-name" required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="lastName" className={styles.label}>Nom</label>
            <input
              id="lastName" name="lastName" type="text"
              className={styles.input}
              value={form.lastname} onChange={handleChange}
              autoComplete="family-name" required
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            id="email" name="email" type="email"
            className={styles.input}
            value={form.email} onChange={handleChange}
            autoComplete="email"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="phone" className={styles.label}>Téléphone</label>
          <input
            id="phone" name="phone" type="tel"
            className={styles.input}
            value={form.phone} onChange={handleChange}
            autoComplete="tel"
          />
        </div>

        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
    </section>
  );
}

/* ── PasswordPanel ─────────────────────────────────────────── */
function PasswordPanel() {
  const { changePassword } = useAuth();

  const [form, setForm] = useState<ChangePasswordPayload & { confirmPassword: string }>({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [success,    setSuccess]    = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
    setError(null);
  };

  const validate = (): string | null => {
    if (!form.currentPassword)                          return 'Mot de passe actuel requis.';
    if (form.newPassword.length < 8)                    return 'Le nouveau mot de passe doit comporter au moins 8 caractères.';
    if (form.newPassword !== form.confirmPassword)      return 'Les mots de passe ne correspondent pas.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSubmitting(true);
    setError(null);
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(parseError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const pwStrength = (pw: string): number => {
    let s = 0;
    if (pw.length >= 8)           s++;
    if (/[A-Z]/.test(pw))         s++;
    if (/[0-9]/.test(pw))         s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    return s;
  };

  const strength = pwStrength(form.newPassword);
  const strengthLabels = ['', 'Faible', 'Moyen', 'Fort', 'Très fort'] as const;

  const mismatch =
    form.confirmPassword.length > 0 &&
    form.confirmPassword !== form.newPassword;

  return (
    <section
      id="panel-password"
      role="tabpanel"
      aria-labelledby="tab-password"
      className={styles.panel}
    >
      <h2 className={styles.panelTitle}>Changer le mot de passe</h2>

      {error   && <div className={styles.alertError}   role="alert" >{error}</div>}
      {success && <div className={styles.alertSuccess} role="status">Mot de passe modifié avec succès.</div>}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.fieldGroup}>
          <label htmlFor="currentPassword" className={styles.label}>
            Mot de passe actuel
          </label>
          <input
            id="currentPassword" name="currentPassword" type="password"
            className={styles.input}
            value={form.currentPassword} onChange={handleChange}
            autoComplete="current-password" required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="newPassword" className={styles.label}>
            Nouveau mot de passe
          </label>
          <input
            id="newPassword" name="newPassword" type="password"
            className={styles.input}
            value={form.newPassword} onChange={handleChange}
            autoComplete="new-password" required
            aria-describedby="pw-strength"
          />
          {form.newPassword.length > 0 && (
            <div
              id="pw-strength"
              className={styles.strengthBar}
              aria-label={`Force du mot de passe : ${strengthLabels[strength]}`}
            >
              {([1, 2, 3, 4] as const).map((i) => (
                <span
                  key={i}
                  className={`${styles.strengthSegment} ${
                    strength >= i ? styles[`strength${strength}` as keyof typeof styles] ?? '' : ''
                  }`}
                />
              ))}
              <span className={styles.strengthLabel}>
                {strengthLabels[strength]}
              </span>
            </div>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword" name="confirmPassword" type="password"
            className={`${styles.input} ${mismatch ? styles.inputError : ''}`}
            value={form.confirmPassword} onChange={handleChange}
            autoComplete="new-password" required
            aria-invalid={mismatch}
            aria-describedby={mismatch ? 'confirm-error' : undefined}
          />
          {mismatch && (
            <span id="confirm-error" className={styles.fieldError}>
              Les mots de passe ne correspondent pas.
            </span>
          )}
        </div>

        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={submitting || mismatch}
          aria-busy={submitting}
        >
          {submitting ? 'Modification…' : 'Modifier le mot de passe'}
        </button>
      </form>
    </section>
  );
}

/* ── OrdersPanel ───────────────────────────────────────────── */
const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING:    'En attente',
  CONFIRMED:  'Confirmée',
  PROCESSING: 'En traitement',
  SHIPPED:    'Expédiée',
  DELIVERED:  'Livrée',
  CANCELLED:  'Annulée',
};

function OrdersPanel() {
  const { orders, loading, error } = useOrders();

  if (loading) return <div className={styles.panelCenter}><Loading /></div>;
  if (error)   return <div className={styles.panelCenter}><Error message={parseError(error)} /></div>;

const list: OrderResponse[] = Array.isArray(orders)
  ? [...orders]
  : ((orders as unknown as { content?: OrderResponse[] })?.content ?? []);

  return (
    <section
      id="panel-orders"
      role="tabpanel"
      aria-labelledby="tab-orders"
      className={styles.panel}
    >
      <h2 className={styles.panelTitle}>Historique des commandes</h2>

      {list.length === 0 ? (
        <p className={styles.emptyState}>Aucune commande pour le moment.</p>
      ) : (
        <ul className={styles.orderList} aria-label="Liste des commandes">
          {list.map((order) => {
            const items = Array.isArray(order.items)
              ? (order.items as Record<string, unknown>[])
              : [];

            return (
              <li key={String(order.id)} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <span className={styles.orderId}>#{order.id as string}</span>
                  <span
                    className={`${styles.statusBadge} ${
                      styles[`status${order.status as string}` as keyof typeof styles] ?? ''
                    }`}
                  >
                    {ORDER_STATUS_LABELS[order.status as string] ?? String(order.status)}
                  </span>
                </div>

                <div className={styles.orderMeta}>
                  <span className={styles.orderDate}>
                    {order.createdAt
                      ? new Date(order.createdAt as string).toLocaleDateString('fr-FR')
                      : '—'}
                  </span>
                  <span className={styles.orderTotal}>
                    {typeof order.totalPrice === 'number'
                      ? `${(order.totalPrice as number).toFixed(2)} MAD`
                      : '—'}
                  </span>
                </div>

                {items.length > 0 && (
                  <ul className={styles.orderItems} aria-label="Articles">
                    {items.map((item, idx) => (
                      <li key={idx} className={styles.orderItem}>
                        <span className={styles.itemName}>
                          {String(item.productName ?? item.name ?? `Article ${idx + 1}`)}
                        </span>
                        <span className={styles.itemQty}>×{item.quantity as number}</span>
                        <span className={styles.itemPrice}>
                          {typeof item.unitPrice === 'number'
                            ? `${(item.unitPrice as number).toFixed(2)} MAD`
                            : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ── ProfilePage ───────────────────────────────────────────── */
export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('info');

  const handleLogout = useCallback(async () => {
    try { await logout(); } catch { /* redirect handled inside logout */ }
  }, [logout]);

  if (isLoading) {
    return (
      <main className={styles.root}>
        <div className={styles.center}><Loading /></div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={styles.root}>
        <div className={styles.center}>
          <Error message="Vous devez être connecté pour voir cette page." />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.root}>
      <header className={styles.pageHeader}>
        <div className={styles.headerInner}>
          <div className={styles.headerText}>
            <p className={styles.headerEyebrow}>Espace client</p>
            <h1 className={styles.pageTitle}>Mon compte</h1>
          </div>
          <button
            className={styles.btnLogout}
            onClick={handleLogout}
            aria-label="Se déconnecter"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Déconnexion
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <TabBar active={activeTab} onChange={setActiveTab} />
        </aside>
        <div className={styles.content}>
          {activeTab === 'info'     && <InfoPanel user={user} />}
          {activeTab === 'edit'     && <EditPanel user={user} onSaved={() => setActiveTab('info')} />}
          {activeTab === 'password' && <PasswordPanel />}
          {activeTab === 'orders'   && <OrdersPanel />}
        </div>
      </div>
    </main>
  );
}