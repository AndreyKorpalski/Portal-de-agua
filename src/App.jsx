import { useCallback, useEffect, useRef, useState } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Dashboard from './components/admin/Dashboard';
import Associados from './components/admin/Associados';
import Despesas from './components/admin/Despesas';
import Administradores from './components/admin/Administradores';
import Relatorios from './components/admin/Relatorios';
import Inicio from './components/associado/Inicio';
import Pagar from './components/associado/Pagar';
import Historico from './components/associado/Historico';
import ViewProfileModal from './components/modals/ViewProfileModal';
import EditProfileModal from './components/modals/EditProfileModal';
import AddAssociadoModal from './components/modals/AddAssociadoModal';
import BulkDueDateModal from './components/modals/BulkDueDateModal';
import AddExpenseModal from './components/modals/AddExpenseModal';
import AddAdminModal from './components/modals/AddAdminModal';
import { brl, initials, seeded, multaFor, STATUS_META } from './utils/format';

const INITIAL_STATE = {
  screen: 'login', loginRole: 'admin', role: 'admin',
  adminPage: 'dashboard', assocPage: 'inicio', payMethod: 'pix',
  toast: null,
  showAddAssociado: false, showAddExpense: false, showAddAdmin: false,
  newAssociado: { name: '', unit: '', email: '', value: 80 },
  newExpense: { description: '', category: 'Manutenção', value: '', receiptLabel: '+ Anexar arquivo' },
  editingExpenseId: null,
  associadoSearch: '', associadoPage: 0, associadoPageSize: 5,
  isMobile: false,
  newAdmin: { name: '', email: '', cargo: 'Administrador Geral' },
  cobrancasEnviadas: {},
  showBulkDueDate: false, bulkDueDate: '10/08',
  showViewProfile: false, viewProfileId: null,
  showEditProfile: false, editProfileDraft: { name: '', email: '', phone: '', address: '' },
  assocInvoices: [
    { id: 101, month: 'Maio/2026', value: 78.0, dueDate: '10/05/2026', status: 'atrasado' },
    { id: 102, month: 'Junho/2026', value: 85.5, dueDate: '10/06/2026', status: 'atrasado' },
    { id: 103, month: 'Julho/2026', value: 85.5, dueDate: '10/07/2026', status: 'pendente' },
  ],
  selectedInvoiceIds: { 101: true, 102: true, 103: true },
  billingMonthNames: ['Agosto/2026', 'Setembro/2026', 'Outubro/2026', 'Novembro/2026', 'Dezembro/2026'],
  billingDueDates: ['10/08/2026', '10/09/2026', '10/10/2026', '10/11/2026', '10/12/2026'],
  billingMonthIndex: 0,
  associados: [
    { id: 1, name: 'Ana Beatriz Souza', unit: 'Lote 12', email: 'ana.souza@email.com', phone: '(11) 98211-4432', address: 'Rua das Palmeiras, 120 — Lote 12', value: 85.5, consumption: 14, dueDate: '10/07', status: 'pago' },
    { id: 2, name: 'Carlos Eduardo Lima', unit: 'Lote 03', email: 'carlos.lima@email.com', phone: '(11) 97432-1190', address: 'Rua das Palmeiras, 45 — Lote 03', value: 70.9, consumption: 9, dueDate: '10/07', status: 'atrasado' },
    { id: 3, name: 'Fernanda Rocha', unit: 'Lote 18', email: 'fernanda.rocha@email.com', phone: '(11) 99123-8820', address: 'Estrada do Rio Verde, 340 — Lote 18', value: 95.25, consumption: 21, dueDate: '10/07', status: 'pago' },
    { id: 4, name: 'João Pedro Alves', unit: 'Lote 07', email: 'joao.alves@email.com', phone: '(11) 98877-2231', address: 'Rua das Palmeiras, 80 — Lote 07', value: 75.0, consumption: 11, dueDate: '10/07', status: 'pendente' },
    { id: 5, name: 'Marina Costa', unit: 'Lote 22', email: 'marina.costa@email.com', phone: '(11) 96654-9012', address: 'Estrada do Rio Verde, 410 — Lote 22', value: 60.75, consumption: 8, dueDate: '10/07', status: 'pago' },
    { id: 6, name: 'Rafael Nunes', unit: 'Lote 15', email: 'rafael.nunes@email.com', phone: '(11) 99887-3345', address: 'Rua das Palmeiras, 200 — Lote 15', value: 88.3, consumption: 17, dueDate: '10/07', status: 'atrasado' },
    { id: 7, name: 'Sofia Martins', unit: 'Lote 09', email: 'sofia.martins@email.com', phone: '(11) 98123-5567', address: 'Rua das Palmeiras, 95 — Lote 09', value: 72.4, consumption: 12, dueDate: '10/07', status: 'pago' },
    { id: 8, name: 'Gustavo Pereira', unit: 'Lote 30', email: 'gustavo.pereira@email.com', phone: '(11) 97711-6689', address: 'Estrada do Rio Verde, 520 — Lote 30', value: 90.6, consumption: 19, dueDate: '10/07', status: 'pendente' },
    { id: 9, name: 'Beatriz Fernandes', unit: 'Lote 05', email: 'beatriz.f@email.com', phone: '(11) 98456-2278', address: 'Rua das Palmeiras, 60 — Lote 05', value: 65.15, consumption: 10, dueDate: '10/07', status: 'pago' },
    { id: 10, name: 'Lucas Barbosa', unit: 'Lote 27', email: 'lucas.barbosa@email.com', phone: '(11) 99234-8801', address: 'Estrada do Rio Verde, 480 — Lote 27', value: 78.85, consumption: 13, dueDate: '10/07', status: 'pago' },
  ],
  expenses: [
    { id: 1, date: '02/07', description: "Manutenção da bomba d'água", category: 'Manutenção', value: 420, receipt: 'nf-bomba-0207.pdf' },
    { id: 2, date: '05/07', description: 'Conta de energia da estação', category: 'Energia', value: 310, receipt: 'conta-energia-jul.pdf' },
    { id: 3, date: '08/07', description: 'Cloro e material de tratamento', category: 'Material', value: 185, receipt: 'nf-material-0807.pdf' },
    { id: 4, date: '11/07', description: "Serviço de limpeza da caixa d'água", category: 'Serviços', value: 250, receipt: 'recibo-limpeza.pdf' },
    { id: 5, date: '13/07', description: 'Reparo de vazamento na rede', category: 'Manutenção', value: 390, receipt: 'nf-reparo-1307.pdf' },
  ],
  admins: [
    { id: 1, name: 'Roberto Cardoso', email: 'roberto.cardoso@associacao.org', cargo: 'Administrador Geral' },
    { id: 2, name: 'Patrícia Mendes', email: 'patricia.mendes@associacao.org', cargo: 'Financeiro' },
  ],
};

const PAYMENT_HISTORY_DATA = [
  { ref: 'Jun/2026', value: 85, method: 'Pix', status: 'pago' },
  { ref: 'Mai/2026', value: 80, method: 'Boleto', status: 'pago' },
  { ref: 'Abr/2026', value: 80, method: 'Pix', status: 'pago' },
  { ref: 'Mar/2026', value: 78, method: 'Boleto', status: 'pago' },
  { ref: 'Fev/2026', value: 78, method: 'Pix', status: 'pago' },
  { ref: 'Jan/2026', value: 75, method: 'Boleto', status: 'pago' },
];

function useMergeState(initial) {
  const [state, setStateRaw] = useState(initial);
  const setState = useCallback((patch) => {
    setStateRaw((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);
  return [state, setState];
}

export default function App() {
  const [state, setState] = useMergeState(INITIAL_STATE);
  const toastTimer = useRef(null);

  const showToast = useCallback(
    (msg) => {
      setState({ toast: msg });
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setState({ toast: null }), 2200);
    },
    [setState],
  );

  useEffect(() => {
    const updateViewport = () => setState({ isMobile: window.innerWidth < 860 });
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, [setState]);

  const s = state;

  // --- handlers ---
  const setAssociadoSearch = (e) => setState({ associadoSearch: e.target.value, associadoPage: 0 });
  const goAssociadoPrevPage = () => setState((p) => ({ associadoPage: Math.max(0, p.associadoPage - 1) }));
  const goAssociadoNextPage = () => setState((p) => ({ associadoPage: p.associadoPage + 1 }));

  const doLogin = () => setState((p) => ({ screen: 'app', role: p.loginRole }));
  const doLogout = () => setState({ screen: 'login' });
  const setLoginRoleAdmin = () => setState({ loginRole: 'admin' });
  const setLoginRoleAssoc = () => setState({ loginRole: 'associado' });

  const goAdminDashboard = () => setState({ adminPage: 'dashboard' });
  const goAdminAssociados = () => setState({ adminPage: 'associados' });
  const goAdminDespesas = () => setState({ adminPage: 'despesas' });
  const goAdminAdministradores = () => setState({ adminPage: 'administradores' });
  const goAdminRelatorios = () => setState({ adminPage: 'relatorios' });
  const goAssocInicio = () => setState({ assocPage: 'inicio' });
  const goAssocPagar = () => setState({ assocPage: 'pagar' });
  const goAssocHistorico = () => setState({ assocPage: 'historico' });
  const setPayPix = () => setState({ payMethod: 'pix' });
  const setPayBoleto = () => setState({ payMethod: 'boleto' });

  const openAddAssociado = () => setState({ showAddAssociado: true, newAssociado: { name: '', unit: '', email: '', value: 80 } });
  const closeAddAssociado = () => setState({ showAddAssociado: false });
  const setNewAssociadoName = (e) => setState((p) => ({ newAssociado: { ...p.newAssociado, name: e.target.value } }));
  const setNewAssociadoUnit = (e) => setState((p) => ({ newAssociado: { ...p.newAssociado, unit: e.target.value } }));
  const setNewAssociadoEmail = (e) => setState((p) => ({ newAssociado: { ...p.newAssociado, email: e.target.value } }));
  const setNewAssociadoValue = (e) => setState((p) => ({ newAssociado: { ...p.newAssociado, value: parseFloat(e.target.value) || 0 } }));
  const confirmAddAssociado = () => {
    const n = s.newAssociado;
    if (!n.name.trim()) return;
    const a = { id: Date.now(), name: n.name, unit: n.unit || '—', email: n.email || '—', phone: '—', address: '—', value: n.value || 0, consumption: 0, dueDate: '10/07', status: 'pendente' };
    setState((p) => ({ associados: [...p.associados, a], showAddAssociado: false }));
    showToast('Associado adicionado');
  };

  const openAddExpense = () => setState({ showAddExpense: true, editingExpenseId: null, newExpense: { description: '', category: 'Manutenção', value: '', receiptLabel: '+ Anexar arquivo' } });
  const openEditExpense = (exp) =>
    setState({
      showAddExpense: true,
      editingExpenseId: exp.id,
      newExpense: { description: exp.description, category: exp.category, value: exp.value, receiptLabel: exp.receipt && exp.receipt !== 'sem-comprovante' ? '✓ ' + exp.receipt : '+ Anexar arquivo' },
    });
  const closeAddExpense = () => setState({ showAddExpense: false, editingExpenseId: null });
  const setNewExpenseDescription = (e) => setState((p) => ({ newExpense: { ...p.newExpense, description: e.target.value } }));
  const setNewExpenseCategory = (e) => setState((p) => ({ newExpense: { ...p.newExpense, category: e.target.value } }));
  const setNewExpenseValue = (e) => setState((p) => ({ newExpense: { ...p.newExpense, value: e.target.value } }));
  const handleReceiptFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) setState((p) => ({ newExpense: { ...p.newExpense, receiptLabel: '✓ ' + f.name } }));
  };
  const confirmAddExpense = () => {
    const n = s.newExpense;
    if (!n.description.trim() || !n.value) return;
    const receipt = n.receiptLabel.startsWith('✓') ? n.receiptLabel.slice(2) : 'sem-comprovante';
    if (s.editingExpenseId) {
      setState((p) => ({
        expenses: p.expenses.map((x) => (x.id === p.editingExpenseId ? { ...x, description: n.description, category: n.category, value: parseFloat(n.value) || 0, receipt } : x)),
        showAddExpense: false,
        editingExpenseId: null,
      }));
      showToast('Despesa atualizada');
    } else {
      const e = { id: Date.now(), date: '15/07', description: n.description, category: n.category, value: parseFloat(n.value) || 0, receipt };
      setState((p) => ({ expenses: [e, ...p.expenses], showAddExpense: false }));
      showToast('Despesa lançada');
    }
  };

  const openAddAdmin = () => setState({ showAddAdmin: true, newAdmin: { name: '', email: '', cargo: 'Administrador Geral' } });
  const closeAddAdmin = () => setState({ showAddAdmin: false });
  const setNewAdminName = (e) => setState((p) => ({ newAdmin: { ...p.newAdmin, name: e.target.value } }));
  const setNewAdminEmail = (e) => setState((p) => ({ newAdmin: { ...p.newAdmin, email: e.target.value } }));
  const setNewAdminCargo = (e) => setState((p) => ({ newAdmin: { ...p.newAdmin, cargo: e.target.value } }));
  const confirmAddAdmin = () => {
    const n = s.newAdmin;
    if (!n.name.trim()) return;
    setState((p) => ({ admins: [...p.admins, { id: Date.now(), name: n.name, email: n.email || '—', cargo: n.cargo }], showAddAdmin: false }));
    showToast('Administrador adicionado');
  };

  const selectOnlyInvoice = (id) => setState({ selectedInvoiceIds: { [id]: true }, assocPage: 'pagar' });
  const goPagarTodas = () => {
    const ids = {};
    s.assocInvoices.filter((i) => i.status !== 'pago').forEach((i) => { ids[i.id] = true; });
    setState({ selectedInvoiceIds: ids, assocPage: 'pagar' });
  };
  const toggleSelectedInvoice = (id) => setState((p) => ({ selectedInvoiceIds: { ...p.selectedInvoiceIds, [id]: !p.selectedInvoiceIds[id] } }));
  const confirmPayment = () => {
    const sel = s.selectedInvoiceIds;
    const n = Object.keys(sel).filter((k) => sel[k]).length;
    if (n === 0) { showToast('Selecione ao menos uma fatura'); return; }
    const updatedInvoices = s.assocInvoices.map((i) => (sel[i.id] ? { ...i, status: 'pago' } : i));
    const stillOpen = updatedInvoices.some((i) => i.status !== 'pago');
    const demoId = s.associados[2].id;
    setState((p) => ({
      assocInvoices: updatedInvoices,
      selectedInvoiceIds: {},
      assocPage: 'inicio',
      associados: p.associados.map((a) => (a.id === demoId ? { ...a, status: stillOpen ? 'pendente' : 'pago' } : a)),
      cobrancasEnviadas: { ...p.cobrancasEnviadas, [demoId]: false },
    }));
    showToast(`Pagamento confirmado — ${n} fatura${n === 1 ? '' : 's'} quitada${n === 1 ? '' : 's'}`);
  };
  const copyPix = () => {
    try { navigator.clipboard.writeText('00020126580014BR.GOV.BCB.PIX0136assoc-aguas@pix.com.br5204000053039865802BR5913ASSOC AGUAS6009SAO PAULO62070503***6304ABCD'); } catch { /* ignore */ }
    showToast('Código Pix copiado');
  };
  const copyBoleto = () => {
    try { navigator.clipboard.writeText('34191.79001 01043.510047 91020.150008 8 99340000008500'); } catch { /* ignore */ }
    showToast('Código copiado');
  };
  const downloadBoleto = () => showToast('Download do boleto iniciado');
  const enviarCobranca = (id, name) => {
    if (s.cobrancasEnviadas[id]) return;
    setState((p) => ({ cobrancasEnviadas: { ...p.cobrancasEnviadas, [id]: true } }));
    showToast(`Cobrança enviada para ${name} — só é possível cobrar 1x por mês`);
  };
  const cobrarTodos = () => {
    const pendentes = s.associados.filter((a) => a.status !== 'pago' && !s.cobrancasEnviadas[a.id]);
    if (pendentes.length === 0) { showToast('Todas as cobranças do mês já foram enviadas'); return; }
    const novo = { ...s.cobrancasEnviadas };
    pendentes.forEach((a) => { novo[a.id] = true; });
    setState({ cobrancasEnviadas: novo });
    showToast(`Cobrança enviada para ${pendentes.length} associado${pendentes.length === 1 ? '' : 's'}`);
  };
  const openViewProfile = (id) => setState({ showViewProfile: true, viewProfileId: id });
  const closeViewProfile = () => setState({ showViewProfile: false });

  const openEditProfile = () => {
    const p = s.associados[2];
    setState({ showEditProfile: true, editProfileDraft: { name: p.name, email: p.email, phone: p.phone, address: p.address } });
  };
  const closeEditProfile = () => setState({ showEditProfile: false });
  const setEditProfileName = (e) => setState((p) => ({ editProfileDraft: { ...p.editProfileDraft, name: e.target.value } }));
  const setEditProfileEmail = (e) => setState((p) => ({ editProfileDraft: { ...p.editProfileDraft, email: e.target.value } }));
  const setEditProfilePhone = (e) => setState((p) => ({ editProfileDraft: { ...p.editProfileDraft, phone: e.target.value } }));
  const setEditProfileAddress = (e) => setState((p) => ({ editProfileDraft: { ...p.editProfileDraft, address: e.target.value } }));
  const saveEditProfile = () => {
    const d = s.editProfileDraft;
    const id = s.associados[2].id;
    setState((p) => ({ associados: p.associados.map((x) => (x.id === id ? { ...x, ...d } : x)), showEditProfile: false }));
    showToast('Perfil atualizado');
  };

  const generateMonthlyCharges = () => {
    const idx = s.billingMonthIndex % s.billingMonthNames.length;
    const monthLabel = s.billingMonthNames[idx];
    const dueDate = s.billingDueDates[idx].slice(0, 5);
    const demo = s.associados[2];
    const newInvoice = { id: Date.now(), month: monthLabel, value: demo.value, dueDate: s.billingDueDates[idx], status: 'pendente' };
    setState((p) => ({
      associados: p.associados.map((a) => ({ ...a, status: 'pendente', dueDate })),
      cobrancasEnviadas: {},
      billingMonthIndex: p.billingMonthIndex + 1,
      assocInvoices: [...p.assocInvoices, newInvoice],
    }));
    showToast(`Cobranças de ${monthLabel} geradas para ${s.associados.length} associados`);
  };
  const openBulkDueDate = () => setState({ showBulkDueDate: true });
  const closeBulkDueDate = () => setState({ showBulkDueDate: false });
  const setBulkDueDate = (e) => setState({ bulkDueDate: e.target.value });
  const confirmBulkDueDate = () => {
    const d = s.bulkDueDate;
    if (!d.trim()) return;
    setState((p) => ({ associados: p.associados.map((a) => ({ ...a, dueDate: d })), showBulkDueDate: false }));
    showToast(`Vencimento atualizado para ${d} em todos os associados`);
  };
  const exportPdf = () => showToast('Exportando relatório em PDF...');
  const exportCsv = () => showToast('Exportando relatório em CSV...');

  // --- derived values (mirrors renderVals() from the design prototype) ---
  const associados = s.associados.map((a) => {
    const meta = STATUS_META[a.status];
    const isPago = a.status === 'pago';
    const isAtrasado = a.status === 'atrasado';
    const multa = multaFor(a.value, a.status);
    return {
      ...a,
      initials: initials(a.name),
      valueFmt: brl(a.value),
      multaFmt: multa > 0 ? brl(multa) : null,
      statusLabel: isAtrasado ? `${meta.label} · multa ${brl(multa)}` : meta.label,
      statusBg: meta.bg,
      statusColor: meta.color,
      onOpenProfile: () => openViewProfile(a.id),
      onValueChange: (e) => { const v = parseFloat(e.target.value) || 0; setState((p) => ({ associados: p.associados.map((x) => (x.id === a.id ? { ...x, value: v } : x)) })); },
      dueDateColor: isAtrasado ? 'oklch(50% 0.18 25)' : 'oklch(20% 0.02 230)',
      dueDateBorder: isAtrasado ? 'oklch(75% 0.1 25)' : 'oklch(89% 0.01 230)',
      onConsumptionChange: (e) => { const v = Number(e.target.value); setState((p) => ({ associados: p.associados.map((x) => (x.id === a.id ? { ...x, consumption: v } : x)) })); },
      onDelete: () => setState((p) => ({ associados: p.associados.filter((x) => x.id !== a.id) })),
      onDueDateChange: (e) => { const v = e.target.value; setState((p) => ({ associados: p.associados.map((x) => (x.id === a.id ? { ...x, dueDate: v } : x)) })); },
      showCobrar: !isPago && !s.cobrancasEnviadas[a.id],
      showEnviado: !isPago && !!s.cobrancasEnviadas[a.id],
      showCobrado: isPago,
      cobrarLabel: isAtrasado ? 'Cobrar novamente' : 'Cobrar',
      cobrarBg: isAtrasado ? 'oklch(93% 0.05 25)' : '#fff',
      cobrarColor: isAtrasado ? 'oklch(45% 0.15 25)' : 'oklch(32% 0.08 220)',
      cobrarBorder: isAtrasado ? 'oklch(85% 0.06 25)' : 'oklch(32% 0.08 220)',
      onCobrar: () => enviarCobranca(a.id, a.name),
    };
  });

  const expenses = s.expenses.map((e) => ({ ...e, valueFmt: brl(e.value), onDelete: () => setState((p) => ({ expenses: p.expenses.filter((x) => x.id !== e.id) })), onEdit: () => openEditExpense(e) }));
  const admins = s.admins.map((a) => ({ ...a, initials: initials(a.name), onDelete: () => setState((p) => ({ admins: p.admins.filter((x) => x.id !== a.id) })) }));

  const arrecadado = associados.filter((a) => a.status === 'pago').reduce((sum, a) => sum + a.value, 0);
  const gasto = expenses.reduce((sum, e) => sum + e.value, 0);
  const saldo = arrecadado - gasto;
  const inadimplentes = associados.filter((a) => a.status !== 'pago').length;
  const inadimplenciaPct = Math.round((inadimplentes / associados.length) * 100);
  const pagoCount = associados.filter((a) => a.status === 'pago').length;
  const pagoPct = Math.round((pagoCount / associados.length) * 100);

  const stats = {
    arrecadadoFmt: brl(arrecadado),
    gastoFmt: brl(gasto),
    saldoFmt: brl(saldo),
    saldoColor: saldo >= 0 ? 'oklch(38% 0.13 150)' : 'oklch(45% 0.15 25)',
    inadimplenciaPct,
    pagoPct,
  };

  const revHist = [6600, 7100, 6900, 7600, 7300, arrecadado];
  const maxRev = Math.max(...revHist);
  const months = ['Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
  const revenueBars = revHist.map((v, i) => ({ month: months[i], valueFmt: brl(v).replace('R$', '').trim(), heightPct: Math.round((v / maxRev) * 100), color: i === 5 ? 'oklch(45% 0.13 210)' : 'oklch(85% 0.03 220)' }));

  const pendenteCount = associados.filter((a) => a.status === 'pendente').length;
  const atrasadoCount = associados.filter((a) => a.status === 'atrasado').length;
  const total = associados.length;
  const circumference = 2 * Math.PI * 60;
  let offsetAcc = 0;
  const segCounts = [
    { label: 'Pago', count: pagoCount, color: 'oklch(55% 0.13 150)' },
    { label: 'Pendente', count: pendenteCount, color: 'oklch(70% 0.14 80)' },
    { label: 'Atrasado', count: atrasadoCount, color: 'oklch(58% 0.18 25)' },
  ];
  const donutSegments = segCounts.map((seg) => {
    const frac = seg.count / total;
    const dash = frac * circumference;
    const seg2 = { ...seg, dashArray: `${dash.toFixed(1)} ${circumference.toFixed(1)}`, dashOffset: (-offsetAcc).toFixed(1) };
    offsetAcc += dash;
    return seg2;
  });

  const overdueList = associados.filter((a) => a.status === 'atrasado').map((a) => ({ initials: a.initials, name: a.name, unit: a.unit, valueFmt: a.valueFmt }));

  const searchQ = s.associadoSearch.trim().toLowerCase();
  const associadosFiltered = searchQ ? associados.filter((a) => a.name.toLowerCase().includes(searchQ) || a.unit.toLowerCase().includes(searchQ) || a.email.toLowerCase().includes(searchQ)) : associados;
  const pageSize = s.associadoPageSize;
  const totalPages = Math.max(1, Math.ceil(associadosFiltered.length / pageSize));
  const currentPage = Math.min(s.associadoPage, totalPages - 1);
  const associadosPage = associadosFiltered.slice(currentPage * pageSize, currentPage * pageSize + pageSize);
  const pageLabel = `Página ${currentPage + 1} de ${totalPages} · ${associadosFiltered.length} associado(s)`;

  const isMobile = s.isMobile;
  const modalWidth = isMobile ? '92vw' : '400px';

  const viewProfileData = s.viewProfileId ? associados.find((a) => a.id === s.viewProfileId) : null;
  const assocProfile = associados[2];
  const invoicesOpen = s.assocInvoices.filter((i) => i.status !== 'pago');
  const hasOverdue = invoicesOpen.some((i) => i.status === 'atrasado');
  const totalAberto = invoicesOpen.reduce((sum, i) => sum + i.value + multaFor(i.value, i.status), 0);
  const currentInvoice = {
    valueFmt: brl(totalAberto),
    dueDate: invoicesOpen[0] ? invoicesOpen[0].dueDate : '—',
    dueDateColor: hasOverdue ? 'oklch(75% 0.13 25)' : 'oklch(85% 0.03 220)',
    consumption: assocProfile.consumption,
    statusLabel: hasOverdue ? 'Em atraso' : invoicesOpen.length ? 'Pendente' : 'Em dia',
    statusBg: hasOverdue ? 'oklch(55% 0.18 25)' : 'rgba(255,255,255,0.18)',
    statusColor: '#fff',
    cardBg: hasOverdue ? 'linear-gradient(160deg, oklch(48% 0.15 25), oklch(38% 0.14 20))' : 'linear-gradient(160deg, oklch(32% 0.08 220), oklch(24% 0.07 235))',
    count: invoicesOpen.length,
  };
  const invoicesList = s.assocInvoices.map((inv) => {
    const meta = STATUS_META[inv.status];
    const multaInv = multaFor(inv.value, inv.status);
    return {
      ...inv,
      valueFmt: brl(inv.value + multaInv),
      statusLabel: multaInv > 0 ? `${meta.label} +${brl(multaInv)}` : meta.label,
      statusBg: meta.bg,
      statusColor: meta.color,
      dueDateColor: inv.status === 'atrasado' ? 'oklch(50% 0.18 25)' : 'oklch(35% 0.02 230)',
      canPay: inv.status !== 'pago',
      onPagar: () => selectOnlyInvoice(inv.id),
    };
  });
  const selectedInvoices = invoicesOpen.map((inv) => {
    const multaInv = multaFor(inv.value, inv.status);
    return { ...inv, valueFmt: brl(inv.value + multaInv), checked: !!s.selectedInvoiceIds[inv.id], onToggle: () => toggleSelectedInvoice(inv.id), _total: inv.value + multaInv };
  });
  const selectedTotal = selectedInvoices.filter((i) => i.checked).reduce((sum, i) => sum + i._total, 0);
  const selectedTotalFmt = brl(selectedTotal);

  const paymentHistory = PAYMENT_HISTORY_DATA.map((p) => {
    const meta = STATUS_META[p.status];
    return { ...p, valueFmt: brl(p.value), statusLabel: meta.label, statusBg: meta.bg, statusColor: meta.color, canDownload: p.status === 'pago', onDownload: () => showToast('Baixando comprovante de ' + p.ref) };
  });

  const qrCells = Array.from({ length: 100 }, (_, i) => {
    const row = Math.floor(i / 10);
    const col = i % 10;
    const topLeft = row < 7 && col < 7;
    const topRight = row < 7 && col >= 3 && col < 10 && col >= 10 - 7;
    const bottomLeft = row >= 10 - 7 && col < 7;
    let on;
    if (topLeft || topRight || bottomLeft) {
      const r = topLeft ? row : topRight ? row : row - 3;
      const c = topLeft ? col : topRight ? col - 3 : col;
      on = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
    } else {
      on = seeded(i) > 0.55;
    }
    return { color: on ? 'oklch(20% 0.01 230)' : '#fff' };
  });

  const barcodeBars = Array.from({ length: 45 }, (_, i) => ({ width: 2 + Math.round(seeded(i * 3) * 4), color: i % 3 === 0 ? '#fff' : 'oklch(15% 0.01 230)' }));

  const appShellStyle = { minHeight: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', background: 'oklch(97.5% 0.006 230)' };
  const mainStyle = { flex: '1', minWidth: 0, padding: isMobile ? '20px 16px 40px' : '32px 40px 60px', maxWidth: isMobile ? '100%' : '1180px' };

  const currentUserInitials = s.role === 'admin' ? 'RC' : initials(assocProfile.name);
  const currentUserName = s.role === 'admin' ? 'Roberto Cardoso' : assocProfile.name;
  const currentUserFirstName = assocProfile.name.split(' ')[0];
  const currentUserRoleLabel = s.role === 'admin' ? 'Administrador' : 'Associado';
  const sidebarProfileClick = s.role === 'associado' ? openEditProfile : () => {};

  const expenseModalTitle = s.editingExpenseId ? 'Editar despesa' : 'Lançar despesa';
  const expenseConfirmLabel = s.editingExpenseId ? 'Salvar' : 'Lançar';

  if (s.screen === 'login') {
    return (
      <Login
        isMobile={isMobile}
        loginRole={s.loginRole}
        setLoginRoleAdmin={setLoginRoleAdmin}
        setLoginRoleAssoc={setLoginRoleAssoc}
        doLogin={doLogin}
        associadosCount={associados.length}
        inadimplenciaPct={stats.inadimplenciaPct}
      />
    );
  }

  return (
    <div style={appShellStyle}>
      <Sidebar
        isMobile={isMobile}
        role={s.role}
        adminPage={s.adminPage}
        assocPage={s.assocPage}
        goAdminDashboard={goAdminDashboard}
        goAdminAssociados={goAdminAssociados}
        goAdminDespesas={goAdminDespesas}
        goAdminAdministradores={goAdminAdministradores}
        goAdminRelatorios={goAdminRelatorios}
        goAssocInicio={goAssocInicio}
        goAssocPagar={goAssocPagar}
        goAssocHistorico={goAssocHistorico}
        currentUserInitials={currentUserInitials}
        currentUserName={currentUserName}
        currentUserRoleLabel={currentUserRoleLabel}
        sidebarProfileClick={sidebarProfileClick}
        doLogout={doLogout}
      />

      <main style={mainStyle}>
        {s.role === 'admin' && s.adminPage === 'dashboard' && (
          <Dashboard isMobile={isMobile} stats={stats} revenueBars={revenueBars} donutSegments={donutSegments} overdueList={overdueList} goAdminAssociados={goAdminAssociados} />
        )}
        {s.role === 'admin' && s.adminPage === 'associados' && (
          <Associados
            isMobile={isMobile}
            associadosFull={associadosPage}
            associadoSearch={s.associadoSearch}
            setAssociadoSearch={setAssociadoSearch}
            pageLabel={pageLabel}
            prevDisabled={currentPage <= 0}
            nextDisabled={currentPage >= totalPages - 1}
            goAssociadoPrevPage={goAssociadoPrevPage}
            goAssociadoNextPage={goAssociadoNextPage}
            generateMonthlyCharges={generateMonthlyCharges}
            openBulkDueDate={openBulkDueDate}
            cobrarTodos={cobrarTodos}
            openAddAssociado={openAddAssociado}
          />
        )}
        {s.role === 'admin' && s.adminPage === 'despesas' && <Despesas expenses={expenses} openAddExpense={openAddExpense} />}
        {s.role === 'admin' && s.adminPage === 'administradores' && <Administradores isMobile={isMobile} admins={admins} openAddAdmin={openAddAdmin} />}
        {s.role === 'admin' && s.adminPage === 'relatorios' && <Relatorios stats={stats} exportPdf={exportPdf} exportCsv={exportCsv} />}

        {s.role === 'associado' && s.assocPage === 'inicio' && (
          <Inicio isMobile={isMobile} currentUserFirstName={currentUserFirstName} currentInvoice={currentInvoice} assocProfile={assocProfile} invoicesList={invoicesList} goPagarTodas={goPagarTodas} />
        )}
        {s.role === 'associado' && s.assocPage === 'pagar' && (
          <Pagar
            selectedInvoices={selectedInvoices}
            selectedTotalFmt={selectedTotalFmt}
            hasSelectedInvoices={selectedInvoices.length > 0}
            payMethod={s.payMethod}
            setPayPix={setPayPix}
            setPayBoleto={setPayBoleto}
            qrCells={qrCells}
            pixCode="00020126580014BR.GOV.BCB.PIX0136assoc-aguas@pix.com.br520400005303986580 5802BR5913ASSOC AGUAS6009SAO PAULO62070503***6304ABCD"
            copyPix={copyPix}
            barcodeBars={barcodeBars}
            boletoLine="34191.79001 01043.510047 91020.150008 8 99340000008500"
            copyBoleto={copyBoleto}
            downloadBoleto={downloadBoleto}
            confirmPayment={confirmPayment}
          />
        )}
        {s.role === 'associado' && s.assocPage === 'historico' && <Historico paymentHistory={paymentHistory} />}
      </main>

      <Toast message={s.toast} />

      {s.showViewProfile && <ViewProfileModal width={modalWidth} data={viewProfileData} close={closeViewProfile} />}

      {s.showEditProfile && (
        <EditProfileModal
          width={modalWidth}
          draft={s.editProfileDraft}
          setName={setEditProfileName}
          setEmail={setEditProfileEmail}
          setPhone={setEditProfilePhone}
          setAddress={setEditProfileAddress}
          close={closeEditProfile}
          save={saveEditProfile}
        />
      )}

      {s.showAddAssociado && (
        <AddAssociadoModal
          width={modalWidth}
          newAssociado={s.newAssociado}
          setName={setNewAssociadoName}
          setUnit={setNewAssociadoUnit}
          setEmail={setNewAssociadoEmail}
          setValue={setNewAssociadoValue}
          close={closeAddAssociado}
          confirm={confirmAddAssociado}
        />
      )}

      {s.showBulkDueDate && (
        <BulkDueDateModal width={modalWidth} bulkDueDate={s.bulkDueDate} setBulkDueDate={setBulkDueDate} close={closeBulkDueDate} confirm={confirmBulkDueDate} />
      )}

      {s.showAddExpense && (
        <AddExpenseModal
          width={modalWidth}
          title={expenseModalTitle}
          confirmLabel={expenseConfirmLabel}
          newExpense={s.newExpense}
          setDescription={setNewExpenseDescription}
          setCategory={setNewExpenseCategory}
          setValue={setNewExpenseValue}
          handleReceiptFile={handleReceiptFile}
          close={closeAddExpense}
          confirm={confirmAddExpense}
        />
      )}

      {s.showAddAdmin && (
        <AddAdminModal width={modalWidth} newAdmin={s.newAdmin} setName={setNewAdminName} setEmail={setNewAdminEmail} setCargo={setNewAdminCargo} close={closeAddAdmin} confirm={confirmAddAdmin} />
      )}
    </div>
  );
}
