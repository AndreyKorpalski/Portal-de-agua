import ModalShell, { fieldLabelStyle, fieldInputStyle, cancelBtnStyle, confirmBtnStyle } from './ModalShell';

export default function AddAdminModal({ width, newAdmin, setName, setEmail, setCargo, close, confirm }) {
  return (
    <ModalShell width={width}>
      <div style={{ fontSize: 16, fontWeight: 800, color: 'oklch(18% 0.02 230)', marginBottom: 18 }}>Adicionar administrador</div>
      <label style={fieldLabelStyle}>Nome completo</label>
      <input value={newAdmin.name} onChange={setName} style={fieldInputStyle} placeholder="Ex: Fernanda Rocha" />
      <label style={fieldLabelStyle}>E-mail</label>
      <input value={newAdmin.email} onChange={setEmail} style={fieldInputStyle} placeholder="email@exemplo.com" />
      <label style={fieldLabelStyle}>Cargo</label>
      <select value={newAdmin.cargo} onChange={setCargo} style={{ ...fieldInputStyle, marginBottom: 20 }}>
        <option>Administrador Geral</option>
        <option>Financeiro</option>
        <option>Operacional</option>
      </select>
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
