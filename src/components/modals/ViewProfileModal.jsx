import ModalShell from './ModalShell';

export default function ViewProfileModal({ width, data, close, edit }) {
  if (!data) return null;
  return (
    <ModalShell width={width}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'oklch(92% 0.02 220)',
            color: 'oklch(35% 0.08 220)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
            fontWeight: 700,
            flex: 'none',
          }}
        >
          {data.initials}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'oklch(18% 0.02 230)' }}>{data.name}</div>
          <div style={{ fontSize: 12, color: 'oklch(55% 0.01 230)' }}>{data.unit}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'oklch(52% 0.01 230)', marginBottom: 3 }}>E-mail</div>
          <div style={{ fontSize: 13.5, color: 'oklch(20% 0.02 230)' }}>{data.email}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'oklch(52% 0.01 230)', marginBottom: 3 }}>Telefone</div>
          <div style={{ fontSize: 13.5, color: 'oklch(20% 0.02 230)' }}>{data.phone}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'oklch(52% 0.01 230)', marginBottom: 3 }}>Endereço</div>
          <div style={{ fontSize: 13.5, color: 'oklch(20% 0.02 230)' }}>{data.address}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={close}
          style={{
            flex: 1,
            background: '#fff',
            border: '1.5px solid oklch(89% 0.01 230)',
            borderRadius: 9,
            padding: 11,
            fontSize: 13,
            fontWeight: 700,
            color: 'oklch(35% 0.02 230)',
            cursor: 'pointer',
          }}
        >
          Fechar
        </button>
        {edit && (
          <button
            onClick={edit}
            style={{
              flex: 1,
              background: 'oklch(32% 0.08 220)',
              color: '#fff',
              border: 'none',
              borderRadius: 9,
              padding: 11,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Editar
          </button>
        )}
      </div>
    </ModalShell>
  );
}
