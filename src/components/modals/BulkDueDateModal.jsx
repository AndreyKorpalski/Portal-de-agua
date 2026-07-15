import ModalShell, { fieldLabelStyle, fieldInputStyle, cancelBtnStyle, confirmBtnStyle } from './ModalShell';

export default function BulkDueDateModal({ width, bulkDueDate, setBulkDueDate, close, confirm }) {
  return (
    <ModalShell width={width}>
      <div style={{ fontSize: 16, fontWeight: 800, color: 'oklch(18% 0.02 230)', marginBottom: 6 }}>Alterar vencimento de todos</div>
      <p style={{ fontSize: 12.5, color: 'oklch(52% 0.01 230)', margin: '0 0 16px' }}>
        Aplica a nova data de vencimento a todos os associados
      </p>
      <label style={fieldLabelStyle}>Novo vencimento</label>
      <input
        value={bulkDueDate}
        onChange={setBulkDueDate}
        placeholder="Ex: 10/08"
        style={{ ...fieldInputStyle, marginBottom: 20 }}
      />
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={close} style={cancelBtnStyle}>
          Cancelar
        </button>
        <button onClick={confirm} style={confirmBtnStyle}>
          Aplicar
        </button>
      </div>
    </ModalShell>
  );
}
