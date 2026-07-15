import { FileIcon } from '../icons';

const GRID_COLS = '0.9fr 2fr 1fr 0.9fr 1.1fr 0.8fr';

export default function Despesas({ expenses, openAddExpense }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 style={{ fontSize: 23, fontWeight: 800, color: 'oklch(18% 0.02 230)', margin: 0 }}>Despesas</h1>
        <button
          onClick={openAddExpense}
          style={{
            background: 'oklch(32% 0.08 220)',
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          + Lançar despesa
        </button>
      </div>
      <p style={{ fontSize: 13.5, color: 'oklch(52% 0.01 230)', margin: '0 0 20px' }}>Registre gastos da associação com comprovante</p>

      <div style={{ background: '#fff', border: '1px solid oklch(91% 0.008 230)', borderRadius: 14, overflowX: 'auto' }}>
        <div style={{ minWidth: 760 }}>
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
            <div>Data</div>
            <div>Descrição</div>
            <div>Categoria</div>
            <div>Valor</div>
            <div>Comprovante</div>
            <div></div>
          </div>
          {expenses.map((exp) => (
            <div
              key={exp.id}
              style={{
                display: 'grid',
                gridTemplateColumns: GRID_COLS,
                gap: 8,
                alignItems: 'center',
                padding: '12px 18px',
                borderTop: '1px solid oklch(94% 0.006 230)',
              }}
            >
              <div style={{ fontSize: 12.5, color: 'oklch(35% 0.02 230)' }}>{exp.date}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'oklch(20% 0.02 230)' }}>{exp.description}</div>
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: 100,
                    background: 'oklch(95% 0.015 230)',
                    color: 'oklch(40% 0.02 230)',
                  }}
                >
                  {exp.category}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'oklch(20% 0.02 230)' }}>{exp.valueFmt}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'oklch(45% 0.13 210)' }}>
                <FileIcon />
                {exp.receipt}
              </div>
              <div style={{ display: 'flex', gap: 10, justifySelf: 'end' }}>
                <button onClick={exp.onEdit} style={{ background: 'none', border: 'none', color: 'oklch(32% 0.08 220)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  Editar
                </button>
                <button onClick={exp.onDelete} style={{ background: 'none', border: 'none', color: 'oklch(55% 0.01 230)', cursor: 'pointer', fontSize: 12 }}>
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
