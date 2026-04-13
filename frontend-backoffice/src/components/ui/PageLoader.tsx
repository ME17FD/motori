/** Full-page spinner used as Suspense fallback during lazy route loading */
export function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '60vh' }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid #e0e0e0',
        borderTopColor: '#c1121f',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}