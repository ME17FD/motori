import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import type { LoginRequest } from '../../hooks/useAuth';
import styles from '../../styles/pages/Login.module.css';

/**
 * Admin login page.
 * Authenticates directly against Keycloak using Resource Owner Password flow.
 * No gateway involved — Keycloak URL is set via VITE_KEYCLOAK_URL env variable.
 */
export default function LoginPage() {
  const { loginMutation } = useAuth();

  const {
    register,     
    handleSubmit,
    formState: { errors },    
  } = useForm<LoginRequest>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logo}>Motori</span>
          <p className={styles.subtitle}>Backoffice administration</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          {/* Username */}
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className={[
                styles.input,
                errors.username ? styles.inputError : '',
              ].join(' ')}
              placeholder="backoffice-admin"
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && (
              <span className={styles.errorMsg}>{errors.username.message}</span>
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
              className={[
                styles.input,
                errors.password ? styles.inputError : '',
              ].join(' ')}
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <span className={styles.errorMsg}>{errors.password.message}</span>
            )}
          </div>

          {/* API error */}
          {loginMutation.isError && (
            <div className={styles.apiError} role="alert">
              {loginMutation.error?.message ?? 'Login failed. Check your credentials.'}
            </div>
          )}
          
          {/* Debug info in development 
          {import.meta.env.DEV && (
            <div style={{
              fontSize: 11,
              color: '#888',
              padding: '8px',
              background: '#f4f5f7',
              borderRadius: 6,
              fontFamily: 'monospace',
            }}>
              Keycloak: {import.meta.env.VITE_KEYCLOAK_URL}/realms/{import.meta.env.VITE_KEYCLOAK_REALM}
              <br />
              Client: {import.meta.env.VITE_KEYCLOAK_CLIENT_ID}
            </div>
          )}
          */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}