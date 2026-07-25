const cardStyle = { background: '#fff', border: '1px solid oklch(91% 0.008 230)', borderRadius: 14, padding: 26 };
const selectStyle = {
  border: '1.5px solid oklch(89% 0.01 230)',
  borderRadius: 9,
  padding: '9px 12px',
  fontSize: 13,
  background: '#fff',
  color: 'oklch(25% 0.02 230)',
};

export default function Relatorios({
  periodOptions,
  selectedPeriod,
  setRelatorioPeriod,
  stats,
  despesasPorCategoria,
  associadosOptions,
  selectedAssociadoId,
  setRelatorioAssociado,
  extratoAssociado,
  exportPdf,
  exportCsv,
}) {
  return (
    <>
      <h1 style={{ fontSize: 23, fontWeight: 800, color: 'oklch(18% 0.02 230)', margin: '0 0 4px' }}>Relatórios</h1>
      <p style={{ fontSize: 13.5, color: 'oklch(52% 0.01 230)', margin: '0 0 20px' }}>Resumo financeiro, despesas por categoria e extrato por associado</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ ...cardStyle, maxWidth: 420, flex: '1 1 360px' }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'oklch(50% 0.01 230)', textTransform: 'uppercase', letterSpacing: '.03em' }}>Período</label>
          <select value={selectedPeriod} onChange={setRelatorioPeriod} style={{ ...selectStyle, width: '100%', boxSizing: 'border-box', marginTop: 6, marginBottom: 16 }}>
            {periodOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

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

        <div style={{ ...cardStyle, maxWidth: 420, flex: '1 1 320px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'oklch(25% 0.02 230)', marginBottom: 14 }}>Despesas por categoria</div>
          {despesasPorCategoria.length === 0 && <p style={{ fontSize: 12.5, color: 'oklch(55% 0.01 230)', margin: 0 }}>Nenhuma despesa nesse período.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {despesasPorCategoria.map((c) => (
              <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'oklch(35% 0.02 230)' }}>{c.category}</span>
                <span style={{ fontWeight: 700, color: 'oklch(20% 0.02 230)' }}>{c.totalFmt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 20, maxWidth: 720 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'oklch(25% 0.02 230)', marginBottom: 14 }}>Extrato por associado</div>
        <select
          value={selectedAssociadoId ?? ''}
          onChange={setRelatorioAssociado}
          style={{ ...selectStyle, width: '100%', maxWidth: 320, boxSizing: 'border-box', marginBottom: 16 }}
        >
          <option value="">Selecione um associado...</option>
          {associadosOptions.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        {selectedAssociadoId && extratoAssociado.length === 0 && (
          <p style={{ fontSize: 12.5, color: 'oklch(55% 0.01 230)', margin: 0 }}>Esse associado ainda não tem cobranças geradas.</p>
        )}

        {extratoAssociado.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 560 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 0.9fr 1fr 1fr 1fr',
                  gap: 8,
                  padding: '10px 4px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'oklch(50% 0.01 230)',
                  textTransform: 'uppercase',
                  letterSpacing: '.03em',
                  borderBottom: '1px solid oklch(94% 0.006 230)',
                }}
              >
                <div>Mês</div>
                <div>Valor</div>
                <div>Vencimento</div>
                <div>Status</div>
                <div>Pago em</div>
              </div>
              {extratoAssociado.map((f) => (
                <div
                  key={f.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 0.9fr 1fr 1fr 1fr',
                    gap: 8,
                    alignItems: 'center',
                    padding: '10px 4px',
                    fontSize: 12.5,
                    borderBottom: '1px solid oklch(96% 0.006 230)',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'oklch(20% 0.02 230)' }}>{f.month}</div>
                  <div>{f.valueFmt}</div>
                  <div>{f.dueDate}</div>
                  <div>{f.statusLabel}</div>
                  <div>{f.paidAtFmt}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
