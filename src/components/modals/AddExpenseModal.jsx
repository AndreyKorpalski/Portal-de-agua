import ModalShell, { fieldLabelStyle, fieldInputStyle, cancelBtnStyle, confirmBtnStyle } from './ModalShell';

export default function AddExpenseModal({
  width,
  title,
  confirmLabel,
  newExpense,
  setDescription,
  setCategory,
  setValue,
  close,
  confirm,
}) {
  return (
    <ModalShell width={width}>
      <div style={{ fontSize: 16, fontWeight: 800, color: 'oklch(18% 0.02 230)', marginBottom: 18 }}>{title}</div>
      <label style={fieldLabelStyle}>Descrição</label>
      <input
        value={newExpense.description}
        onChange={setDescription}
        style={fieldInputStyle}
        placeholder="Ex: Manutenção da bomba"
      />
      <label style={fieldLabelStyle}>Categoria</label>
      <select value={newExpense.category} onChange={setCategory} style={fieldInputStyle}>
        <option value="Manutenção">Manutenção</option>
        <option value="Energia">Energia</option>
        <option value="Material">Material</option>
        <option value="Serviços">Serviços</option>
        <option value="Outros">Outros</option>
      </select>
      <label style={fieldLabelStyle}>Valor (R$)</label>
      <input type="number" step="0.01" value={newExpense.value} onChange={setValue} style={{ ...fieldInputStyle, marginBottom: 20 }} />
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={close} style={cancelBtnStyle}>
          Cancelar
        </button>
        <button onClick={confirm} style={confirmBtnStyle}>
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}
