/**
 * Application Footer Component
 * Displays footer with product links, useful links, and copyright information.
 * Layout: Two-column structure (Produits, Liens Utiles)
 * Links are defined in constants/index.ts and dynamically rendered.
 */

import React from "react";
import { FOOTER_LINKS } from "../../constants/index";
import "../../styles/Footer/Footer.css";

/**
 * Footer component rendered on all pages.
 */
const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__inner">

        {/* Produits */}
        <div className="footer__column">
          <h3 className="footer__title">Produits</h3>
          <ul className="footer__list">
            {FOOTER_LINKS.produits.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="footer__link">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Liens Utiles */}
        <div className="footer__column">
          <h3 className="footer__title">Liens Utiles</h3>
          <ul className="footer__list">
            {FOOTER_LINKS.liensUtiles.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="footer__link">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Copyright */}
      <p className="footer__copyright">
        &copy; {new Date().getFullYear()} MotoShop. Tous droits réservés.
      </p>
    </footer>
  );
};

export default Footer;