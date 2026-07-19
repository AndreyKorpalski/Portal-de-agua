export default function Administradores({ isMobile, admins, openAddAdmin }) {
  const adminsGridStyle = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: 14 };

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 4,
        }}
      >
        <h1 style={{ fontSize: 23, fontWeight: 800, color: 'oklch(18% 0.02 230)', margin: 0 }}>Administradores</h1>
        <button
          onClick={openAddAdmin}
          style={{
            background: 'oklch(32% 0.08 220)',
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          + Adicionar administrador
        </button>
      </div>
      <p style={{ fontSize: 13.5, color: 'oklch(52% 0.01 230)', margin: '0 0 20px' }}>
        Gerencie quem tem acesso administrativo ao sistema
      </p>

      <div style={adminsGridStyle}>
        {admins.map((adm) => (
          <div
            key={adm.id}
            style={{
              background: '#fff',
              border: '1px solid oklch(91% 0.008 230)',
              borderRadius: 14,
              padding: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'oklch(92% 0.02 220)',
                color: 'oklch(35% 0.08 220)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                flex: 'none',
              }}
            >
              {adm.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'oklch(20% 0.02 230)' }}>{adm.name}</div>
              <div style={{ fontSize: 11.5, color: 'oklch(55% 0.01 230)' }}>{adm.email}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'oklch(45% 0.13 210)', marginTop: 2 }}>{adm.cargo}</div>
            </div>
            <button onClick={adm.onDelete} style={{ background: 'none', border: 'none', color: 'oklch(55% 0.01 230)', cursor: 'pointer', fontSize: 12 }}>
              Remover
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
