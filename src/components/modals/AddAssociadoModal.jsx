import ModalShell, { fieldLabelStyle, fieldInputStyle, cancelBtnStyle, confirmBtnStyle } from './ModalShell';

export default function AddAssociadoModal({
  width,
  newAssociado,
  setName,
  setUnit,
  setEmail,
  setValue,
  close,
  confirm,
}) {
  return (
    <ModalShell width={width}>
      <div style={{ fontSize: 16, fontWeight: 800, color: 'oklch(18% 0.02 230)', marginBottom: 18 }}>Adicionar associado</div>
      <label style={fieldLabelStyle}>Nome completo</label>
      <input value={newAssociado.name} onChange={setName} style={fieldInputStyle} placeholder="Ex: Carlos Eduardo Lima" />
      <label style={fieldLabelStyle}>Unidade</label>
      <input value={newAssociado.unit} onChange={setUnit} style={fieldInputStyle} placeholder="Ex: Lote 24" />
      <label style={fieldLabelStyle}>E-mail</label>
      <input value={newAssociado.email} onChange={setEmail} style={fieldInputStyle} placeholder="email@exemplo.com" />
      <label style={fieldLabelStyle}>Valor mensal (R$)</label>
      <input
        type="number"
        step="0.01"
        value={newAssociado.value}
        onChange={setValue}
        style={{ ...fieldInputStyle, marginBottom: 20 }}
      />
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={close} style={cancelBtnStyle}>
          Cancelar
        </button>
        <button onClick={confirm} style={confirmBtnStyle}>
          Adicionar
        </button>
      </div>
    </ModalShell>
  );
}
