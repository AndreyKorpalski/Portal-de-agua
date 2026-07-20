import ModalShell, { cancelBtnStyle } from './ModalShell';
import { TrashIcon } from '../icons';

export default function ConfirmModal({ width, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false, close, confirm }) {
  const confirmStyle = {
    flex: 1,
    background: danger ? 'oklch(50% 0.18 25)' : 'oklch(32% 0.08 220)',
    color: '#fff',
    border: 'none',
    borderRadius: 9,
    padding: 11,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  };

  return (
    <ModalShell width={width}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
        {danger && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'oklch(93% 0.05 25)',
              color: 'oklch(50% 0.18 25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <TrashIcon size={18} />
          </div>
        )}
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'oklch(18% 0.02 230)', marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 13.5, color: 'oklch(45% 0.02 230)', lineHeight: 1.5 }}>{message}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={close} style={cancelBtnStyle}>
          {cancelLabel}
        </button>
        <button onClick={confirm} style={confirmStyle}>
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}
