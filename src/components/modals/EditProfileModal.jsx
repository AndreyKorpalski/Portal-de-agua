import ModalShell, { fieldLabelStyle, fieldInputStyle, cancelBtnStyle, confirmBtnStyle } from './ModalShell';

export default function EditProfileModal({
  width,
  draft,
  isAdmin,
  setName,
  setEmail,
  setPhone,
  setAddress,
  setUnit,
  close,
  save,
}) {
  return (
    <ModalShell width={width}>
      <div style={{ fontSize: 16, fontWeight: 800, color: 'oklch(18% 0.02 230)', marginBottom: 18 }}>
        {isAdmin ? 'Editar associado' : 'Meu perfil'}
      </div>
      <label style={fieldLabelStyle}>Nome completo</label>
      <input value={draft.name} onChange={setName} style={fieldInputStyle} />
      {isAdmin && (
        <>
          <label style={fieldLabelStyle}>Unidade</label>
          <input value={draft.unit} onChange={setUnit} style={fieldInputStyle} placeholder="Ex: Lote 24" />
        </>
      )}
      <label style={fieldLabelStyle}>E-mail</label>
      <input value={draft.email} onChange={setEmail} style={fieldInputStyle} />
      <label style={fieldLabelStyle}>Telefone</label>
      <input value={draft.phone} onChange={setPhone} style={fieldInputStyle} placeholder="(11) 90000-0000" />
      <label style={fieldLabelStyle}>Endereço</label>
      <input value={draft.address} onChange={setAddress} style={{ ...fieldInputStyle, marginBottom: 20 }} />
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={close} style={cancelBtnStyle}>
          Cancelar
        </button>
        <button onClick={save} style={confirmBtnStyle}>
          Salvar
        </button>
      </div>
    </ModalShell>
  );
}
