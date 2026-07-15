export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 26,
        right: 26,
        background: 'oklch(20% 0.02 230)',
        color: '#fff',
        padding: '13px 20px',
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        boxShadow: '0 10px 30px -8px oklch(10% 0.02 230 / 0.5)',
        animation: 'toastIn .2s ease',
        zIndex: 100,
      }}
    >
      {message}
    </div>
  );
}
