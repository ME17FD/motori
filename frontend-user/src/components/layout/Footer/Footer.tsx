import React from "react";
import { FOOTER_LINKS } from "../../../constants";
import "../../../styles/components/Footer.css";

/**
 * Site footer with product and legal link columns plus copyright.
 */
const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__inner">

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

      <p className="footer__copyright">
        &copy; {new Date().getFullYear()} MotoShop. Tous droits réservés.
      </p>
    </footer>
  );
};

export default Footer;
