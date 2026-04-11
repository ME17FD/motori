import { useState, useCallback } from "react";
import styles from "../../styles/components/ProfilePage.module.css";
import  useAuth  from "../../hooks/useAuth";
import  useOrders  from "../../hooks/useOrders";
import  parseError  from "../../utils/parseError";
import Loading from "../../components/ui/Loading/Loading";
import Error from "../../components/ui/Error/Error";
 
/* ── Types ────────────────────────────────────────────────── */
type Tab = "info" | "edit" | "password" | "orders";
 
interface ProfileFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
 
interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
 
/* ── Sub-components ────────────────────────────────────────── */
 
function TabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "info", label: "Mon profil", icon: "👤" },
    { id: "edit", label: "Modifier", icon: "✏️" },
    { id: "password", label: "Mot de passe", icon: "🔒" },
    { id: "orders", label: "Commandes", icon: "📦" },
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
          className={`${styles.tab} ${active === t.id ? styles.tabActive : ""}`}
          onClick={() => onChange(t.id)}
        >
          <span className={styles.tabIcon} aria-hidden="true">
            {t.icon}
          </span>
          <span className={styles.tabLabel}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
 
function InfoPanel({ user }: { user: NonNullable<ReturnType<typeof useAuth>["user"]> }) {
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "?";
 
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
        <div className={styles.infoItem}>
          <dt className={styles.infoLabel}>Prénom</dt>
          <dd className={styles.infoValue}>{user.firstName || "—"}</dd>
        </div>
        <div className={styles.infoItem}>
          <dt className={styles.infoLabel}>Nom</dt>
          <dd className={styles.infoValue}>{user.lastName || "—"}</dd>
        </div>
        <div className={styles.infoItem}>
          <dt className={styles.infoLabel}>Email</dt>
          <dd className={styles.infoValue}>{user.email || "—"}</dd>
        </div>
        <div className={styles.infoItem}>
          <dt className={styles.infoLabel}>Téléphone</dt>
          <dd className={styles.infoValue}>{(user as any).phone || "—"}</dd>
        </div>
        <div className={styles.infoItem}>
          <dt className={styles.infoLabel}>Rôle</dt>
          <dd className={styles.infoValue}>
            <span className={styles.roleBadge}>
              {(user as any).roles?.[0] ?? "CLIENT"}
            </span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
 
function EditPanel({
  user,
  onSaved,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  onSaved: () => void;
}) {
  const { updateProfile } = useAuth();
 
  const [form, setForm] = useState<ProfileFormState>({
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    phone: (user as any).phone ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
    setError(null);
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Le prénom et le nom sont obligatoires.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateProfile?.(form);
      setSuccess(true);
      onSaved();
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
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
 
      {error && (
        <div className={styles.alertError} role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className={styles.alertSuccess} role="status">
          Profil mis à jour avec succès.
        </div>
      )}
 
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.formRow}>
          <div className={styles.fieldGroup}>
            <label htmlFor="firstName" className={styles.label}>
              Prénom
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              className={styles.input}
              value={form.firstName}
              onChange={handleChange}
              autoComplete="given-name"
              required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="lastName" className={styles.label}>
              Nom
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              className={styles.input}
              value={form.lastName}
              onChange={handleChange}
              autoComplete="family-name"
              required
            />
          </div>
        </div>
 
        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={styles.input}
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>
 
        <div className={styles.fieldGroup}>
          <label htmlFor="phone" className={styles.label}>
            Téléphone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={styles.input}
            value={form.phone}
            onChange={handleChange}
            autoComplete="tel"
          />
        </div>
 
        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </section>
  );
}
 
function PasswordPanel() {
  const { changePassword } = useAuth();
 
  const [form, setForm] = useState<PasswordFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
    setError(null);
  };
 
  const validate = (): string | null => {
    if (!form.currentPassword) return "Mot de passe actuel requis.";
    if (form.newPassword.length < 8) return "Le nouveau mot de passe doit avoir au moins 8 caractères.";
    if (form.newPassword !== form.confirmPassword) return "Les mots de passe ne correspondent pas.";
    return null;
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
 
    setLoading(true);
    setError(null);
    try {
      await changePassword?.({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };
 
  const strength = (pw: string): number => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    return s;
  };
 
  const pw = form.newPassword;
  const pwStrength = strength(pw);
 
  return (
    <section
      id="panel-password"
      role="tabpanel"
      aria-labelledby="tab-password"
      className={styles.panel}
    >
      <h2 className={styles.panelTitle}>Changer le mot de passe</h2>
 
      {error && (
        <div className={styles.alertError} role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className={styles.alertSuccess} role="status">
          Mot de passe modifié avec succès.
        </div>
      )}
 
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.fieldGroup}>
          <label htmlFor="currentPassword" className={styles.label}>
            Mot de passe actuel
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            className={styles.input}
            value={form.currentPassword}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>
 
        <div className={styles.fieldGroup}>
          <label htmlFor="newPassword" className={styles.label}>
            Nouveau mot de passe
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            className={styles.input}
            value={form.newPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
            aria-describedby="pw-strength"
          />
          {pw.length > 0 && (
            <div
              id="pw-strength"
              className={styles.strengthBar}
              aria-label={`Force du mot de passe: ${pwStrength}/4`}
            >
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`${styles.strengthSegment} ${
                    pwStrength >= i ? styles[`strength${pwStrength}`] : ""
                  }`}
                />
              ))}
              <span className={styles.strengthLabel}>
                {["", "Faible", "Moyen", "Fort", "Très fort"][pwStrength]}
              </span>
            </div>
          )}
        </div>
 
        <div className={styles.fieldGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className={`${styles.input} ${
              form.confirmPassword && form.confirmPassword !== form.newPassword
                ? styles.inputError
                : ""
            }`}
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
        </div>
 
        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Modification…" : "Modifier le mot de passe"}
        </button>
      </form>
    </section>
  );
}
 
const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En traitement",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};
 
function OrdersPanel() {
  const { orders, loading, error } = useOrders();
 
  if (loading) return <div className={styles.panelCenter}><Loading /></div>;
  if (error) return <div className={styles.panelCenter}><Error message={parseError(error)} /></div>;
 
  const list = Array.isArray(orders) ? orders : (orders as any)?.content ?? [];
 
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
          {list.map((order: any) => (
            <li key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span className={styles.orderId}>#{order.id}</span>
                <span
                  className={`${styles.statusBadge} ${
                    styles[`status${order.status}`]
                  }`}
                >
                  {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
 
              <div className={styles.orderMeta}>
                <span className={styles.orderDate}>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("fr-FR")
                    : "—"}
                </span>
                <span className={styles.orderTotal}>
                  {typeof order.totalAmount === "number"
                    ? `${order.totalAmount.toFixed(2)} MAD`
                    : "—"}
                </span>
              </div>
 
              {Array.isArray(order.items) && order.items.length > 0 && (
                <ul className={styles.orderItems} aria-label="Articles">
                  {order.items.map((item: any, idx: number) => (
                    <li key={idx} className={styles.orderItem}>
                      <span className={styles.itemName}>
                        {item.productName ?? item.name ?? `Article ${idx + 1}`}
                      </span>
                      <span className={styles.itemQty}>×{item.quantity}</span>
                      <span className={styles.itemPrice}>
                        {typeof item.unitPrice === "number"
                          ? `${item.unitPrice.toFixed(2)} MAD`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
 
/* ── Main Page ─────────────────────────────────────────────── */
export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("info");
 
  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch {
      // silent — redirect handled inside logout
    }
  }, [logout]);
 
  if (isLoading) {
    return (
      <main className={styles.root}>
        <div className={styles.center}>
          <Loading />
        </div>
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
      {/* ── Page header ── */}
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
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
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
 
      {/* ── Layout ── */}
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <TabBar active={activeTab} onChange={setActiveTab} />
        </aside>
 
        <div className={styles.content}>
          {activeTab === "info" && <InfoPanel user={user} />}
          {activeTab === "edit" && (
            <EditPanel user={user} onSaved={() => setActiveTab("info")} />
          )}
          {activeTab === "password" && <PasswordPanel />}
          {activeTab === "orders" && <OrdersPanel />}
        </div>
      </div>
    </main>
  );
}
 