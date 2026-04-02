import React, { useState, useCallback, useMemo } from "react";
import styles from "../../styles/components/CartPage.module.css";
import { useNavigate, Link } from "react-router-dom";
import useCart from "../../hooks/useCart";
import useParts from "../../hooks/useParts";
import {
  calcSubtotal,
  calcLineTotal,
  calcDiscount,
  calcTax,
  calcShipping,
  calcTotal,
  validateCoupon,
  buildOrderRequest,
} from "../../services/cartService";
import type { CartItemDisplay } from "../../types/cart.types";
import Navbar from "../../components/layout/Navbar/Navbar";
import Footer from "../../components/layout/Footer/Footer";
import Button from "../../components/ui/Button/Button";
import Loading from "../../components/ui/Loading/Loading";
import Error from "../../components/ui/Error/Error";
import { MOCK_CATEGORIES } from "../../mocks/categories.mock";
import { CART_CONSTANTS } from "../../constants/cart.constants";

// ─── Empty state ─────────────────────────────────────────────
const EmptyCart: React.FC = () => (
  <div className={styles.empty}>
    <div className={styles.emptyIcon} aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M20 22h3l4 16h14l3-10H25"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="29" cy="42" r="1.5" fill="currentColor" />
        <circle cx="38" cy="42" r="1.5" fill="currentColor" />
      </svg>
    </div>

    <h2 className={styles.emptyTitle}>Votre panier est vide</h2>
    <p className={styles.emptyText}>
      Parcourez notre catalogue et ajoutez des pièces à votre panier.
    </p>

    <Link to="/parts" className={styles.emptyLink}>
      Voir le catalogue
    </Link>
  </div>
);

/**
 * Cart and checkout summary: merges `useCart` with `useParts` for labels/images, coupons, totals.
 */
const CartPage: React.FC = () => {
  const navigate = useNavigate();

  // Cart
  const { items, removeFromCart, clearCart, addToCart } = useCart();

  // Products
  const { parts, loading: partsLoading, error: partsError } = useParts({});

  // Join cart + product data
const displayItems = useMemo<CartItemDisplay[]>(() =>
  items.map((cartItem) => {
    const part = parts?.find((p) => p.id === cartItem.inventoryId);

    return {
      inventoryId: cartItem.inventoryId,
      quantity: cartItem.quantity,
      price: Number(cartItem.price),
      name: part?.name ?? "Produit inconnu",
      image: part?.image ?? "",
      stock: part?.stock ?? CART_CONSTANTS.MAX_QTY, // ✅ FIX HERE
    };
  }),
  [items, parts]
);

  // Coupon
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setApplied] = useState<{
    code: string;
    percent: number;
  } | null>(null);

  const handleApplyCoupon = useCallback(() => {
    const result = validateCoupon(coupon);

    if (result.valid) {
      setApplied({
        code: coupon.trim().toUpperCase(),
        percent: result.percent,
      });
      setCouponError(null);
    } else {
      setCouponError(result.error);
      setApplied(null);
    }
  }, [coupon]);

  // Totals
  const subtotal = calcSubtotal(items);
  const discount = appliedCoupon
    ? calcDiscount(subtotal, appliedCoupon.percent)
    : 0;
  const taxable = subtotal - discount;
  const taxes = calcTax(taxable);
  const shipping = calcShipping(taxable);
  const total = calcTotal(subtotal, discount, taxes, shipping);

  // Checkout
  const handleCheckout = useCallback(() => {
    if (!items.length) return;

    const payload = buildOrderRequest(items);
    console.log("Order payload:", payload);

    navigate("/checkout");
  }, [items, navigate]);

  // Quantity handlers
  const handleIncrease = useCallback(
    (item: CartItemDisplay) => {
      addToCart(item.inventoryId, 1, item.price);
    },
    [addToCart]
  );

  const handleDecrease = useCallback(
    (item: CartItemDisplay) => {
      if (item.quantity <= CART_CONSTANTS.MIN_QTY) return;
      addToCart(item.inventoryId, -1, item.price);
    },
    [addToCart]
  );

  const isEmpty = items.length === 0;

  // Loading
  if (partsLoading) {
    return (
      <>
        <Navbar categories={MOCK_CATEGORIES} />
        <div className={styles.statePage}>
          <Loading />
        </div>
        <Footer />
      </>
    );
  }

  // Error
  if (partsError) {
    return (
      <>
        <Navbar categories={MOCK_CATEGORIES} />
        <div className={styles.statePage}>
          <Error message={partsError} />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar categories={MOCK_CATEGORIES} />

      <main className={styles.page}>
        {/* Header */}
        <header className={styles.heading}>
          <div className={styles.headingInner}>
            <span className={styles.eyebrow}>Mon compte</span>
            <h1 className={styles.title}>Panier</h1>

            {!isEmpty && (
              <p className={styles.itemCount}>
                <span className={styles.itemCountNum}>
                  {items.length}
                </span>{" "}
                article{items.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className={styles.headingSlash} />
        </header>

        {/* Empty */}
        {isEmpty ? (
          <EmptyCart />
        ) : (
          <div className={styles.layout}>
            {/* Items */}
            <section className={styles.itemsSection}>
              <ul className={styles.itemList}>
                {displayItems.map((item) => {
                  const lineTotal = calcLineTotal(
                    item.price,
                    item.quantity
                  );

                  const maxQty = Math.min(
                    item.stock,
                    CART_CONSTANTS.MAX_QTY
                  );

                  return (
                    <li
                      key={item.inventoryId}
                      className={styles.itemRow}
                    >
                      {/* Image */}
                      <div className={styles.itemImage}>
                        <img
                          src={
                            item.image ||
                            "https://placehold.co/80x80?text=N/A"
                          }
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/80x80?text=N/A";
                          }}
                        />
                      </div>

                      {/* Meta */}
                      <div className={styles.itemMeta}>
                        <Link
                          to={`/parts/${item.inventoryId}`}
                          className={styles.itemName}
                        >
                          {item.name}
                        </Link>

                        {item.stock <= 5 && item.stock > 0 && (
                          <span className={styles.itemStockWarn}>
                            Stock limité : {item.stock}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className={styles.itemPrice}>
                        {item.price.toFixed(2)} DH
                      </div>

                      {/* Quantity */}
                      <div className={styles.itemQty}>
                        <button
                          onClick={() => handleDecrease(item)}
                          disabled={
                            item.quantity <=
                            CART_CONSTANTS.MIN_QTY
                          }
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() => handleIncrease(item)}
                          disabled={item.quantity >= maxQty}
                        >
                          +
                        </button>
                      </div>

                      {/* Total */}
                      <div className={styles.itemTotal}>
                        {lineTotal.toFixed(2)} DH
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() =>
                          removeFromCart(item.inventoryId)
                        }
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className={styles.cartActions}>
                <button onClick={clearCart}>
                  Vider le panier
                </button>

                <Link to="/parts">
                  ← Continuer mes achats
                </Link>
              </div>
            </section>

            {/* Summary */}
            <aside className={styles.summary}>
              <h2>Récapitulatif</h2>

              {/* Coupon */}
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Code promo"
              />

              <Button text="Appliquer" onClick={handleApplyCoupon} />

              {couponError && <p>{couponError}</p>}

              {/* Totals */}
              <div>
                <p>Sous-total: {subtotal.toFixed(2)} DH</p>

                {discount > 0 && (
                  <p>Remise: -{discount.toFixed(2)} DH</p>
                )}

                <p>TVA: {taxes.toFixed(2)} DH</p>

                <p>
                  Livraison:{" "}
                  {shipping === 0
                    ? "Gratuite"
                    : `${shipping.toFixed(2)} DH`}
                </p>

                <h3>Total: {total.toFixed(2)} DH</h3>
              </div>

              <Button
                text="Passer la commande"
                onClick={handleCheckout}
              />
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
};

export default CartPage;