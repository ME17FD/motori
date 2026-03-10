import React, { useState } from "react";
import { userService } from "../../services/userService";
import Navbar from "../../components/Navbar/Navbar";
import Button from "../../components/Button/Button";
import Footer         from "../../components/Footer/Footer";

import type { NavCategory } from "../../types";
import "./SignUpPage.css";

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

// ─── SignupPage ───────────────────────────────────────────────────────────────

const SignupPage: React.FC = () => {
  const [form, setForm] = useState({
    lastname:  "",
    firstname: "",
    email:     "",
    password:  "",
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSignup = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const newUser = await userService.createUser({
        firstname: form.firstname,
        lastname:  form.lastname,
        email:     form.email,
        phone:     "",
        adress:    "",
        approved:  false,
        activated: false,
      });
      console.log("User created:", newUser);
      setSuccess(true);
      // TODO: redirect to login e.g. navigate("/login")
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
        onSearchSubmit={(q: any) => console.log("Search:", q)}
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
              value={form.lastname}
              onChange={set("lastname")}
              aria-label="Nom de famille"
            />
          </div>

          <div className="signup-field">
            <input
              type="text"
              placeholder="Prénom"
              value={form.firstname}
              onChange={set("firstname")}
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
      <footer/>

    </div>
  );
};

export default SignupPage;