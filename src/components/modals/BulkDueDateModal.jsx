import ModalShell, { fieldLabelStyle, fieldInputStyle, cancelBtnStyle, confirmBtnStyle } from './ModalShell';

export default function BulkDueDateModal({ width, bulkDueDate, setBulkDueDate, close, confirm }) {
  return (
    <ModalShell width={width}>
      <div style={{ fontSize: 16, fontWeight: 800, color: 'oklch(18% 0.02 230)', marginBottom: 6 }}>Alterar vencimento de todos</div>
      <p style={{ fontSize: 12.5, color: 'oklch(52% 0.01 230)', margin: '0 0 12px' }}>
        Define o dia do mês em que a cobrança vence, pra todos os associados
      </p>
      <label style={fieldLabelStyle}>Novo dia de vencimento</label>
      <input
        value={bulkDueDate}
        onChange={setBulkDueDate}
        placeholder="Ex: 10"
        inputMode="numeric"
        style={{ ...fieldInputStyle, maxWidth: 90 }}
      />
      <p
        style={{
          fontSize: 12,
          color: 'oklch(45% 0.13 75)',
          background: 'oklch(97% 0.03 85)',
          border: '1px solid oklch(90% 0.06 85)',
          borderRadius: 8,
          padding: '10px 12px',
          margin: '14px 0 20px',
        }}
      >
        Isso só vale a partir da próxima cobrança gerada. As faturas pendentes deste mês não mudam de vencimento.
      </p>
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
