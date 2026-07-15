export default function ModalShell({ width, children }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'oklch(15% 0.01 230 / 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div style={{ background: '#fff', borderRadius: 16, padding: 26, width, maxWidth: '92vw', animation: 'fadeUp .15s ease' }}>
        {children}
      </div>
    </div>
  );
}

export const fieldLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: 'oklch(40% 0.02 230)',
  display: 'block',
  marginBottom: 5,
};

export const fieldInputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1.5px solid oklch(89% 0.01 230)',
  borderRadius: 9,
  padding: '10px 12px',
  fontSize: 13.5,
  marginBottom: 12,
};

export const cancelBtnStyle = {
  flex: 1,
  background: '#fff',
  border: '1.5px solid oklch(89% 0.01 230)',
  borderRadius: 9,
  padding: 11,
  fontSize: 13,
  fontWeight: 700,
  color: 'oklch(35% 0.02 230)',
  cursor: 'pointer',
};

export const confirmBtnStyle = {
  flex: 1,
  background: 'oklch(32% 0.08 220)',
  color: '#fff',
  border: 'none',
  borderRadius: 9,
  padding: 11,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};
