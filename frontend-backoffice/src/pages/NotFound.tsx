/** 404 — route does not exist */
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <h1 style={{ fontSize: 48, margin: 0, color: '#c1121f' }}>404</h1>
      <p style={{ color: '#5c5c5c', margin: 0 }}>Page not found.</p>
      <button
        onClick={() => navigate('/dashboard', { replace: true })}
        style={{ padding: '8px 24px', background: '#111', color: '#fff',
          border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
      >
        Go to Dashboard
      </button>
    </div>
  );
}