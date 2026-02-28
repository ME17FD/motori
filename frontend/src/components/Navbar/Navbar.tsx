import React, { useState } from "react";
import {
  FaMotorcycle,
  FaShoppingCart,
  FaUser,
  FaTimes,
  FaBars,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import "../../styles/Navbar/Navbar.css";
import type { NavbarProps, CategoryItemProps } from "./Navbar.types";
import type { NavCategory } from "../../types";

// ─── CategoryItem (internal sub-component) ───────────────────────────────────

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

// ─── Navbar ───────────────────────────────────────────────────────────────────

const Navbar: React.FC<NavbarProps> = ({ categories, onSearchSubmit }) => {
  const [search, setSearch]     = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearchSubmit?.(search);
  };

  return (
    <>
      <nav className="navbar" aria-label="Navigation principale">
        {/* Left */}
        <div className="navbar__left">
          <span
            className={`navbar__icon navbar__hamburger${menuOpen ? " navbar__hamburger--open" : ""}`}
            onClick={() => setMenuOpen((o) => !o)}
            role="button"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            tabIndex={0}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </span>
          <a href="/">
            <img src="/assets/logo.png" alt="Logo" className="navbar__logo" />
          </a>
        </div>

        {/* Search */}
        <div className="navbar__search" role="search">
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            aria-label="Rechercher un produit"
          />
          <span
            className="navbar__search-icon"
            onClick={() => onSearchSubmit?.(search)}
            role="button"
            aria-label="Lancer la recherche"
          >
            <FiSearch />
          </span>
        </div>

        {/* Right icons */}
        <div className="navbar__right">
          <span className="navbar__icon" role="button" aria-label="Mes motos">
            <FaMotorcycle />
          </span>
          <span className="navbar__icon" role="button" aria-label="Panier">
            <FaShoppingCart />
          </span>
          <span className="navbar__icon" role="button" aria-label="Mon compte">
            <FaUser />
          </span>
        </div>
      </nav>

      {/* Overlay */}
      <div
        className={`navbar__overlay${menuOpen ? " navbar__overlay--visible" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Side menu */}
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
              <a href="/shop" className="category-item__link">
                Tous les produits
              </a>
            </div>
          </li>
          {categories.map((cat) => (
            <CategoryItem key={cat.id} category={cat} depth={0} />
          ))}
        </ul>
      </aside>
    </>
  );
};

export default Navbar;
