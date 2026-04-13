/** 403 — user is authenticated but lacks the ADMIN role */
import { useNavigate } from 'react-router-dom';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <h1 style={{ fontSize: 48, margin: 0, color: '#c1121f' }}>403</h1>
      <p style={{ color: '#5c5c5c', margin: 0 }}>
        You do not have permission to access this page.
      </p>
      <button
        onClick={() => navigate('/login', { replace: true })}
        style={{ padding: '8px 24px', background: '#c1121f', color: '#fff',
          border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
      >
        Back to Login
      </button>
    </div>
  );
}