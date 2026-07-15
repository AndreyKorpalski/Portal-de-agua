export default function Inicio({ isMobile, currentUserFirstName, currentInvoice, assocProfile, invoicesList, goPagarTodas }) {
  const invoiceGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr',
    gap: '16px',
    marginBottom: '20px',
  };

  return (
    <>
      <h1 style={{ fontSize: 23, fontWeight: 800, color: 'oklch(18% 0.02 230)', margin: '0 0 4px' }}>Olá, {currentUserFirstName}</h1>
      <p style={{ fontSize: 13.5, color: 'oklch(52% 0.01 230)', margin: '0 0 24px' }}>Resumo da sua fatura atual</p>

      <div style={invoiceGridStyle}>
        <div style={{ background: currentInvoice.cardBg, borderRadius: 16, padding: 26, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <span style={{ fontSize: 12.5, color: 'oklch(85% 0.03 220)' }}>Total em aberto — {currentInvoice.count} fatura(s)</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 100,
                background: currentInvoice.statusBg,
                color: currentInvoice.statusColor,
              }}
            >
              {currentInvoice.statusLabel}
            </span>
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, marginBottom: 4 }}>{currentInvoice.valueFmt}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: currentInvoice.dueDateColor, marginBottom: 22 }}>
            Fatura mais antiga vence em {currentInvoice.dueDate}
          </div>
          <button
            onClick={goPagarTodas}
            style={{
              background: '#fff',
              color: 'oklch(32% 0.08 220)',
              border: 'none',
              borderRadius: 9,
              padding: '12px 20px',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Pagar tudo
          </button>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid oklch(91% 0.008 230)',
            borderRadius: 16,
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'oklch(52% 0.01 230)', marginBottom: 6 }}>Consumo do mês</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'oklch(18% 0.02 230)' }}>{currentInvoice.consumption} m³</div>
          </div>
          <div style={{ borderTop: '1px solid oklch(94% 0.006 230)', paddingTop: 16 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'oklch(52% 0.01 230)', marginBottom: 6 }}>Unidade</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'oklch(20% 0.02 230)' }}>{assocProfile.unit}</div>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid oklch(91% 0.008 230)', borderRadius: 14, overflow: 'hidden' }}>
        <div
          style={{
            padding: '14px 18px',
            fontSize: 13,
            fontWeight: 700,
            color: 'oklch(25% 0.02 230)',
            borderBottom: '1px solid oklch(94% 0.006 230)',
          }}
        >
          Contas de água por mês
        </div>
        {invoicesList.map((inv) => (
          <div
            key={inv.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              borderTop: '1px solid oklch(94% 0.006 230)',
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'oklch(20% 0.02 230)' }}>{inv.month}</div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: inv.dueDateColor }}>Vencimento {inv.dueDate}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: 100,
                  background: inv.statusBg,
                  color: inv.statusColor,
                }}
              >
                {inv.statusLabel}
              </span>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'oklch(20% 0.02 230)', width: 80, textAlign: 'right' }}>{inv.valueFmt}</div>
              {inv.canPay && (
                <button
                  onClick={inv.onPagar}
                  style={{
                    background: 'oklch(32% 0.08 220)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 7,
                    padding: '7px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Pagar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
