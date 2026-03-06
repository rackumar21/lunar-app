import { C, F } from '../lib/constants';

// Toast — slides in at the top of the screen, auto-dismissed by App.jsx after 3.5s.
// type: 'error' (red) or 'success' (green)
const Toast = ({ message, type = 'error' }) => {
  if (!message) return null;

  const styles = {
    error: { bg: '#FEF2F2', border: '#FCA5A5', color: '#DC2626', icon: '⚠' },
    success: { bg: '#F0FDF4', border: '#86EFAC', color: '#16A34A', icon: '✓' },
  };
  const s = styles[type] ?? styles.error;

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 12,
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      maxWidth: 340,
      width: 'calc(100% - 40px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>{s.icon}</span>
      <p style={{ fontFamily: F.body, fontSize: 12, color: s.color, margin: 0, lineHeight: 1.4 }}>{message}</p>
    </div>
  );
};

export default Toast;
