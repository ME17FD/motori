import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaUser,
  FaTimes,
  FaBars,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import "../../../styles/components/Navbar.css";
import VehicleSelector from "../../shared/VehicleSelector/VehicleSelector";
import type { NavbarProps, CategoryItemProps } from "../../../types/ui/Navbar.types";
import type { NavCategory } from "../../../types";
import useCart from "../../../hooks/useCart";
import { ROUTES } from "../../../constants/routes";

/**
 * Recursive row for one category and its nested children in the mobile side menu.
 *
 * @param props.category - Tree node (label, href, optional children)
 * @param props.depth - Nesting level for indentation / typography
 */
const CategoryItem: React.FC<CategoryItemProps> = ({ category, depth = 0 }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = Boolean(category.children?.length);

  return (
    <li className={`category-item category-item--depth-${depth}`}>
      <div className="category-item__row">
        <a href={category.href} className="category-item__link">
          {category.label}
        </a>
        {hasChildren && (
          <span
            className="category-item__toggle"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen((o) => !o);
              }
            }}
          >
            {open ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        )}
      </div>

      {hasChildren && open && (
        <ul className="category-item__children">
          {category.children!.map((child) => (
            <CategoryItem key={child.id} category={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

/**
 * Sticky storefront navbar.
 *
 * - **Desktop:** “Catégories” opens a mega-panel (subcategories) without leaving the page feel.
 * - **Mobile:** hamburger + the same category tree in the slide-out drawer.
 * - **VehicleSelector:** global compatibility context; always reachable in the top bar.
 * - **Search:** enters the parts catalog with `?q=` so deep-links stay shareable.
 * - **Cart / user:** quick access; cart shows an item count badge from `useCart`.
 */
const Navbar: React.FC<NavbarProps> = ({ categories, onSearchSubmit }) => {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const userWrapRef = useRef<HTMLDivElement | null>(null);

  const submitSearch = useCallback(() => {
    const q = search.trim();
    onSearchSubmit?.(q);
    navigate(q ? `${ROUTES.PARTS}?q=${encodeURIComponent(q)}` : ROUTES.PARTS);
  }, [navigate, onSearchSubmit, search]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") submitSearch();
    },
    [submitSearch]
  );

  useEffect(() => {
    if (!userOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!userWrapRef.current?.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [userOpen]);

  return (
    <>
      <nav className="navbar" aria-label="Navigation principale">
        <div className="navbar__left">
          <span
            className={`navbar__icon navbar__hamburger${menuOpen ? " navbar__hamburger--open" : ""}`}
            onClick={() => setMenuOpen((o) => !o)}
            role="button"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setMenuOpen((o) => !o);
              }
            }}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </span>

          <Link to={ROUTES.HOME} className="navbar__logo-link" aria-label="Accueil">
            <img src="/assets/logo.png" alt="" className="navbar__logo" />
          </Link>

          {/* Desktop mega-menu — keeps category browsing fast without losing context */}
          <div
            className="navbar__mega-host navbar__desktop-only"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              type="button"
              className="navbar__mega-trigger"
              aria-expanded={megaOpen}
              aria-haspopup="true"
            >
              Catégories
              <FaChevronDown className="navbar__mega-chevron" aria-hidden />
            </button>

            {megaOpen ? (
              <div className="navbar__mega" role="region" aria-label="Aperçu des catégories">
                <div className="navbar__mega-inner">
                  {categories.slice(0, 8).map((cat: NavCategory) => (
                    <div key={cat.id} className="navbar__mega-col">
                      <a href={cat.href} className="navbar__mega-heading">
                        {cat.label}
                      </a>
                      <ul className="navbar__mega-list">
                        {(cat.children ?? []).slice(0, 6).map((child) => (
                          <li key={child.id}>
                            <a href={child.href} className="navbar__mega-link">
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                      <Link to={ROUTES.PARTS} className="navbar__mega-cta" onClick={() => setMegaOpen(false)}>
                        Voir le catalogue
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="navbar__vehicle">
          <VehicleSelector />
        </div>

        <div className="navbar__search" role="search">
          <input
            type="search"
            placeholder="Rechercher une pièce…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            aria-label="Rechercher une pièce"
          />
          <span
            className="navbar__search-icon"
            onClick={() => submitSearch()}
            role="button"
            aria-label="Lancer la recherche"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                submitSearch();
              }
            }}
          >
            <FiSearch />
          </span>
        </div>

        <div className="navbar__right">
          <Link className="navbar__icon-link navbar__cart-link" to={ROUTES.CART} aria-label="Panier">
            <FaShoppingCart />
            {totalItems > 0 ? (
              <span className="navbar__cart-badge">{totalItems > 99 ? "99+" : totalItems}</span>
            ) : null}
          </Link>

          <div className="navbar__user" ref={userWrapRef}>
            <button
              type="button"
              className="navbar__icon-btn"
              aria-label="Compte"
              aria-haspopup="menu"
              aria-expanded={userOpen}
              onClick={() => setUserOpen((v) => !v)}
            >
              <FaUser />
            </button>

            {userOpen ? (
              <div className="navbar__user-menu" role="menu">
                <Link to={ROUTES.LOGIN} role="menuitem" className="navbar__user-item" onClick={() => setUserOpen(false)}>
                  Connexion
                </Link>
                <Link
                  to={ROUTES.SIGNUP}
                  role="menuitem"
                  className="navbar__user-item"
                  onClick={() => setUserOpen(false)}
                >
                  Créer un compte
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      <div
        className={`navbar__overlay${menuOpen ? " navbar__overlay--visible" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`navbar__side-menu${menuOpen ? " navbar__side-menu--open" : ""}`}
        aria-label="Menu des catégories"
      >
        <div className="navbar__side-menu-header">
          <h6>Catégories</h6>
        </div>
        <ul className="category-list">
          <li className="category-item category-item--depth-0">
            <div className="category-item__row">
              <Link to={ROUTES.PARTS} className="category-item__link" onClick={() => setMenuOpen(false)}>
                Tous les produits
              </Link>
            </div>
          </li>
          {categories.map((cat: NavCategory) => (
            <CategoryItem key={cat.id} category={cat} depth={0} />
          ))}
        </ul>
      </aside>
    </>
  );
};

export default Navbar;
