export default function Relatorios({ stats, exportPdf, exportCsv }) {
  return (
    <>
      <h1 style={{ fontSize: 23, fontWeight: 800, color: 'oklch(18% 0.02 230)', margin: '0 0 4px' }}>Relatórios</h1>
      <p style={{ fontSize: 13.5, color: 'oklch(52% 0.01 230)', margin: '0 0 20px' }}>Exporte o resumo financeiro do período atual</p>
      <div style={{ background: '#fff', border: '1px solid oklch(91% 0.008 230)', borderRadius: 14, padding: 26, maxWidth: 520 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'oklch(25% 0.02 230)', marginBottom: 16 }}>Julho de 2026</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'oklch(50% 0.01 230)' }}>Total arrecadado</span>
            <span style={{ fontWeight: 700, color: 'oklch(20% 0.02 230)' }}>{stats.arrecadadoFmt}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'oklch(50% 0.01 230)' }}>Total de despesas</span>
            <span style={{ fontWeight: 700, color: 'oklch(20% 0.02 230)' }}>{stats.gastoFmt}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 13,
              borderTop: '1px solid oklch(94% 0.006 230)',
              paddingTop: 10,
            }}
          >
            <span style={{ color: 'oklch(50% 0.01 230)' }}>Saldo do período</span>
            <span style={{ fontWeight: 800, color: stats.saldoColor }}>{stats.saldoFmt}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={exportPdf}
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
            Exportar PDF
          </button>
          <button
            onClick={exportCsv}
            style={{
              flex: 1,
              background: '#fff',
              color: 'oklch(32% 0.08 220)',
              border: '1.5px solid oklch(32% 0.08 220)',
              borderRadius: 9,
              padding: 11,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Exportar CSV
          </button>
        </div>
      </div>
    </>
  );
}
