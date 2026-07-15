const GRID_COLS = '1fr 1fr 1fr 1fr 1fr';

export default function Historico({ paymentHistory }) {
  return (
    <>
      <h1 style={{ fontSize: 23, fontWeight: 800, color: 'oklch(18% 0.02 230)', margin: '0 0 4px' }}>Histórico de pagamentos</h1>
      <p style={{ fontSize: 13.5, color: 'oklch(52% 0.01 230)', margin: '0 0 20px' }}>Seus pagamentos anteriores à associação</p>

      <div style={{ background: '#fff', border: '1px solid oklch(91% 0.008 230)', borderRadius: 14, overflowX: 'auto' }}>
        <div style={{ minWidth: 520 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: GRID_COLS,
              gap: 8,
              padding: '12px 18px',
              background: 'oklch(97% 0.006 230)',
              fontSize: 11,
              fontWeight: 700,
              color: 'oklch(50% 0.01 230)',
              textTransform: 'uppercase',
              letterSpacing: '.03em',
            }}
          >
            <div>Referência</div>
            <div>Valor</div>
            <div>Método</div>
            <div>Status</div>
            <div></div>
          </div>
          {paymentHistory.map((p, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: GRID_COLS,
                gap: 8,
                alignItems: 'center',
                padding: '12px 18px',
                borderTop: '1px solid oklch(94% 0.006 230)',
              }}
            >
              <div style={{ fontSize: 12.5, color: 'oklch(35% 0.02 230)' }}>{p.ref}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'oklch(20% 0.02 230)' }}>{p.valueFmt}</div>
              <div style={{ fontSize: 12.5, color: 'oklch(35% 0.02 230)' }}>{p.method}</div>
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 100,
                    background: p.statusBg,
                    color: p.statusColor,
                  }}
                >
                  {p.statusLabel}
                </span>
              </div>
              {p.canDownload && (
                <button
                  onClick={p.onDownload}
                  style={{
                    background: 'none',
                    border: '1px solid oklch(89% 0.01 230)',
                    borderRadius: 7,
                    padding: '6px 10px',
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: 'oklch(35% 0.02 230)',
                    cursor: 'pointer',
                    justifySelf: 'start',
                  }}
                >
                  Baixar comprovante
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
