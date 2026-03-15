import Navbar from "../../components/Navbar/Navbar";
import Button from "../../components/Button/Button";
import Footer         from "../../components/Footer/Footer";
import useLogin from "../../hooks/useLogin";

import type { NavCategory } from "../../types";
import "./LoginPage.css";

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

// ─── LoginPage ────────────────────────────────────────────────────────────────

const LoginPage: React.FC = () => {

 const { email, setEmail, password, setPassword, errorMsg, handleLogin } = useLogin();
 
  return (
    <div className="page">

      {/* ── Navbar ── */}
      <Navbar
        categories={CATEGORIES}
        onSearchSubmit={(q: any) => console.log("Search:", q)}
      />

      {/* ── Login form ── */}
      <main className="login-section">
        <div className="login-card">
          <h2>Vous avez déjà un compte ?</h2>

          {errorMsg && <p className="form-error">{errorMsg}</p>}

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
              text="Se connecter"
              variant="outline"
              type="submit"
              onClick={handleLogin}
            />
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <Footer />

    </div>
  );
};

export default LoginPage;



