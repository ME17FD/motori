import React from "react";
import { FOOTER_LINKS } from "../../constants/index";

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: "600",
  fontSize: "15px",
};

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: "#c0392b",
        padding: "48px 32px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          gap: "64px",
          flexWrap: "wrap",
        }}
      >
        {/* Produits */}
        <div style={{ minWidth: "200px" }}>
          <h3
            style={{
              color: "#fff",
              fontWeight: "800",
              fontSize: "18px",
              marginBottom: "16px",
            }}
          >
            Produits
          </h3>

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {FOOTER_LINKS.produits.map((link) => (
              <li key={link.href} style={{ marginBottom: "10px" }}>
                <a href={link.href} style={linkStyle}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Liens Utiles */}
        <div style={{ minWidth: "200px" }}>
          <h3
            style={{
              color: "#fff",
              fontWeight: "800",
              fontSize: "18px",
              marginBottom: "16px",
            }}
          >
            Liens Utiles
          </h3>

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {FOOTER_LINKS.liensUtiles.map((link) => (
              <li key={link.href} style={{ marginBottom: "10px" }}>
                <a href={link.href} style={linkStyle}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <p
        style={{
          color: "rgba(255,255,255,0.7)",
          textAlign: "center",
          fontSize: "13px",
          marginTop: "40px",
          marginBottom: 0,
          fontFamily: "Assistant, sans-serif",
        }}
      >
        &copy; {new Date().getFullYear()} MotoShop. Tous droits réservés.
      </p>
    </footer>
  );
};

export default Footer;