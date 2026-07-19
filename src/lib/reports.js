import { brl } from '../utils/format';

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const s = String(value ?? '');
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function csvRow(cells) {
  return cells.map(csvEscape).join(';');
}

export function exportReportCsv({ periodLabel, stats, expenses, associados }) {
  const lines = [];
  lines.push(csvRow(['Relatório financeiro — Associação das Águas']));
  lines.push(csvRow([periodLabel]));
  lines.push('');
  lines.push(csvRow(['Total arrecadado', stats.arrecadadoFmt]));
  lines.push(csvRow(['Total de despesas', stats.gastoFmt]));
  lines.push(csvRow(['Saldo do período', stats.saldoFmt]));
  lines.push('');
  lines.push(csvRow(['Despesas']));
  lines.push(csvRow(['Data', 'Descrição', 'Categoria', 'Valor']));
  expenses.forEach((e) => lines.push(csvRow([e.date, e.description, e.category, brl(e.value)])));
  lines.push('');
  lines.push(csvRow(['Associados']));
  lines.push(csvRow(['Nome', 'Unidade', 'Valor mensal', 'Status']));
  associados.forEach((a) => lines.push(csvRow([a.name, a.unit, brl(a.value), STATUS_LABEL[a.status] || a.status])));

  // BOM no início: garante que o Excel reconheça acentuação em UTF-8 corretamente
  downloadBlob('﻿' + lines.join('\n'), `relatorio-${slug(periodLabel)}.csv`, 'text/csv;charset=utf-8');
}

const STATUS_LABEL = { pago: 'Pago', pendente: 'Pendente', atrasado: 'Atrasado' };

function slug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos (marcas de combinação Unicode)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function exportReportPdf({ periodLabel, stats, expenses, associados }) {
  // import sob demanda: jspdf/jspdf-autotable só são baixados quando o
  // usuário realmente exporta um PDF, em vez de inflar o bundle inicial
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Associação das Águas', 14, 18);
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(`Relatório financeiro — ${periodLabel}`, 14, 25);

  doc.setTextColor(20);
  doc.setFontSize(10);
  const summaryY = 36;
  doc.text(`Total arrecadado: ${stats.arrecadadoFmt}`, 14, summaryY);
  doc.text(`Total de despesas: ${stats.gastoFmt}`, 14, summaryY + 6);
  doc.text(`Saldo do período: ${stats.saldoFmt}`, 14, summaryY + 12);

  let cursorY = summaryY + 22;

  autoTable(doc, {
    startY: cursorY,
    head: [['Data', 'Descrição', 'Categoria', 'Valor']],
    body: expenses.map((e) => [e.date, e.description, e.category, brl(e.value)]),
    headStyles: { fillColor: [30, 64, 90] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => { cursorY = data.cursor.y; },
  });
  cursorY = doc.lastAutoTable.finalY + 10;

  if (cursorY > 260) {
    doc.addPage();
    cursorY = 20;
  }

  doc.setFontSize(11);
  doc.text('Associados', 14, cursorY);

  autoTable(doc, {
    startY: cursorY + 4,
    head: [['Nome', 'Unidade', 'Valor mensal', 'Status']],
    body: associados.map((a) => [a.name, a.unit, brl(a.value), STATUS_LABEL[a.status] || a.status]),
    headStyles: { fillColor: [30, 64, 90] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  doc.save(`relatorio-${slug(periodLabel)}.pdf`);
}
