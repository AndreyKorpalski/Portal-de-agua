import ModalShell, { fieldLabelStyle, fieldInputStyle, cancelBtnStyle, confirmBtnStyle } from './ModalShell';
import { TrashIcon } from '../icons';

export default function BillingSettingsModal({
  width,
  draft,
  setMinValue,
  setPricePerM3,
  setExtraChargeLabel,
  setExtraChargeValue,
  addExtraCharge,
  removeExtraCharge,
  close,
  confirm,
}) {
  return (
    <ModalShell width={width}>
      <div style={{ fontSize: 16, fontWeight: 800, color: 'oklch(18% 0.02 230)', marginBottom: 6 }}>Configurar valores de cobrança</div>
      <p style={{ fontSize: 12.5, color: 'oklch(52% 0.01 230)', margin: '0 0 18px', lineHeight: 1.5 }}>
        O valor mensal do associado é calculado automaticamente ao informar o consumo: o maior entre o valor mínimo e (consumo × valor por m³), mais os custos extras abaixo.
      </p>

      <label style={fieldLabelStyle}>Valor mínimo — sem consumo (R$)</label>
      <input type="number" step="0.01" value={draft.minValue} onChange={setMinValue} style={fieldInputStyle} />

      <label style={fieldLabelStyle}>Valor por m³ consumido (R$)</label>
      <input type="number" step="0.01" value={draft.pricePerM3} onChange={setPricePerM3} style={{ ...fieldInputStyle, marginBottom: 18 }} />

      <label style={fieldLabelStyle}>Outros custos (somados a toda cobrança)</label>
      {draft.extraCharges.map((c, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            value={c.label}
            onChange={(e) => setExtraChargeLabel(i, e)}
            placeholder="Ex: Taxa de manutenção"
            style={{ ...fieldInputStyle, marginBottom: 0, flex: 2 }}
          />
          <input
            type="number"
            step="0.01"
            value={c.value}
            onChange={(e) => setExtraChargeValue(i, e)}
            placeholder="R$"
            style={{ ...fieldInputStyle, marginBottom: 0, flex: 1 }}
          />
          <button
            onClick={() => removeExtraCharge(i)}
            title="Remover custo"
            aria-label="Remover custo"
            style={{ background: 'none', border: 'none', color: 'oklch(55% 0.01 230)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4, flex: 'none' }}
          >
            <TrashIcon />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addExtraCharge}
        style={{
          background: 'none',
          border: '1.5px dashed oklch(85% 0.02 230)',
          borderRadius: 9,
          padding: '9px 12px',
          fontSize: 12.5,
          fontWeight: 600,
          color: 'oklch(40% 0.1 220)',
          cursor: 'pointer',
          width: '100%',
          marginBottom: 20,
        }}
      >
        + Adicionar custo
      </button>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={close} style={cancelBtnStyle}>
          Cancelar
        </button>
        <button onClick={confirm} style={confirmBtnStyle}>
          Salvar
        </button>
      </div>
    </ModalShell>
  );
}
