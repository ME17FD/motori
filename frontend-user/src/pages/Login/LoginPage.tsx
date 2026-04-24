import React, { useState } from "react";
import Navbar from "../../components/layout/Navbar/Navbar";
import Button from "../../components/ui/Button/Button";
import Footer from "../../components/layout/Footer/Footer";
import useAuth from "../../hooks/useAuth";
import type { NavCategory } from "../../types";
import "../../styles/components/LoginPage.css";

// ─── Sample categories ────────────────────────────────────────────────────────
const CATEGORIES: NavCategory[] = [
  {
    id: 1,
    label: "Casques",
    href: "/casques",
    children: [
      { id: 11, label: "Intégraux", href: "/casques/integraux" },
      { id: 12, label: "Modulables", href: "/casques/modulables" },
    ],
  },
  { id: 2, label: "Équipements", href: "/equipements" },
  { id: 3, label: "Consomables", href: "/consomables" },
  { id: 4, label: "Divers", href: "/divers" },
];

/**
 * Username/password login using `useAuth`.
 * Navigation and error handling are fully delegated to the hook.
 */
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoading, error, clearError } = useAuth();

  const handleLogin = async () => {
    await login({ email, password });
  };

  return (
    <div className="page">
      <Navbar
        categories={CATEGORIES}
        onSearchSubmit={(q: string) => console.log("Search:", q)}
      />
      <main className="login-section">
        <div className="login-card">
          <h2>Vous avez déjà un compte ?</h2>

          {error && <p className="form-error">{error}</p>}

          <div className="login-field">
            <input
              type="text"
              placeholder="Adresse e-mail"
              value={email}
              onChange={(e) => {
                clearError();
                setEmail(e.target.value);
              }}
              aria-label="Adresse e-mail"
              autoComplete="username"
            />
          </div>

          <div className="login-field">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => {
                clearError();
                setPassword(e.target.value);
              }}
              aria-label="Mot de passe"
              autoComplete="current-password"
            />
          </div>

          <span className="forgot">mot de passe oublié?</span>

          <div className="login-btn-wrap">
            <Button
              text={isLoading ? "Connexion…" : "Se connecter"}
              variant="outline"
              type="submit"
              onClick={handleLogin}
              disabled={isLoading}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;