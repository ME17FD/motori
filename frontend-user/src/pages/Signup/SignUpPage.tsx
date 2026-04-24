import React, { useState } from "react";
import authService from "../../services/authService";
import { useNavigate } from "react-router-dom"; 
import Navbar from "../../components/layout/Navbar/Navbar";
import Button from "../../components/ui/Button/Button";
import Footer from "../../components/layout/Footer/Footer";
import { ROUTES } from "../../constants/routes";

import type { NavCategory } from "../../types";
import "../../styles/components/SignUpPage.css";

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
 * Registration form calling `authService.signup`, then redirecting to login.
 */
const SignupPage: React.FC = () => {
  const [form, setForm] = useState({
    lastName:  "",
    firstName: "",
    email:     "",
    password:  "",
    phone:     "",
    address:   "",
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, setLoading] = useState(false);
  const [success, setSuccess]   = useState(false);
  const navigate = useNavigate();

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSignup = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await authService.signup({
        firstname: form.firstName,
        lastname: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        adress: form.address,
      });
      console.log("User created:", form.email);
      setSuccess(true);
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">

      {/* ── Navbar ── */}
      <Navbar
        categories={CATEGORIES}
        onSearchSubmit={(q: string) => console.log("Search:", q)}
      />

      {/* ── Signup form ── */}
      <main className="signup-section">
        <div className="signup-card">
          <h2>Vous avez déjà un compte ?</h2>

          {errorMsg && <p className="form-error">{errorMsg}</p>}
          {success  && <p className="form-success">Compte créé avec succès !</p>}

          <div className="signup-field">
            <input
              type="text"
              placeholder="Nom de famille"
              value={form.lastName}
              onChange={set("lastName")}
              aria-label="Nom de famille"
            />
          </div>

          <div className="signup-field">
            <input
              type="text"
              placeholder="Prénom"
              value={form.firstName}
              onChange={set("firstName")}
              aria-label="Prénom"
            />
          </div>

          <div className="signup-field">
            <input
              type="email"
              placeholder="xyz@gmail.com"
              value={form.email}
              onChange={set("email")}
              aria-label="Adresse email"
            />
          </div>

          <div className="signup-field">
            <input
              type="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={set("password")}
              aria-label="Mot de passe"
            />
          </div>

          <div className="signup-btn-wrap">
            <Button
              text="S'inscrire"
              variant="outline"
              type="submit"
              onClick={handleSignup}
            />
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <Footer />

    </div>
  );
};

export default SignupPage;