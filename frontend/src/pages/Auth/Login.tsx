import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import type { LoginRequest } from '../../types/auth';
import styles from '../../styles/pages/Login.module.css';

/**
 * Admin login page.
 * On success, useAuth redirects to /dashboard automatically.
 */
export default function LoginPage() {
  const { loginMutation } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>();

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data);
  };

  const apiError = loginMutation.error?.response?.data?.message;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logo}>Motori</span>
          <p className={styles.subtitle}>Backoffice administration</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          {/* Email */}
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              className={[styles.input, errors.email ? styles.inputError : ''].join(' ')}
              placeholder="admin@motori.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
              })}
            />
            {errors.email && (
              <span className={styles.errorMsg}>{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              className={[styles.input, errors.password ? styles.inputError : ''].join(' ')}
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <span className={styles.errorMsg}>{errors.password.message}</span>
            )}
          </div>

          {/* API error */}
          {apiError && (
            <div className={styles.apiError} role="alert">
              {apiError}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting || loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}