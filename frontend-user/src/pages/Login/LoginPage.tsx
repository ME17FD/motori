import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  // ← added
import Navbar from "../../components/layout/Navbar/Navbar";
import Button from "../../components/ui/Button/Button";
import Footer from "../../components/layout/Footer/Footer";
import useAuth from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
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
 * Email/password login using `useAuth`; redirects to home on success.
 */
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, loading, error } = useAuth();
  const navigate = useNavigate();  // ← added

  const handleLogin = async () => {
    try {
      await login({ email, password });
      navigate(ROUTES.HOME, { replace: true });  // ← redirect on success
    } catch {
      // error is already set inside the hook
    }
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
              type="email"
              placeholder="xyz@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Adresse email"
            />
          </div>

          <div className="login-field">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Mot de passe"
            />
          </div>

          <span className="forgot">mot de passe oublié?</span>

          <div className="login-btn-wrap">
            <Button
              text={loading ? "Connexion…" : "Se connecter"}
              variant="outline"
              type="submit"
              onClick={handleLogin}
              disabled={loading}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;