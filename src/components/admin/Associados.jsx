import { CheckIcon } from '../icons';

const GRID_COLS = '1.8fr 1.1fr 0.9fr 0.8fr 0.8fr 0.8fr 1fr 0.5fr';

export default function Associados({
  isMobile,
  associadosFull,
  associadoSearch,
  setAssociadoSearch,
  pageLabel,
  prevDisabled,
  nextDisabled,
  goAssociadoPrevPage,
  goAssociadoNextPage,
  generateMonthlyCharges,
  openBulkDueDate,
  cobrarTodos,
  openAddAssociado,
}) {
  const headerStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'stretch' : 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  };
  const actionsStyle = { display: 'flex', gap: 10, flexWrap: 'wrap' };
  const primaryBtn = {
    background: 'oklch(32% 0.08 220)',
    color: '#fff',
    border: 'none',
    borderRadius: 9,
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  };
  const secondaryBtn = {
    background: '#fff',
    color: 'oklch(32% 0.08 220)',
    border: '1.5px solid oklch(32% 0.08 220)',
    borderRadius: 9,
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  };

  return (
    <>
      <div style={headerStyle}>
        <h1 style={{ fontSize: 23, fontWeight: 800, color: 'oklch(18% 0.02 230)', margin: 0 }}>Associados</h1>
        <div style={actionsStyle}>
          <button onClick={generateMonthlyCharges} style={primaryBtn}>
            Gerar cobranças do mês
          </button>
          <button onClick={openBulkDueDate} style={secondaryBtn}>
            Alterar vencimento de todos
          </button>
          <button onClick={cobrarTodos} style={secondaryBtn}>
            Cobrar todos
          </button>
          <button onClick={openAddAssociado} style={primaryBtn}>
            + Adicionar associado
          </button>
        </div>
      </div>
      <p style={{ fontSize: 13.5, color: 'oklch(52% 0.01 230)', margin: '0 0 16px' }}>
        Defina o valor mensal, registre o consumo de água e envie cobranças
      </p>

      <input
        value={associadoSearch}
        onChange={setAssociadoSearch}
        placeholder="Buscar por nome, unidade ou e-mail..."
        style={{
          width: '100%',
          maxWidth: 360,
          boxSizing: 'border-box',
          border: '1.5px solid oklch(89% 0.01 230)',
          borderRadius: 9,
          padding: '10px 14px',
          fontSize: 13,
          marginBottom: 16,
        }}
      />

      <div style={{ background: '#fff', border: '1px solid oklch(91% 0.008 230)', borderRadius: 14, overflowX: 'auto' }}>
        <div style={{ minWidth: 820 }}>
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
            <div>Associado</div>
            <div>Unidade</div>
            <div>Valor mensal</div>
            <div>Consumo m³</div>
            <div>Vencimento</div>
            <div>Status</div>
            <div>Cobrança</div>
            <div></div>
          </div>
          {associadosFull.map((assoc) => (
            <div
              key={assoc.id}
              style={{
                display: 'grid',
                gridTemplateColumns: GRID_COLS,
                gap: 8,
                alignItems: 'center',
                padding: '11px 18px',
                borderTop: '1px solid oklch(94% 0.006 230)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'oklch(92% 0.02 220)',
                    color: 'oklch(35% 0.08 220)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10.5,
                    fontWeight: 700,
                    flex: 'none',
                  }}
                >
                  {assoc.initials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <button
                    onClick={assoc.onOpenProfile}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'oklch(30% 0.09 220)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textDecoration: 'underline',
                      textDecorationColor: 'transparent',
                    }}
                  >
                    {assoc.name}
                  </button>
                  <div style={{ fontSize: 11, color: 'oklch(55% 0.01 230)' }}>{assoc.email}</div>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: 'oklch(35% 0.02 230)' }}>{assoc.unit}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 12.5, color: 'oklch(50% 0.01 230)' }}>R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={assoc.value}
                  onChange={assoc.onValueChange}
                  style={{
                    width: 66,
                    border: '1px solid oklch(89% 0.01 230)',
                    borderRadius: 7,
                    padding: '5px 6px',
                    fontSize: 12.5,
                    fontWeight: 600,
                  }}
                />
              </div>
              <input
                type="number"
                value={assoc.consumption}
                onChange={assoc.onConsumptionChange}
                style={{
                  width: 50,
                  border: '1px solid oklch(89% 0.01 230)',
                  borderRadius: 7,
                  padding: '5px 6px',
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              />
              <input
                value={assoc.dueDate}
                onChange={assoc.onDueDateChange}
                style={{
                  width: 50,
                  border: `1px solid ${assoc.dueDateBorder}`,
                  borderRadius: 7,
                  padding: '5px 6px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: assoc.dueDateColor,
                }}
              />
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 100,
                    background: assoc.statusBg,
                    color: assoc.statusColor,
                  }}
                >
                  {assoc.statusLabel}
                </span>
              </div>
              {assoc.showCobrar && (
                <button
                  onClick={assoc.onCobrar}
                  style={{
                    background: assoc.cobrarBg,
                    color: assoc.cobrarColor,
                    border: `1px solid ${assoc.cobrarBorder}`,
                    borderRadius: 7,
                    padding: '6px 10px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {assoc.cobrarLabel}
                </button>
              )}
              {assoc.showEnviado && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: 'oklch(45% 0.13 150)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <CheckIcon />
                  Enviada
                </span>
              )}
              {assoc.showCobrado && <span style={{ fontSize: 11.5, color: 'oklch(60% 0.01 230)' }}>—</span>}
              <button
                onClick={assoc.onDelete}
                style={{ background: 'none', border: 'none', color: 'oklch(55% 0.01 230)', cursor: 'pointer', fontSize: 12, justifySelf: 'end' }}
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <span style={{ fontSize: 12, color: 'oklch(52% 0.01 230)' }}>{pageLabel}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={goAssociadoPrevPage}
            disabled={prevDisabled}
            style={{
              background: '#fff',
              border: '1px solid oklch(89% 0.01 230)',
              borderRadius: 7,
              padding: '6px 12px',
              fontSize: 12.5,
              fontWeight: 600,
              color: 'oklch(35% 0.02 230)',
              cursor: 'pointer',
            }}
          >
            Anterior
          </button>
          <button
            onClick={goAssociadoNextPage}
            disabled={nextDisabled}
            style={{
              background: '#fff',
              border: '1px solid oklch(89% 0.01 230)',
              borderRadius: 7,
              padding: '6px 12px',
              fontSize: 12.5,
              fontWeight: 600,
              color: 'oklch(35% 0.02 230)',
              cursor: 'pointer',
            }}
          >
            Próxima
          </button>
        </div>
      </div>
    </>
  );
}
