export default function Pagar({
  selectedInvoices,
  selectedTotalFmt,
  hasSelectedInvoices,
  payMethod,
  setPayPix,
  setPayBoleto,
  qrCells,
  pixCode,
  copyPix,
  barcodeBars,
  boletoLine,
  copyBoleto,
  downloadBoleto,
  confirmPayment,
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

  return (
    <>
      <h1 style={{ fontSize: 23, fontWeight: 800, color: 'oklch(18% 0.02 230)', margin: '0 0 4px' }}>Pagar fatura</h1>
      <p style={{ fontSize: 13.5, color: 'oklch(52% 0.01 230)', margin: '0 0 20px' }}>Selecione as faturas que deseja quitar</p>

      <div
        style={{
          background: '#fff',
          border: '1px solid oklch(91% 0.008 230)',
          borderRadius: 14,
          overflow: 'hidden',
          maxWidth: 460,
          marginBottom: 20,
        }}
      >
        {selectedInvoices.map((inv) => (
          <label
            key={inv.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 18px',
              borderTop: '1px solid oklch(94% 0.006 230)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={inv.checked}
              onChange={inv.onToggle}
              style={{ width: 16, height: 16, accentColor: 'oklch(32% 0.08 220)' }}
            />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'oklch(20% 0.02 230)' }}>{inv.month}</span>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: 'oklch(20% 0.02 230)' }}>{inv.valueFmt}</span>
          </label>
        ))}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '14px 18px',
            background: 'oklch(97% 0.006 230)',
            borderTop: '1px solid oklch(94% 0.006 230)',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: 'oklch(30% 0.02 230)' }}>Total selecionado</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'oklch(20% 0.02 230)' }}>{selectedTotalFmt}</span>
        </div>
      </div>

      <div style={{ display: 'flex', background: 'oklch(95% 0.01 230)', borderRadius: 10, padding: 4, width: 280, marginBottom: 24 }}>
        <button onClick={setPayPix} style={tabBtn(payMethod === 'pix')}>
          Pix
        </button>
        <button onClick={setPayBoleto} style={tabBtn(payMethod === 'boleto')}>
          Boleto
        </button>
      </div>

      {payMethod === 'pix' && (
        <div
          style={{
            background: '#fff',
            border: '1px solid oklch(91% 0.008 230)',
            borderRadius: 16,
            padding: 28,
            maxWidth: 420,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10,1fr)',
              gap: 2,
              width: 180,
              height: 180,
              padding: 12,
              background: '#fff',
              border: '1px solid oklch(90% 0.008 230)',
              borderRadius: 10,
              marginBottom: 20,
            }}
          >
            {qrCells.map((cell, i) => (
              <div key={i} style={{ background: cell.color, borderRadius: 1 }} />
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'oklch(52% 0.01 230)', marginBottom: 8 }}>Código Pix copia-e-cola</div>
          <div
            style={{
              width: '100%',
              background: 'oklch(97% 0.006 230)',
              borderRadius: 9,
              padding: '10px 12px',
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 11,
              color: 'oklch(30% 0.02 230)',
              wordBreak: 'break-all',
              marginBottom: 14,
            }}
          >
            {pixCode}
          </div>
          <button
            onClick={copyPix}
            style={{
              width: '100%',
              background: 'oklch(32% 0.08 220)',
              color: '#fff',
              border: 'none',
              borderRadius: 9,
              padding: 12,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Copiar código Pix
          </button>
          <p style={{ fontSize: 11.5, color: 'oklch(55% 0.01 230)', margin: '12px 0 0' }}>Expira em 30 minutos após a geração</p>
        </div>
      )}

      {payMethod === 'boleto' && (
        <div style={{ background: '#fff', border: '1px solid oklch(91% 0.008 230)', borderRadius: 16, padding: 28, maxWidth: 460 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 64, marginBottom: 18, background: '#fff' }}>
            {barcodeBars.map((bar, i) => (
              <div key={i} style={{ width: `${bar.width}px`, height: '100%', background: bar.color }} />
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'oklch(52% 0.01 230)', marginBottom: 8 }}>Linha digitável</div>
          <div
            style={{
              width: '100%',
              background: 'oklch(97% 0.006 230)',
              borderRadius: 9,
              padding: '10px 12px',
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 12.5,
              color: 'oklch(30% 0.02 230)',
              marginBottom: 14,
            }}
          >
            {boletoLine}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={copyBoleto}
              style={{
                flex: 1,
                background: 'oklch(32% 0.08 220)',
                color: '#fff',
                border: 'none',
                borderRadius: 9,
                padding: 12,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Copiar código
            </button>
            <button
              onClick={downloadBoleto}
              style={{
                flex: 1,
                background: '#fff',
                color: 'oklch(32% 0.08 220)',
                border: '1.5px solid oklch(32% 0.08 220)',
                borderRadius: 9,
                padding: 12,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Baixar boleto
            </button>
          </div>
        </div>
      )}

      {hasSelectedInvoices && (
        <button
          onClick={confirmPayment}
          style={{
            marginTop: 18,
            maxWidth: 460,
            width: '100%',
            background: 'oklch(45% 0.13 150)',
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            padding: 13,
            fontSize: 13.5,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Confirmar pagamento de {selectedTotalFmt}
        </button>
      )}
    </>
  );
}
