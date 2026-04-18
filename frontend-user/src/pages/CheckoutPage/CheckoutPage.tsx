import React, { useState, useCallback, useMemo } from "react";
import styles from "./CheckoutPage.module.css";
import { useNavigate } from "react-router-dom";
import useCart from "../../hooks/useCart";
import useAuth from "../../hooks/useAuth";
import useAsyncState from "../../hooks/useAsyncState";
import useParts from "../../hooks/useParts";
import { createOrder } from "../../services/orderService";
import { buildOrderRequest } from "../../services/cartService";
import { calcSubtotal, calcTax, calcShipping, calcTotal } from "../../services/cartService";
import { CART_CONSTANTS } from "../../constants/cart.constants";
import type { CartItemDisplay } from "../../types/cart.types";
import type { OrderResponse } from "../../types/order.types";
import Navbar from "../../components/layout/Navbar/Navbar";
import Footer from "../../components/layout/Footer/Footer";
import Button from "../../components/ui/Button/Button";
import Loading from "../../components/ui/Loading/Loading";
import Error from "../../components/ui/Error/Error";
import { MOCK_CATEGORIES } from "../../mocks/categories.mock";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
}

type PaymentMethod = "cash" | "card" | "transfer";

const EMPTY_SHIPPING: ShippingForm = {
  firstName: "",
  lastName:  "",
  email:     "",
  phone:     "",
  address:   "",
  city:      "",
  zip:       "",
};

const STEPS = ["Panier", "Livraison", "Paiement", "Confirmation"] as const;
type Step = 0 | 1 | 2 | 3;

// ─── Sub-components ───────────────────────────────────────────────────────────

// Stepper
const Stepper: React.FC<{ current: Step }> = ({ current }) => (
  <nav className={styles.stepper} aria-label="Étapes de la commande">
    {STEPS.map((label, i) => {
      const done    = i < current;
      const active  = i === current;
      return (
        <React.Fragment key={label}>
          <div className={`${styles.step} ${done ? styles.stepDone : ""} ${active ? styles.stepActive : ""}`}>
            <div className={styles.stepCircle} aria-current={active ? "step" : undefined}>
              {done ? (
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <polyline points="3,8 7,12 13,4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className={styles.stepLabel}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`${styles.stepConnector} ${done ? styles.stepConnectorDone : ""}`} aria-hidden="true" />
          )}
        </React.Fragment>
      );
    })}
  </nav>
);

// Order confirmed
const Confirmed: React.FC<{ order: OrderResponse; onNewOrder: () => void }> = ({ order, onNewOrder }) => (
  <div className={styles.confirmed}>
    <div className={styles.confirmedIcon} aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.5" />
        <polyline points="20,32 28,40 44,24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <h2 className={styles.confirmedTitle}>Commande confirmée !</h2>
    <p className={styles.confirmedSub}>
      Merci pour votre commande. Vous recevrez une confirmation par e-mail.
    </p>
    <div className={styles.confirmedId}>
      <span className={styles.confirmedIdLabel}>Référence commande</span>
      <span className={styles.confirmedIdVal}>{order.id}</span>
    </div>
    <div className={styles.confirmedMeta}>
      <div className={styles.confirmedMetaItem}>
        <span className={styles.confirmedMetaLabel}>Total</span>
        <span className={styles.confirmedMetaVal}>{order.totalPrice.toFixed(2)} DH</span>
      </div>
      <div className={styles.confirmedMetaItem}>
        <span className={styles.confirmedMetaLabel}>Statut</span>
        <span className={`${styles.confirmedMetaVal} ${styles.confirmedStatus}`}>{order.status}</span>
      </div>
      <div className={styles.confirmedMetaItem}>
        <span className={styles.confirmedMetaLabel}>Date</span>
        <span className={styles.confirmedMetaVal}>
          {new Date(order.createdAt).toLocaleDateString("fr-MA", {
            day: "numeric", month: "long", year: "numeric",
          })}
        </span>
      </div>
    </div>
    <div className={styles.confirmedActions}>
      <Button text="Voir mes commandes" variant="primary" onClick={() => window.location.href = "/orders"} ariaLabel="Voir mes commandes" />
      <Button text="Nouvelle commande"  variant="secondary" onClick={onNewOrder} ariaLabel="Nouvelle commande" />
    </div>
  </div>
);

// ─── CheckoutPage ─────────────────────────────────────────────────────────────

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();

  // ── Data ──
  const { items, clearCart }          = useCart();
  const { user, isAuthenticated }     = useAuth();
  const { parts }                     = useParts({});
  const orderAsync                    = useAsyncState<OrderResponse | null>(null);

  // ── Steps ──
  const [step, setStep] = useState<Step>(0);

  // ── Shipping form ──
  const [shipping, setShipping] = useState<ShippingForm>({
    ...EMPTY_SHIPPING,
    firstName: user?.firstName ?? "",
    lastName:  user?.lastName  ?? "",
    email:     user?.email     ?? "",
    phone:     user?.phone     ?? "",
    address:   user?.adress    ?? "",
  });
  const [shippingErrors, setShippingErrors] = useState<Partial<ShippingForm>>({});

  // ── Payment ──
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  // ── Join items ──
  const displayItems = useMemo<CartItemDisplay[]>(() =>
    items.map((cartItem) => {
      const part = parts.find((p) => p.id === cartItem.inventoryId);
      return {
        inventoryId: cartItem.inventoryId,
        quantity:    cartItem.quantity,
        price:       cartItem.price,
        name:        part?.name  ?? "Produit inconnu",
        image:       part?.image ?? "",
        stock:       part?.stock ?? 0,
      };
    }),
    [items, parts]
  );

  // ── Totals ──
  const subtotal = calcSubtotal(items);
  const taxes    = calcTax(subtotal);
  const shipping_cost = calcShipping(subtotal);
  const total    = calcTotal(subtotal, 0, taxes, shipping_cost);

  // ─────────────────────────────────────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────────────────────────────────────

  const validateShipping = useCallback((): boolean => {
    const errors: Partial<ShippingForm> = {};
    if (!shipping.firstName.trim()) errors.firstName = "Requis";
    if (!shipping.lastName.trim())  errors.lastName  = "Requis";
    if (!shipping.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email))
      errors.email = "Email invalide";
    if (!shipping.phone.trim())   errors.phone   = "Requis";
    if (!shipping.address.trim()) errors.address = "Requis";
    if (!shipping.city.trim())    errors.city    = "Requis";
    if (!shipping.zip.trim())     errors.zip     = "Requis";
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  }, [shipping]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────────────────────────────────────

  const goNext = useCallback(() => {
    if (step === 1 && !validateShipping()) return;
    setStep((s) => Math.min(3, s + 1) as Step);
  }, [step, validateShipping]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1) as Step);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Submit order
  // ─────────────────────────────────────────────────────────────────────────────

  const handlePlaceOrder = useCallback(async () => {
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }
    orderAsync.setLoading();
    try {
      const payload  = buildOrderRequest(items);
      const response = await createOrder(user.id, payload);
      orderAsync.setSuccess(response);
      clearCart();
      setStep(3);
    } catch (err) {
      orderAsync.setError(err, "Une erreur est survenue lors de la commande.");
    }
  }, [isAuthenticated, user, items, clearCart, navigate, orderAsync]);

  const handleNewOrder = useCallback(() => {
    navigate("/parts");
  }, [navigate]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Field helpers
  // ─────────────────────────────────────────────────────────────────────────────

  const handleShippingChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
    setShippingErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Guards
  // ─────────────────────────────────────────────────────────────────────────────

  if (items.length === 0 && step !== 3) {
    return (
      <>
        <Navbar categories={MOCK_CATEGORIES} />
        <div className={styles.statePage}>
          <p className={styles.emptyMsg}>Votre panier est vide.</p>
          <Button text="Voir le catalogue" variant="primary" onClick={() => navigate("/parts")} ariaLabel="Voir le catalogue" />
        </div>
        <Footer />
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      <Navbar categories={MOCK_CATEGORIES} />

      <main className={styles.page} aria-label="Commande">

        {/* ── Heading ── */}
        <header className={styles.heading}>
          <div className={styles.headingInner}>
            <span className={styles.eyebrow}>Boutique</span>
            <h1 className={styles.title}>Finaliser la commande</h1>
          </div>
          <div className={styles.headingSlash} aria-hidden="true" />
        </header>

        {/* ── Stepper ── */}
        <div className={styles.stepperWrap}>
          <Stepper current={step} />
        </div>

        {/* ── Body ── */}
        <div className={styles.body}>

          {/* ══ Step 0 — Cart review ══ */}
          {step === 0 && (
            <section className={styles.stepSection} aria-label="Révision du panier">
              <h2 className={styles.stepTitle}>Votre panier</h2>

              <ul className={styles.reviewList} role="list">
                {displayItems.map((item) => (
                  <li key={item.inventoryId} className={styles.reviewItem}>
                    <div className={styles.reviewImage}>
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => { e.currentTarget.src = "https://placehold.co/64x64?text=N/A"; }}
                      />
                    </div>
                    <div className={styles.reviewMeta}>
                      <span className={styles.reviewName}>{item.name}</span>
                    </div>
                    <span className={styles.reviewQty}>× {item.quantity}</span>
                    <span className={styles.reviewPrice}>
                      {(item.price * item.quantity).toFixed(2)} DH
                    </span>
                  </li>
                ))}
              </ul>

              <div className={styles.reviewTotals}>
                <div className={styles.reviewTotalRow}>
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} DH</span>
                </div>
                <div className={styles.reviewTotalRow}>
                  <span>TVA ({(CART_CONSTANTS.TAX_RATE * 100).toFixed(0)}%)</span>
                  <span>{taxes.toFixed(2)} DH</span>
                </div>
                <div className={styles.reviewTotalRow}>
                  <span>Livraison</span>
                  <span>{shipping_cost === 0 ? "Gratuite" : `${shipping_cost.toFixed(2)} DH`}</span>
                </div>
                <div className={`${styles.reviewTotalRow} ${styles.reviewGrandTotal}`}>
                  <span>Total TTC</span>
                  <span>{total.toFixed(2)} DH</span>
                </div>
              </div>
            </section>
          )}

          {/* ══ Step 1 — Shipping ══ */}
          {step === 1 && (
            <section className={styles.stepSection} aria-label="Informations de livraison">
              <h2 className={styles.stepTitle}>Adresse de livraison</h2>

              <div className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="firstName">Prénom</label>
                    <input
                      id="firstName" name="firstName"
                      className={`${styles.input} ${shippingErrors.firstName ? styles.inputError : ""}`}
                      value={shipping.firstName}
                      onChange={handleShippingChange}
                      placeholder="Prénom"
                      autoComplete="given-name"
                    />
                    {shippingErrors.firstName && <span className={styles.fieldError}>{shippingErrors.firstName}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="lastName">Nom</label>
                    <input
                      id="lastName" name="lastName"
                      className={`${styles.input} ${shippingErrors.lastName ? styles.inputError : ""}`}
                      value={shipping.lastName}
                      onChange={handleShippingChange}
                      placeholder="Nom de famille"
                      autoComplete="family-name"
                    />
                    {shippingErrors.lastName && <span className={styles.fieldError}>{shippingErrors.lastName}</span>}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="email">Email</label>
                    <input
                      id="email" name="email" type="email"
                      className={`${styles.input} ${shippingErrors.email ? styles.inputError : ""}`}
                      value={shipping.email}
                      onChange={handleShippingChange}
                      placeholder="email@exemple.com"
                      autoComplete="email"
                    />
                    {shippingErrors.email && <span className={styles.fieldError}>{shippingErrors.email}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="phone">Téléphone</label>
                    <input
                      id="phone" name="phone" type="tel"
                      className={`${styles.input} ${shippingErrors.phone ? styles.inputError : ""}`}
                      value={shipping.phone}
                      onChange={handleShippingChange}
                      placeholder="+212 6XX XXX XXX"
                      autoComplete="tel"
                    />
                    {shippingErrors.phone && <span className={styles.fieldError}>{shippingErrors.phone}</span>}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="address">Adresse</label>
                  <input
                    id="address" name="address"
                    className={`${styles.input} ${shippingErrors.address ? styles.inputError : ""}`}
                    value={shipping.address}
                    onChange={handleShippingChange}
                    placeholder="Rue, N°, Quartier"
                    autoComplete="street-address"
                  />
                  {shippingErrors.address && <span className={styles.fieldError}>{shippingErrors.address}</span>}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="city">Ville</label>
                    <input
                      id="city" name="city"
                      className={`${styles.input} ${shippingErrors.city ? styles.inputError : ""}`}
                      value={shipping.city}
                      onChange={handleShippingChange}
                      placeholder="Casablanca"
                      autoComplete="address-level2"
                    />
                    {shippingErrors.city && <span className={styles.fieldError}>{shippingErrors.city}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="zip">Code postal</label>
                    <input
                      id="zip" name="zip"
                      className={`${styles.input} ${shippingErrors.zip ? styles.inputError : ""}`}
                      value={shipping.zip}
                      onChange={handleShippingChange}
                      placeholder="20000"
                      autoComplete="postal-code"
                    />
                    {shippingErrors.zip && <span className={styles.fieldError}>{shippingErrors.zip}</span>}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ══ Step 2 — Payment ══ */}
          {step === 2 && (
            <section className={styles.stepSection} aria-label="Mode de paiement">
              <h2 className={styles.stepTitle}>Mode de paiement</h2>

              <div className={styles.paymentOptions} role="radiogroup" aria-label="Choisir le mode de paiement">

                {(["cash", "card", "transfer"] as PaymentMethod[]).map((method) => {
                  const labels: Record<PaymentMethod, { title: string; sub: string; icon: string }> = {
                    cash:     { title: "Paiement à la livraison", sub: "Payez en espèces à la réception",   icon: "💵" },
                    card:     { title: "Carte bancaire",          sub: "Visa, Mastercard — paiement sécurisé", icon: "💳" },
                    transfer: { title: "Virement bancaire",       sub: "Coordonnées envoyées par email",    icon: "🏦" },
                  };
                  const { title, sub, icon } = labels[method];
                  const selected = paymentMethod === method;

                  return (
                    <button
                      key={method}
                      role="radio"
                      aria-checked={selected}
                      className={`${styles.paymentOption} ${selected ? styles.paymentOptionSelected : ""}`}
                      onClick={() => setPaymentMethod(method)}
                    >
                      <span className={styles.paymentIcon}>{icon}</span>
                      <span className={styles.paymentInfo}>
                        <span className={styles.paymentTitle}>{title}</span>
                        <span className={styles.paymentSub}>{sub}</span>
                      </span>
                      <span className={styles.paymentRadio} aria-hidden="true">
                        {selected ? "◉" : "○"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Order summary recap */}
              <div className={styles.paymentSummary}>
                <h3 className={styles.paymentSummaryTitle}>Récapitulatif</h3>
                <div className={styles.reviewTotalRow}>
                  <span>Sous-total</span><span>{subtotal.toFixed(2)} DH</span>
                </div>
                <div className={styles.reviewTotalRow}>
                  <span>TVA</span><span>{taxes.toFixed(2)} DH</span>
                </div>
                <div className={styles.reviewTotalRow}>
                  <span>Livraison</span>
                  <span>{shipping_cost === 0 ? "Gratuite" : `${shipping_cost.toFixed(2)} DH`}</span>
                </div>
                <div className={`${styles.reviewTotalRow} ${styles.reviewGrandTotal}`}>
                  <span>Total TTC</span><span>{total.toFixed(2)} DH</span>
                </div>

                {orderAsync.state.error && (
                  <div className={styles.orderError}>
                    <Error message={orderAsync.state.error} />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ══ Step 3 — Confirmed ══ */}
          {step === 3 && orderAsync.state.data && (
            <Confirmed order={orderAsync.state.data} onNewOrder={handleNewOrder} />
          )}

          {/* ── Navigation buttons ── */}
          {step < 3 && (
            <div className={styles.navButtons}>
              {step > 0 && (
                <Button
                  text="← Retour"
                  variant="secondary"
                  onClick={goBack}
                  ariaLabel="Étape précédente"
                  disabled={orderAsync.state.loading}
                />
              )}

              <div className={styles.navRight}>
                {step < 2 && (
                  <Button
                    text="Continuer →"
                    variant="primary"
                    onClick={goNext}
                    ariaLabel="Étape suivante"
                  />
                )}

                {step === 2 && (
                  <Button
                    text={orderAsync.state.loading ? "Traitement…" : "Passer la commande"}
                    variant="primary"
                    onClick={handlePlaceOrder}
                    ariaLabel="Confirmer la commande"
                    disabled={orderAsync.state.loading}
                  />
                )}
              </div>
            </div>
          )}

          {orderAsync.state.loading && (
            <div className={styles.loadingOverlay} aria-live="polite" aria-busy="true">
              <Loading />
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;