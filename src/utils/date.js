// Converte 'YYYY-MM-DD' (formato do Postgres) para 'DD/MM' ou 'DD/MM/YYYY'
export function isoToShort(iso) {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export function isoToLong(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// Converte 'DD/MM' ou 'DD/MM/YYYY' para 'YYYY-MM-DD', assumindo o ano informado quando faltar
export function shortToIso(short, fallbackYear = new Date().getFullYear()) {
  const parts = short.split('/');
  const [d, m, y] = parts;
  const year = y || String(fallbackYear);
  return `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function sameMonth(iso, ref = new Date()) {
  if (!iso) return false;
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
