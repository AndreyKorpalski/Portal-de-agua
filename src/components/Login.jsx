import { DropletIcon } from './icons';

export default function Login({
  isMobile,
  loginRole,
  setLoginRoleAdmin,
  setLoginRoleAssoc,
  doLogin,
  associadosCount,
  inadimplenciaPct,
}) {
  const tabBtn = (active) => ({
    flex: 1,
    padding: '9px',
    borderRadius: 8,
    border: 'none',
    background: active ? '#fff' : 'transparent',
    color: active ? 'oklch(30% 0.09 220)' : 'oklch(50% 0.01 230)',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: active ? '0 1px 3px oklch(30% 0.05 230 / 0.15)' : 'none',
  });

  const loginGridStyle = {
    width: '100%',
    maxWidth: isMobile ? '420px' : '900px',
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 20px 60px -20px oklch(30% 0.05 230 / 0.35)',
    background: '#fff',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doLogin();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'oklch(97.5% 0.006 230)',
        padding: 24,
      }}
    >
      <div style={loginGridStyle}>
        {!isMobile && (
          <div
            style={{
              background: 'linear-gradient(160deg, oklch(32% 0.08 220), oklch(24% 0.07 235))',
              padding: '48px 40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: '#fff',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
                <DropletIcon size={30} stroke="#fff" strokeWidth={1.6} />
                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '.01em' }}>Associação das Águas</span>
              </div>
              <h1 style={{ fontSize: 32, lineHeight: 1.25, fontWeight: 800, margin: '0 0 16px' }}>
                Gestão simples e transparente da sua associação de água.
              </h1>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'oklch(88% 0.03 220)', maxWidth: 340, margin: 0 }}>
                Acompanhe cobranças, pagamentos e despesas em um só lugar — para administradores e associados.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 28, paddingTop: 32, borderTop: '1px solid oklch(100% 0 0 / 0.15)' }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{associadosCount}</div>
                <div style={{ fontSize: 11.5, color: 'oklch(85% 0.03 220)' }}>associados ativos</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{inadimplenciaPct}%</div>
                <div style={{ fontSize: 11.5, color: 'oklch(85% 0.03 220)' }}>inadimplência</div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', background: 'oklch(95% 0.01 230)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
            <button type="button" onClick={setLoginRoleAdmin} style={tabBtn(loginRole === 'admin')}>
              Administrador
            </button>
            <button type="button" onClick={setLoginRoleAssoc} style={tabBtn(loginRole === 'associado')}>
              Associado
            </button>
          </div>

          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'oklch(35% 0.02 230)', marginBottom: 6 }}>E-mail</label>
          <input
            type="email"
            placeholder={loginRole === 'admin' ? 'admin@associacao.org' : 'associado@email.com'}
            style={{
              border: '1.5px solid oklch(89% 0.01 230)',
              borderRadius: 9,
              padding: '11px 13px',
              fontSize: 14,
              marginBottom: 16,
              outline: 'none',
              color: 'oklch(20% 0.02 230)',
            }}
          />

          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'oklch(35% 0.02 230)', marginBottom: 6 }}>Senha</label>
          <input
            type="password"
            placeholder="••••••••"
            style={{
              border: '1.5px solid oklch(89% 0.01 230)',
              borderRadius: 9,
              padding: '11px 13px',
              fontSize: 14,
              marginBottom: 24,
              outline: 'none',
              color: 'oklch(20% 0.02 230)',
            }}
          />

          <button
            type="submit"
            style={{
              background: 'oklch(32% 0.08 220)',
              color: '#fff',
              border: 'none',
              borderRadius: 9,
              padding: 13,
              fontSize: 14.5,
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: 14,
            }}
          >
            Entrar
          </button>
          <p style={{ fontSize: 12, color: 'oklch(55% 0.01 230)', textAlign: 'center', margin: '0 0 4px' }}>
            Protótipo — qualquer e-mail e senha funcionam
          </p>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{ fontSize: 12.5, textAlign: 'center', textDecoration: 'none' }}
          >
            Esqueci minha senha
          </a>
        </form>
      </div>
    </div>
  );
}
