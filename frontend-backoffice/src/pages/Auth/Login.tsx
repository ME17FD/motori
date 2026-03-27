/**
 * LoginPage — Keycloak-backed authentication page.
 *
 * Form fields: username (email or Keycloak username), password
 * Validation: React Hook Form + Zod
 * On submit: delegates to useAuth().login()
 *
 * Post-login redirect:
 *   If the user navigated to a protected page before logging in,
 *   React Router stores the intended path in location.state.from.
 *   The useAuth hook redirects to /dashboard by default; to support
 *   the "from" redirect, the hook reads it from the store (future step).
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/pages/Login.module.css';

// ─── Validation schema ─────────────────────────────────────────────────────

const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Component ─────────────────────────────────────────────────────────────

export function LoginPage() {
  const navigate  = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  // Redirect already-authenticated users away from the login page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    await login({ username: data.username, password: data.password });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* ── Brand ──────────────────────────────────────────────── */}
        <div className={styles.brand}>
          <span className={styles.brandAccent}>M</span>otori
        </div>
        <p className={styles.subtitle}>Backoffice — Admin Access</p>

        {/* ── Server error banner ────────────────────────────────── */}
        {error && (
          <div className={styles.errorBanner} role="alert">
            <span>{error}</span>
            <button
              className={styles.errorDismiss}
              onClick={clearError}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* ── Form ───────────────────────────────────────────────── */}
        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {/* Username */}
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              autoFocus
              className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
              placeholder="admin@motori.com"
              {...register('username')}
              onChange={(e) => {
                clearError();
                register('username').onChange(e);
              }}
            />
            {errors.username && (
              <span className={styles.fieldError} role="alert">
                {errors.username.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="••••••••"
              {...register('password')}
              onChange={(e) => {
                clearError();
                register('password').onChange(e);
              }}
            />
            {errors.password && (
              <span className={styles.fieldError} role="alert">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.spinner} aria-hidden="true" />
            ) : null}
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className={styles.hint}>
          Motori Backoffice · Admin credentials required
        </p>
      </div>
    </div>
  );
}