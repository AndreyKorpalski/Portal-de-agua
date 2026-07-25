const GRID_COLS = '1fr 0.9fr 0.9fr 1fr 1fr 0.9fr';

export default function Historico({ paymentHistory }) {
  return (
    <>
      <h1 style={{ fontSize: 23, fontWeight: 800, color: 'oklch(18% 0.02 230)', margin: '0 0 4px' }}>Histórico de pagamentos</h1>
      <p style={{ fontSize: 13.5, color: 'oklch(52% 0.01 230)', margin: '0 0 20px' }}>Extrato completo das suas cobranças na associação</p>

      <div style={{ background: '#fff', border: '1px solid oklch(91% 0.008 230)', borderRadius: 14, overflowX: 'auto' }}>
        <div style={{ minWidth: 620 }}>
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
            <div>Vencimento</div>
            <div>Pago em</div>
            <div>Status</div>
          </div>
          {paymentHistory.length === 0 && (
            <div style={{ padding: '18px', fontSize: 12.5, color: 'oklch(55% 0.01 230)' }}>Nenhuma cobrança gerada ainda.</div>
          )}
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
              <div style={{ fontSize: 12.5, color: 'oklch(35% 0.02 230)' }}>{p.dueDate}</div>
              <div style={{ fontSize: 12.5, color: 'oklch(35% 0.02 230)' }}>{p.paidAtFmt}</div>
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
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
