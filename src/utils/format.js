export function brl(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export const STATUS_META = {
  pago: { label: 'Pago', bg: 'oklch(93% 0.05 150)', color: 'oklch(38% 0.13 150)' },
  pendente: { label: 'Pendente', bg: 'oklch(94% 0.06 85)', color: 'oklch(45% 0.13 75)' },
  atrasado: { label: 'Atrasado', bg: 'oklch(93% 0.05 25)', color: 'oklch(45% 0.15 25)' },
};

export function seeded(i) {
  const x = Math.sin(i * 12.9898 + 4.1414) * 43758.5453;
  return x - Math.floor(x);
}

export const MULTA_RATE = 0.02;

export function multaFor(value, status) {
  return status === 'atrasado' ? value * MULTA_RATE : 0;
}
