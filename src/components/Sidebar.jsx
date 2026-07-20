import {
  DropletIcon,
  DashboardIcon,
  AssociadosIcon,
  CobrancaIcon,
  DespesasIcon,
  AdministradoresIcon,
  RelatoriosIcon,
  InicioIcon,
  PagarIcon,
  HistoricoIcon,
} from './icons';

export default function Sidebar({
  isMobile,
  role,
  adminPage,
  assocPage,
  goAdminDashboard,
  goAdminAssociados,
  goAdminCobranca,
  goAdminDespesas,
  goAdminAdministradores,
  goAdminRelatorios,
  goAssocInicio,
  goAssocPagar,
  goAssocHistorico,
  currentUserInitials,
  currentUserName,
  currentUserRoleLabel,
  sidebarProfileClick,
  doLogout,
}) {
  const sidebarStyle = {
    width: isMobile ? '100%' : '236px',
    minWidth: 0, // sem isso, o conteúdo interno força a página a alargar em vez de rolar
    flex: 'none',
    background: '#fff',
    borderRight: isMobile ? 'none' : '1px solid oklch(91% 0.008 230)',
    borderBottom: isMobile ? '1px solid oklch(91% 0.008 230)' : 'none',
    display: 'flex',
    flexDirection: isMobile ? 'row' : 'column',
    alignItems: isMobile ? 'center' : 'stretch',
    gap: isMobile ? '10px' : '0',
    padding: isMobile ? '10px 12px' : '22px 14px',
    position: isMobile ? 'static' : 'sticky',
    top: 0,
    height: isMobile ? 'auto' : '100vh',
    overflowX: isMobile ? 'auto' : 'visible',
  };
  const sidebarNavStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'row' : 'column',
    gap: isMobile ? '6px' : '2px',
    flex: isMobile ? '1' : 'none',
    overflowX: isMobile ? 'auto' : 'visible',
  };
  const sidebarFooterStyle = {
    marginTop: isMobile ? '0' : 'auto',
    padding: isMobile ? '0' : '12px 10px',
    borderTop: isMobile ? 'none' : '1px solid oklch(93% 0.008 230)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 'none',
  };

  const navBtn = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 12px',
    borderRadius: '9px',
    border: 'none',
    background: active ? 'oklch(93% 0.03 220)' : 'transparent',
    color: active ? 'oklch(30% 0.09 220)' : 'oklch(40% 0.02 230)',
    fontSize: '13px',
    fontWeight: active ? 700 : 600,
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    whiteSpace: 'nowrap',
  });

  return (
    <aside style={sidebarStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 10px 22px', flex: 'none' }}>
        <DropletIcon size={22} stroke="oklch(32% 0.08 220)" strokeWidth={1.8} />
        <span style={{ fontSize: 14.5, fontWeight: 700, color: 'oklch(20% 0.02 230)', whiteSpace: 'nowrap' }}>
          Portal Amolina
        </span>
      </div>

      {role === 'admin' && (
        <nav style={sidebarNavStyle}>
          <button onClick={goAdminDashboard} style={navBtn(adminPage === 'dashboard')}>
            <DashboardIcon />
            Dashboard
          </button>
          <button onClick={goAdminAssociados} style={navBtn(adminPage === 'associados')}>
            <AssociadosIcon />
            Associados
          </button>
          <button onClick={goAdminCobranca} style={navBtn(adminPage === 'cobranca')}>
            <CobrancaIcon />
            Cobrança
          </button>
          <button onClick={goAdminDespesas} style={navBtn(adminPage === 'despesas')}>
            <DespesasIcon />
            Despesas
          </button>
          <button onClick={goAdminAdministradores} style={navBtn(adminPage === 'administradores')}>
            <AdministradoresIcon />
            Administradores
          </button>
          <button onClick={goAdminRelatorios} style={navBtn(adminPage === 'relatorios')}>
            <RelatoriosIcon />
            Relatórios
          </button>
        </nav>
      )}

      {role === 'associado' && (
        <nav style={sidebarNavStyle}>
          <button onClick={goAssocInicio} style={navBtn(assocPage === 'inicio')}>
            <InicioIcon />
            Início
          </button>
          <button onClick={goAssocPagar} style={navBtn(assocPage === 'pagar')}>
            <PagarIcon />
            Pagar
          </button>
          <button onClick={goAssocHistorico} style={navBtn(assocPage === 'historico')}>
            <HistoricoIcon />
            Histórico
          </button>
        </nav>
      )}

      <div style={sidebarFooterStyle}>
        <button
          onClick={sidebarProfileClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            marginBottom: 0,
            background: 'none',
            border: 'none',
            padding: 4,
            borderRadius: 8,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'oklch(90% 0.03 220)',
              color: 'oklch(32% 0.08 220)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              flex: 'none',
            }}
          >
            {currentUserInitials}
          </div>
          {!isMobile && (
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: 'oklch(20% 0.02 230)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentUserName}
              </div>
              <div style={{ fontSize: 11, color: 'oklch(55% 0.01 230)' }}>{currentUserRoleLabel}</div>
            </div>
          )}
        </button>
        <button
          onClick={doLogout}
          style={{
            background: 'none',
            border: '1px solid oklch(90% 0.008 230)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12.5,
            fontWeight: 600,
            color: 'oklch(40% 0.02 230)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
