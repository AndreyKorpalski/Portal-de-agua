export default function Dashboard({ isMobile, stats, revenueBars, donutSegments, overdueList, goAdminCobranca }) {
  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
    gap: '16px',
    marginBottom: '22px',
  };
  const chartsGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr',
    gap: '16px',
    marginBottom: '22px',
  };
  // minWidth: 0 é necessário pro grid poder encolher a coluna no mobile —
  // sem isso, um valor grande sem espaços (ex: "R$ 1.555,00") força a
  // página inteira a alargar em vez de só quebrar/encolher no card
  const cardStyle = { background: '#fff', border: '1px solid oklch(91% 0.008 230)', borderRadius: 14, padding: '18px 20px', minWidth: 0 };

  return (
    <>
      <h1 style={{ fontSize: 23, fontWeight: 800, color: 'oklch(18% 0.02 230)', margin: '0 0 4px' }}>Dashboard financeiro</h1>
      <p style={{ fontSize: 13.5, color: 'oklch(52% 0.01 230)', margin: '0 0 26px' }}>
        Visão geral de pagamentos e despesas da associação
      </p>

      <div style={statsGridStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'oklch(52% 0.01 230)', marginBottom: 8 }}>Arrecadado no mês</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'oklch(18% 0.02 230)' }}>{stats.arrecadadoFmt}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'oklch(52% 0.01 230)', marginBottom: 8 }}>Gasto no mês</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'oklch(18% 0.02 230)' }}>{stats.gastoFmt}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'oklch(52% 0.01 230)', marginBottom: 8 }}>Saldo</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: stats.saldoColor }}>{stats.saldoFmt}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'oklch(52% 0.01 230)', marginBottom: 8 }}>Inadimplência</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'oklch(55% 0.18 30)' }}>{stats.inadimplenciaPct}%</div>
        </div>
      </div>

      <div style={chartsGridStyle}>
        <div style={{ background: '#fff', border: '1px solid oklch(91% 0.008 230)', borderRadius: 14, padding: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'oklch(25% 0.02 230)', marginBottom: 18 }}>
            Arrecadação — últimos {revenueBars.length} meses
          </div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 150, minWidth: revenueBars.length * 38 }}>
              {revenueBars.map((bar, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'oklch(30% 0.02 230)' }}>{bar.valueFmt}</div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 34,
                      borderRadius: '6px 6px 2px 2px',
                      background: bar.color,
                      height: `${bar.heightPct}%`,
                    }}
                  />
                  <div style={{ fontSize: 11, color: 'oklch(55% 0.01 230)' }}>{bar.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid oklch(91% 0.008 230)',
            borderRadius: 14,
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: 'oklch(25% 0.02 230)', marginBottom: 14, alignSelf: 'flex-start' }}>
            Status dos pagamentos
          </div>
          <svg width="150" height="150" viewBox="0 0 150 150">
            <circle cx="75" cy="75" r="60" fill="none" stroke="oklch(93% 0.01 230)" strokeWidth="18" />
            {donutSegments.map((seg, i) => (
              <circle
                key={i}
                cx="75"
                cy="75"
                r="60"
                fill="none"
                stroke={seg.color}
                strokeWidth="18"
                strokeDasharray={seg.dashArray}
                strokeDashoffset={seg.dashOffset}
                transform="rotate(-90 75 75)"
                strokeLinecap="butt"
              />
            ))}
            <text x="75" y="70" textAnchor="middle" fontSize="22" fontWeight="800" fill="oklch(20% 0.02 230)">
              {stats.pagoPct}%
            </text>
            <text x="75" y="88" textAnchor="middle" fontSize="10.5" fill="oklch(52% 0.01 230)">
              em dia
            </text>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, width: '100%', marginTop: 16 }}>
            {donutSegments.map((seg, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'oklch(35% 0.02 230)' }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: seg.color }} />
                <span style={{ flex: 1 }}>{seg.label}</span>
                <span style={{ fontWeight: 700 }}>{seg.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid oklch(91% 0.008 230)', borderRadius: 14, padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'oklch(25% 0.02 230)' }}>Associados em atraso</div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              goAdminCobranca();
            }}
            style={{ fontSize: 12.5, textDecoration: 'none', fontWeight: 600 }}
          >
            Ver todos →
          </a>
        </div>
        {overdueList.map((a, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid oklch(94% 0.006 230)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'oklch(93% 0.03 25)',
                  color: 'oklch(45% 0.15 25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {a.initials}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'oklch(20% 0.02 230)' }}>{a.name}</div>
                <div style={{ fontSize: 11.5, color: 'oklch(55% 0.01 230)' }}>{a.unit}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'oklch(45% 0.15 25)' }}>{a.valueFmt}</div>
          </div>
        ))}
      </div>
    </>
  );
}
