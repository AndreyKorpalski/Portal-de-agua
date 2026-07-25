import { useCallback, useEffect, useRef, useState } from 'react';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Skeleton from './components/Skeleton';
import Dashboard from './components/admin/Dashboard';
import Associados from './components/admin/Associados';
import Cobranca from './components/admin/Cobranca';
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
import ConfirmModal from './components/modals/ConfirmModal';
import BillingSettingsModal from './components/modals/BillingSettingsModal';
import { brl, initials, seeded, multaFor, STATUS_META } from './utils/format';
import { translateError } from './utils/errors';
import { sameMonth, MONTH_NAMES_PT } from './utils/date';
import { mapWithConcurrency } from './utils/concurrency';
import { calcBillingValue } from './utils/billing';
import { supabase } from './lib/supabaseClient';
import { signIn, signUp, signOut, fetchProfile, sendPasswordReset, updateAuthEmail } from './lib/auth';
import {
  fetchAssociados, insertAssociado, updateAssociado, deleteAssociado,
  fetchDespesas, insertDespesa, updateDespesa, deleteDespesa,
  fetchAdmins, insertAdmin, deleteAdmin,
  fetchOwnAssociado, fetchFaturasByAssociado, fetchFaturas, insertFatura, markFaturasPaid,
  sendCobrancaEmail, fetchBillingSettings, updateBillingSettings,
} from './lib/db';
import { exportReportPdf, exportReportCsv } from './lib/reports';

const MONTH_ABBR_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const INITIAL_STATE = {
  // autenticação
  session: undefined, // undefined = ainda não checou; null = deslogado; objeto = logado
  profile: null,
  authError: null,
  authView: 'login', // 'login' | 'cadastro'

  // dados carregados do banco
  dataLoading: false,
  associados: [], despesas: [], admins: [], allFaturas: [], // papel admin
  billingSettings: { minValue: 12, pricePerM3: 3, extraCharges: [] },
  ownAssociado: null, faturas: [], // papel associado (ou "Minha conta" de um admin)

  // navegação / UI
  adminPage: 'dashboard', assocPage: 'inicio', payMethod: 'pix',
  viewMode: 'admin', // 'admin' | 'associado' — só importa pra quem tem papel admin
  toast: null,
  showAddAssociado: false, showAddExpense: false, showAddAdmin: false,
  newAssociado: { name: '', unit: '', email: '', value: 80 },
  newExpense: { description: '', category: 'Manutenção', value: '' },
  editingExpenseId: null,
  associadoSearch: '', associadoPage: 0, associadoPageSize: 5,
  despesaSearch: '', despesaPage: 0, despesaPageSize: 8,
  adminSearch: '', adminListPage: 0, adminListPageSize: 8,
  relatorioPeriod: '', relatorioAssociadoId: null,
  cobrancaStatusFilter: 'todos',
  isMobile: false,
  newAdmin: { name: '', email: '', cargo: 'Administrador Geral' },
  showBulkDueDate: false, bulkDueDate: '10',
  showViewProfile: false, viewProfileId: null,
  showEditProfile: false, editingAssociadoId: null, editProfileDraft: { name: '', email: '', phone: '', address: '', unit: '' },
  selectedInvoiceIds: {},
  confirmDialog: null,
  showBillingSettings: false, billingSettingsDraft: null,
  sendingChargeIds: {}, bulkCobrancaSending: false,
};

const BLANK_UI_STATE = {
  adminPage: 'dashboard', assocPage: 'inicio', payMethod: 'pix',
  viewMode: 'admin',
  toast: null,
  showAddAssociado: false, showAddExpense: false, showAddAdmin: false,
  newAssociado: { name: '', unit: '', email: '', value: 80 },
  newExpense: { description: '', category: 'Manutenção', value: '' },
  editingExpenseId: null,
  associadoSearch: '', associadoPage: 0,
  despesaSearch: '', despesaPage: 0,
  adminSearch: '', adminListPage: 0,
  relatorioPeriod: '', relatorioAssociadoId: null,
  cobrancaStatusFilter: 'todos',
  newAdmin: { name: '', email: '', cargo: 'Administrador Geral' },
  showBulkDueDate: false, bulkDueDate: '10',
  showViewProfile: false, viewProfileId: null,
  showEditProfile: false, editingAssociadoId: null, editProfileDraft: { name: '', email: '', phone: '', address: '', unit: '' },
  selectedInvoiceIds: {},
  confirmDialog: null,
  showBillingSettings: false, billingSettingsDraft: null,
  sendingChargeIds: {}, bulkCobrancaSending: false,
};

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
  const s = state;

  const showToast = useCallback(
    (msg) => {
      setState({ toast: msg });
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setState({ toast: null }), 2200);
    },
    [setState],
  );

  // --- modal de confirmação genérico (substitui window.confirm) ---
  const askConfirm = ({ title, message, confirmLabel, danger, onConfirm }) => {
    setState({ confirmDialog: { title, message, confirmLabel, danger, onConfirm } });
  };
  const closeConfirm = () => setState({ confirmDialog: null });
  const runConfirm = async () => {
    const dlg = s.confirmDialog;
    if (!dlg) return;
    setState({ confirmDialog: null });
    await dlg.onConfirm();
  };

  // --- viewport ---
  useEffect(() => {
    const updateViewport = () => setState({ isMobile: window.innerWidth < 860 });
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, [setState]);

  // --- sessão do Supabase ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setState({ session: data.session }));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setState({ session: newSession });
    });
    return () => sub.subscription.unsubscribe();
  }, [setState]);

  // --- perfil do usuário logado ---
  useEffect(() => {
    if (!s.session) {
      setState({ profile: null });
      return;
    }
    let active = true;
    fetchProfile(s.session.user.id)
      .then((p) => { if (active) setState({ profile: p }); })
      .catch((err) => { if (active) showToast('Erro ao carregar perfil: ' + translateError(err.message)); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.session?.user?.id]);

  // --- dados conforme o papel do usuário ---
  useEffect(() => {
    if (!s.profile) return;
    let active = true;
    setState({ dataLoading: true });
    (async () => {
      try {
        if (s.profile.role === 'admin') {
          const [associados, despesas, admins, allFaturas, billingSettings, own] = await Promise.all([
            fetchAssociados(), fetchDespesas(), fetchAdmins(), fetchFaturas(), fetchBillingSettings(), fetchOwnAssociado(s.profile.id),
          ]);
          if (!active) return;
          // todo admin também é morador (paga água) — carrega a fatura dele
          // igual carregaria pra um associado comum, pra alimentar a seção "Minha conta"
          const faturas = own ? await fetchFaturasByAssociado(own.id) : [];
          if (!active) return;
          setState({ associados, despesas, admins, allFaturas, billingSettings, ownAssociado: own, faturas, dataLoading: false });
        } else {
          const own = await fetchOwnAssociado(s.profile.id);
          if (!active) return;
          const faturas = own ? await fetchFaturasByAssociado(own.id) : [];
          if (!active) return;
          setState({ ownAssociado: own, faturas, dataLoading: false });
        }
      } catch (err) {
        if (!active) return;
        setState({ dataLoading: false });
        showToast('Erro ao carregar dados: ' + translateError(err.message));
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.profile?.id, s.profile?.role]);

  // --- auth handlers ---
  const doSignIn = async ({ email, password, role }) => {
    const data = await signIn({ email, password });
    const userId = data?.user?.id ?? data?.session?.user?.id;
    const profile = await fetchProfile(userId);
    if (role && profile.role !== role) {
      await signOut();
      const label = role === 'admin' ? 'administrador' : 'associado';
      throw new Error(`Essa conta não é de ${label}. Verifique a aba selecionada e tente novamente.`);
    }
    return data;
  };
  const doSignUp = async ({ email, password, name, role }) => signUp({ email, password, name, role });
  const goCadastro = () => setState({ authView: 'cadastro' });
  const goLoginView = () => setState({ authView: 'login' });
  const doLogout = async () => {
    await signOut();
    setState({
      associados: [], despesas: [], admins: [], allFaturas: [],
      billingSettings: { minValue: 12, pricePerM3: 3, extraCharges: [] },
      ownAssociado: null, faturas: [],
      ...BLANK_UI_STATE,
    });
  };

  // --- navegação ---
  const goAdminDashboard = () => setState({ adminPage: 'dashboard', viewMode: 'admin' });
  const goAdminAssociados = () => setState({ adminPage: 'associados', viewMode: 'admin' });
  const goAdminCobranca = () => setState({ adminPage: 'cobranca', viewMode: 'admin' });
  const goAdminDespesas = () => setState({ adminPage: 'despesas', viewMode: 'admin' });
  const goAdminAdministradores = () => setState({ adminPage: 'administradores', viewMode: 'admin' });
  const goAdminRelatorios = () => setState({ adminPage: 'relatorios', viewMode: 'admin' });
  const goAssocInicio = () => setState({ assocPage: 'inicio', viewMode: 'associado' });
  const goAssocPagar = () => setState({ assocPage: 'pagar', viewMode: 'associado' });
  const goAssocHistorico = () => setState({ assocPage: 'historico', viewMode: 'associado' });
  const setPayPix = () => setState({ payMethod: 'pix' });
  const setPayBoleto = () => setState({ payMethod: 'boleto' });

  const setAssociadoSearch = (e) => setState({ associadoSearch: e.target.value, associadoPage: 0 });
  const setCobrancaStatusFilter = (e) => setState({ cobrancaStatusFilter: e.target.value, associadoPage: 0 });
  const goAssociadoPrevPage = () => setState((p) => ({ associadoPage: Math.max(0, p.associadoPage - 1) }));
  const goAssociadoNextPage = () => setState((p) => ({ associadoPage: p.associadoPage + 1 }));
  const setDespesaSearch = (e) => setState({ despesaSearch: e.target.value, despesaPage: 0 });
  const goDespesaPrevPage = () => setState((p) => ({ despesaPage: Math.max(0, p.despesaPage - 1) }));
  const goDespesaNextPage = () => setState((p) => ({ despesaPage: p.despesaPage + 1 }));
  const setAdminSearch = (e) => setState({ adminSearch: e.target.value, adminListPage: 0 });
  const goAdminListPrevPage = () => setState((p) => ({ adminListPage: Math.max(0, p.adminListPage - 1) }));
  const goAdminListNextPage = () => setState((p) => ({ adminListPage: p.adminListPage + 1 }));

  // --- associados (admin) ---
  const openAddAssociado = () => setState({ showAddAssociado: true, newAssociado: { name: '', unit: '', email: '', value: s.billingSettings.minValue } });
  const closeAddAssociado = () => setState({ showAddAssociado: false });
  const setNewAssociadoName = (e) => setState((p) => ({ newAssociado: { ...p.newAssociado, name: e.target.value } }));
  const setNewAssociadoUnit = (e) => setState((p) => ({ newAssociado: { ...p.newAssociado, unit: e.target.value } }));
  const setNewAssociadoEmail = (e) => setState((p) => ({ newAssociado: { ...p.newAssociado, email: e.target.value } }));
  const setNewAssociadoValue = (e) => setState((p) => ({ newAssociado: { ...p.newAssociado, value: parseFloat(e.target.value) || 0 } }));
  const confirmAddAssociado = async () => {
    const n = s.newAssociado;
    if (!n.name.trim()) return;
    try {
      const a = await insertAssociado(n);
      setState((p) => ({ associados: [...p.associados, a], showAddAssociado: false }));
      showToast('Associado adicionado');
    } catch (err) {
      showToast('Erro ao adicionar associado: ' + translateError(err.message));
    }
  };

  const openViewProfile = (id) => setState({ showViewProfile: true, viewProfileId: id });
  const closeViewProfile = () => setState({ showViewProfile: false });

  const enviarCobranca = async (id, name) => {
    const a = s.associados.find((x) => x.id === id);
    if (a && sameMonth(a.lastChargeSentAt)) return;
    setState((p) => ({ sendingChargeIds: { ...p.sendingChargeIds, [id]: true } }));
    try {
      await sendCobrancaEmail(id);
      const now = new Date().toISOString();
      setState((p) => ({ associados: p.associados.map((x) => (x.id === id ? { ...x, lastChargeSentAt: now } : x)) }));
      updateAssociado(id, { lastChargeSentAt: now }).catch((err) => showToast('Erro: ' + translateError(err.message)));
      showToast(`Cobrança enviada para ${name} por e-mail`);
    } catch (err) {
      showToast(`Erro ao enviar cobrança para ${name}: ` + translateError(err.message));
    } finally {
      setState((p) => {
        const next = { ...p.sendingChargeIds };
        delete next[id];
        return { sendingChargeIds: next };
      });
    }
  };
  const doCobrarTodos = async () => {
    const pendentes = s.associados.filter((a) => a.status !== 'pago' && !sameMonth(a.lastChargeSentAt));
    if (pendentes.length === 0) { showToast('Todas as cobranças do mês já foram enviadas'); return; }
    setState({ bulkCobrancaSending: true });
    showToast(`Enviando cobrança para ${pendentes.length} associado${pendentes.length === 1 ? '' : 's'}...`);
    try {
      // envia no máximo 5 e-mails em paralelo — evita esmagar o limite de
      // taxa do provedor de e-mail quando há milhares de associados
      const results = await mapWithConcurrency(pendentes, 5, (a) => sendCobrancaEmail(a.id));
      const now = new Date().toISOString();
      const succeeded = pendentes.filter((_, i) => results[i].status === 'fulfilled');
      const succeededIds = new Set(succeeded.map((a) => a.id));
      setState((p) => ({ associados: p.associados.map((a) => (succeededIds.has(a.id) ? { ...a, lastChargeSentAt: now } : a)) }));
      await Promise.all(succeeded.map((a) => updateAssociado(a.id, { lastChargeSentAt: now }).catch(() => {})));
      const failed = pendentes.length - succeeded.length;
      showToast(
        `Cobrança enviada para ${succeeded.length} associado${succeeded.length === 1 ? '' : 's'}` +
          (failed ? ` — ${failed} falharam: ${translateError(results.find((r) => r.status === 'rejected')?.reason?.message)}` : ''),
      );
    } finally {
      setState({ bulkCobrancaSending: false });
    }
  };
  const cobrarTodos = () => {
    const pendentes = s.associados.filter((a) => a.status !== 'pago' && !sameMonth(a.lastChargeSentAt));
    if (pendentes.length === 0) { showToast('Todas as cobranças do mês já foram enviadas'); return; }
    askConfirm({
      title: 'Cobrar todos os associados pendentes?',
      message: `Vamos enviar cobrança por e-mail para ${pendentes.length} associado${pendentes.length === 1 ? '' : 's'} que ainda não pagaram este mês.`,
      confirmLabel: 'Cobrar todos',
      onConfirm: doCobrarTodos,
    });
  };

  const openBulkDueDate = () => setState({ showBulkDueDate: true });
  const closeBulkDueDate = () => setState({ showBulkDueDate: false });
  const setBulkDueDate = (e) => setState({ bulkDueDate: e.target.value.replace(/\D/g, '').slice(0, 2) });
  const applyBulkDueDate = async () => {
    const day = Math.min(31, Math.max(1, parseInt(s.bulkDueDate, 10) || 10));
    const d = String(day);
    const prev = s.associados;
    setState((p) => ({ associados: p.associados.map((a) => ({ ...a, dueDate: d })), showBulkDueDate: false }));
    try {
      await Promise.all(prev.map((a) => updateAssociado(a.id, { dueDate: d })));
      showToast(`Dia de vencimento alterado para ${d} — vale a partir da próxima cobrança gerada`);
    } catch (err) {
      showToast('Erro: ' + translateError(err.message));
    }
  };
  const confirmBulkDueDate = () => {
    const day = Math.min(31, Math.max(1, parseInt(s.bulkDueDate, 10) || 10));
    askConfirm({
      title: 'Alterar dia de vencimento de todos?',
      message: `O novo vencimento será todo dia ${day}. Isso só vale para as próximas cobranças geradas — as faturas pendentes deste mês não são alteradas.`,
      confirmLabel: 'Alterar',
      onConfirm: applyBulkDueDate,
    });
  };

  const doGenerateMonthlyCharges = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const monthNum = now.getMonth() + 1;
    const monthLabel = `${MONTH_NAMES_PT[now.getMonth()]}/${year}`;

    // já cobrado esse mês? não gera de novo (evita fatura duplicada em clique repetido)
    const alreadyBilled = new Set(s.allFaturas.filter((f) => f.month === monthLabel).map((f) => f.associadoId));
    const list = s.associados.filter((a) => !alreadyBilled.has(a.id));
    if (list.length === 0) {
      showToast(`Cobranças de ${monthLabel} já foram geradas para todos os associados`);
      return;
    }

    try {
      const created = await Promise.all(
        list.map((a) => {
          // respeita o vencimento já configurado de cada associado (ex: "15/07" -> dia 15)
          const day = parseInt(String(a.dueDate).split('/')[0], 10) || 10;
          const dueDateIso = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          return insertFatura({ associadoId: a.id, month: monthLabel, value: a.value, dueDateIso, status: 'pendente' });
        }),
      );
      // o status de cada associado é recalculado no banco pelo trigger
      // sync_associado_status a partir das novas faturas — refaz a busca
      // em vez de tentar replicar essa lógica no cliente
      const refreshedAssociados = await fetchAssociados();
      setState((p) => ({ allFaturas: [...p.allFaturas, ...created], associados: refreshedAssociados }));
      const skipped = s.associados.length - list.length;
      showToast(`Cobranças de ${monthLabel} geradas para ${list.length} associados${skipped ? ` (${skipped} já tinham sido cobrados)` : ''}`);
    } catch (err) {
      showToast('Erro: ' + translateError(err.message));
    }
  };
  const generateMonthlyCharges = () => {
    const now = new Date();
    const monthLabel = `${MONTH_NAMES_PT[now.getMonth()]}/${now.getFullYear()}`;
    const alreadyBilled = new Set(s.allFaturas.filter((f) => f.month === monthLabel).map((f) => f.associadoId));
    const pending = s.associados.filter((a) => !alreadyBilled.has(a.id));
    if (pending.length === 0) {
      showToast(`Cobranças de ${monthLabel} já foram geradas para todos os associados`);
      return;
    }
    askConfirm({
      title: 'Gerar cobranças do mês?',
      message: `Isso cria uma fatura pendente de ${monthLabel} para ${pending.length} associado${pending.length === 1 ? '' : 's'}.`,
      confirmLabel: 'Gerar cobranças',
      onConfirm: doGenerateMonthlyCharges,
    });
  };

  const openBillingSettings = () => setState({ showBillingSettings: true, billingSettingsDraft: { ...s.billingSettings, extraCharges: s.billingSettings.extraCharges.map((c) => ({ ...c })) } });
  const closeBillingSettings = () => setState({ showBillingSettings: false });
  const setBillingMinValue = (e) => setState((p) => ({ billingSettingsDraft: { ...p.billingSettingsDraft, minValue: e.target.value } }));
  const setBillingPricePerM3 = (e) => setState((p) => ({ billingSettingsDraft: { ...p.billingSettingsDraft, pricePerM3: e.target.value } }));
  const addExtraCharge = () =>
    setState((p) => ({ billingSettingsDraft: { ...p.billingSettingsDraft, extraCharges: [...p.billingSettingsDraft.extraCharges, { label: '', value: 0 }] } }));
  const removeExtraCharge = (i) =>
    setState((p) => ({ billingSettingsDraft: { ...p.billingSettingsDraft, extraCharges: p.billingSettingsDraft.extraCharges.filter((_, idx) => idx !== i) } }));
  const setExtraChargeLabel = (i, e) =>
    setState((p) => ({
      billingSettingsDraft: {
        ...p.billingSettingsDraft,
        extraCharges: p.billingSettingsDraft.extraCharges.map((c, idx) => (idx === i ? { ...c, label: e.target.value } : c)),
      },
    }));
  const setExtraChargeValue = (i, e) =>
    setState((p) => ({
      billingSettingsDraft: {
        ...p.billingSettingsDraft,
        extraCharges: p.billingSettingsDraft.extraCharges.map((c, idx) => (idx === i ? { ...c, value: e.target.value } : c)),
      },
    }));
  const confirmBillingSettings = async () => {
    const d = s.billingSettingsDraft;
    const settings = {
      minValue: parseFloat(d.minValue) || 0,
      pricePerM3: parseFloat(d.pricePerM3) || 0,
      extraCharges: d.extraCharges.filter((c) => c.label.trim()).map((c) => ({ label: c.label.trim(), value: parseFloat(c.value) || 0 })),
    };
    try {
      const saved = await updateBillingSettings(settings);
      setState({ billingSettings: saved, showBillingSettings: false });
      showToast('Valores de cobrança atualizados');
    } catch (err) {
      showToast('Erro ao salvar valores: ' + translateError(err.message));
    }
  };

  // --- despesas (admin) ---
  const openAddExpense = () => setState({ showAddExpense: true, editingExpenseId: null, newExpense: { description: '', category: 'Manutenção', value: '' } });
  const openEditExpense = (exp) =>
    setState({
      showAddExpense: true,
      editingExpenseId: exp.id,
      newExpense: { description: exp.description, category: exp.category, value: exp.value },
    });
  const closeAddExpense = () => setState({ showAddExpense: false, editingExpenseId: null });
  const setNewExpenseDescription = (e) => setState((p) => ({ newExpense: { ...p.newExpense, description: e.target.value } }));
  const setNewExpenseCategory = (e) => setState((p) => ({ newExpense: { ...p.newExpense, category: e.target.value } }));
  const setNewExpenseValue = (e) => setState((p) => ({ newExpense: { ...p.newExpense, value: e.target.value } }));
  const confirmAddExpense = async () => {
    const n = s.newExpense;
    if (!n.description.trim() || !n.value) return;
    try {
      if (s.editingExpenseId) {
        const updated = await updateDespesa(s.editingExpenseId, { description: n.description, category: n.category, value: parseFloat(n.value) || 0 });
        setState((p) => ({ despesas: p.despesas.map((x) => (x.id === updated.id ? updated : x)), showAddExpense: false, editingExpenseId: null }));
        showToast('Despesa atualizada');
      } else {
        const created = await insertDespesa({ description: n.description, category: n.category, value: parseFloat(n.value) || 0 });
        setState((p) => ({ despesas: [created, ...p.despesas], showAddExpense: false }));
        showToast('Despesa lançada');
      }
    } catch (err) {
      showToast('Erro: ' + translateError(err.message));
    }
  };

  // --- administradores ---
  const openAddAdmin = () => setState({ showAddAdmin: true, newAdmin: { name: '', email: '', cargo: 'Administrador Geral' } });
  const closeAddAdmin = () => setState({ showAddAdmin: false });
  const setNewAdminName = (e) => setState((p) => ({ newAdmin: { ...p.newAdmin, name: e.target.value } }));
  const setNewAdminEmail = (e) => setState((p) => ({ newAdmin: { ...p.newAdmin, email: e.target.value } }));
  const setNewAdminCargo = (e) => setState((p) => ({ newAdmin: { ...p.newAdmin, cargo: e.target.value } }));
  const confirmAddAdmin = async () => {
    const n = s.newAdmin;
    if (!n.name.trim()) return;
    try {
      const created = await insertAdmin(n);
      setState((p) => ({ admins: [...p.admins, created], showAddAdmin: false }));
      showToast('Administrador adicionado');
    } catch (err) {
      showToast('Erro: ' + translateError(err.message));
    }
  };

  // --- fatura / pagamento (associado) ---
  const selectOnlyInvoice = (id) => setState({ selectedInvoiceIds: { [id]: true }, assocPage: 'pagar' });
  const goPagarTodas = () => {
    const ids = {};
    s.faturas.filter((f) => f.status !== 'pago').forEach((f) => { ids[f.id] = true; });
    setState({ selectedInvoiceIds: ids, assocPage: 'pagar' });
  };
  const toggleSelectedInvoice = (id) => setState((p) => ({ selectedInvoiceIds: { ...p.selectedInvoiceIds, [id]: !p.selectedInvoiceIds[id] } }));
  const confirmPayment = async () => {
    const sel = s.selectedInvoiceIds;
    const ids = Object.keys(sel).filter((k) => sel[k]).map(Number);
    if (ids.length === 0) { showToast('Selecione ao menos uma fatura'); return; }
    try {
      const updated = await markFaturasPaid(ids, s.payMethod);
      const newFaturas = s.faturas.map((f) => updated.find((u) => u.id === f.id) || f);
      const stillOpen = newFaturas.some((f) => f.status !== 'pago');
      const newStatus = stillOpen ? 'pendente' : 'pago';
      // o status persistido é recalculado automaticamente por um trigger no banco
      // (sync_associado_status) a partir das faturas — aqui só refletimos na UI local
      setState((p) => ({
        faturas: newFaturas,
        selectedInvoiceIds: {},
        assocPage: 'inicio',
        ownAssociado: p.ownAssociado ? { ...p.ownAssociado, status: newStatus } : p.ownAssociado,
      }));
      showToast(`Pagamento confirmado — ${ids.length} fatura${ids.length === 1 ? '' : 's'} quitada${ids.length === 1 ? '' : 's'}`);
    } catch (err) {
      showToast('Erro: ' + translateError(err.message));
    }
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
  const now = new Date();
  const setRelatorioPeriod = (e) => setState({ relatorioPeriod: e.target.value });
  const setRelatorioAssociado = (e) => setState({ relatorioAssociadoId: e.target.value ? Number(e.target.value) : null });
  const exportPdf = async () => {
    try {
      showToast('Gerando PDF...');
      await exportReportPdf({ periodLabel: isAllPeriods ? 'Todos os períodos' : selectedPeriod, stats: reportStats, expenses: expensesInPeriod, associados });
      showToast('Relatório em PDF baixado');
    } catch (err) {
      showToast('Erro ao gerar PDF: ' + translateError(err.message));
    }
  };
  const exportCsv = () => {
    try {
      exportReportCsv({ periodLabel: isAllPeriods ? 'Todos os períodos' : selectedPeriod, stats: reportStats, expenses: expensesInPeriod, associados });
      showToast('Relatório em CSV baixado');
    } catch (err) {
      showToast('Erro ao gerar CSV: ' + translateError(err.message));
    }
  };

  // --- perfil (associado edita o próprio; admin edita o de qualquer associado) ---
  const openEditProfile = () => {
    const p = s.ownAssociado;
    if (!p) return;
    setState({ showEditProfile: true, editingAssociadoId: p.id, editProfileDraft: { name: p.name, email: p.email, phone: p.phone, address: p.address, unit: p.unit } });
  };
  const openAdminEditAssociado = (id) => {
    const p = s.associados.find((x) => x.id === id);
    if (!p) return;
    setState({ showViewProfile: false, showEditProfile: true, editingAssociadoId: id, editProfileDraft: { name: p.name, email: p.email, phone: p.phone, address: p.address, unit: p.unit } });
  };
  const closeEditProfile = () => setState({ showEditProfile: false, editingAssociadoId: null });
  const resetAssociadoPassword = (name, email) => {
    if (!email || email === '—') { showToast('Esse associado não tem e-mail cadastrado.'); return; }
    askConfirm({
      title: 'Redefinir senha?',
      message: `Vamos enviar um e-mail para ${email} com um link para ${name} criar uma nova senha.`,
      confirmLabel: 'Enviar e-mail',
      onConfirm: async () => {
        try {
          await sendPasswordReset(email);
          showToast(`E-mail de redefinição enviado para ${name}`);
        } catch (err) {
          showToast('Erro ao enviar redefinição: ' + translateError(err.message));
        }
      },
    });
  };
  const setEditProfileName = (e) => setState((p) => ({ editProfileDraft: { ...p.editProfileDraft, name: e.target.value } }));
  const setEditProfileEmail = (e) => setState((p) => ({ editProfileDraft: { ...p.editProfileDraft, email: e.target.value } }));
  const setEditProfilePhone = (e) => setState((p) => ({ editProfileDraft: { ...p.editProfileDraft, phone: e.target.value } }));
  const setEditProfileAddress = (e) => setState((p) => ({ editProfileDraft: { ...p.editProfileDraft, address: e.target.value } }));
  const setEditProfileUnit = (e) => setState((p) => ({ editProfileDraft: { ...p.editProfileDraft, unit: e.target.value } }));
  const saveEditProfile = async () => {
    if (!s.editingAssociadoId) return;
    const isAdminEditing = s.profile.role === 'admin';
    const before = s.associados.find((x) => x.id === s.editingAssociadoId) || s.ownAssociado;
    const emailChanged = before && before.email !== s.editProfileDraft.email;
    try {
      const updated = await updateAssociado(s.editingAssociadoId, s.editProfileDraft);
      setState((p) => ({
        showEditProfile: false,
        editingAssociadoId: null,
        ownAssociado: p.ownAssociado && p.ownAssociado.id === updated.id ? updated : p.ownAssociado,
        associados: p.associados.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)),
      }));
      if (emailChanged && !isAdminEditing) {
        try {
          await updateAuthEmail(s.editProfileDraft.email);
          showToast('Perfil atualizado. Enviamos um e-mail de confirmação — seu login só passa a usar o novo e-mail depois que você confirmar.');
        } catch (err) {
          showToast('Perfil atualizado, mas não foi possível atualizar o e-mail de login: ' + translateError(err.message));
        }
      } else if (emailChanged && isAdminEditing) {
        showToast('Perfil atualizado. Atenção: o e-mail de login desse associado não muda automaticamente — peça para ele trocar em "Meu perfil".');
      } else {
        showToast('Perfil atualizado');
      }
    } catch (err) {
      showToast('Erro: ' + translateError(err.message));
    }
  };

  // ============================================================
  // valores derivados (equivalente ao renderVals() do protótipo)
  // ============================================================
  const associados = s.associados.map((a) => {
    const meta = STATUS_META[a.status];
    const isPago = a.status === 'pago';
    const isAtrasado = a.status === 'atrasado';
    const isSending = !!s.sendingChargeIds[a.id];
    const multa = multaFor(a.value, a.status);
    return {
      ...a,
      initials: initials(a.name),
      valueFmt: brl(a.value),
      statusLabel: isAtrasado ? `${meta.label} · multa ${brl(multa)}` : meta.label,
      statusBg: meta.bg,
      statusColor: meta.color,
      onOpenProfile: () => openViewProfile(a.id),
      // onChange só atualiza a tela; a gravação no banco só acontece no blur
      // (sair do campo). Gravar a cada tecla causava valor 0 sempre que o
      // campo passava por um instante vazio (ex: selecionar tudo e digitar
      // de novo) — e como as chamadas não são ordenadas, um "0" digitado no
      // meio da edição podia chegar ao banco DEPOIS do valor final digitado.
      onValueChange: (e) => {
        const raw = e.target.value;
        setState((p) => ({ associados: p.associados.map((x) => (x.id === a.id ? { ...x, value: raw } : x)) }));
      },
      onValueBlur: (e) => {
        const v = parseFloat(e.target.value) || 0;
        setState((p) => ({ associados: p.associados.map((x) => (x.id === a.id ? { ...x, value: v } : x)) }));
        updateAssociado(a.id, { value: v }).catch((err) => showToast('Erro ao salvar: ' + translateError(err.message)));
      },
      dueDateColor: isAtrasado ? 'oklch(50% 0.18 25)' : 'oklch(20% 0.02 230)',
      dueDateBorder: isAtrasado ? 'oklch(75% 0.1 25)' : 'oklch(89% 0.01 230)',
      onConsumptionChange: (e) => {
        const raw = e.target.value;
        setState((p) => ({ associados: p.associados.map((x) => (x.id === a.id ? { ...x, consumption: raw } : x)) }));
      },
      onConsumptionBlur: (e) => {
        const v = Number(e.target.value) || 0;
        // calcula o valor mensal automaticamente a partir do consumo: taxa
        // mínima + (consumo × valor por m³), mais os custos extras
        // configurados em "Configurar valores"
        const computedValue = calcBillingValue(v, s.billingSettings);
        setState((p) => ({ associados: p.associados.map((x) => (x.id === a.id ? { ...x, consumption: v, value: computedValue } : x)) }));
        updateAssociado(a.id, { consumption: v, value: computedValue }).catch((err) => showToast('Erro ao salvar: ' + translateError(err.message)));
      },
      onDelete: () => {
        askConfirm({
          title: `Remover ${a.name}?`,
          message: 'Isso apaga também o histórico de faturas dele(a). Essa ação não pode ser desfeita.',
          confirmLabel: 'Remover',
          danger: true,
          onConfirm: () => {
            setState((p) => ({ associados: p.associados.filter((x) => x.id !== a.id) }));
            deleteAssociado(a.id).catch((err) => showToast('Erro ao remover: ' + translateError(err.message)));
          },
        });
      },
      onDueDateChange: (e) => {
        const v = e.target.value.replace(/\D/g, '').slice(0, 2);
        setState((p) => ({ associados: p.associados.map((x) => (x.id === a.id ? { ...x, dueDate: v } : x)) }));
      },
      onDueDateBlur: (e) => {
        const day = Math.min(31, Math.max(1, parseInt(e.target.value, 10) || 10));
        const v = String(day);
        setState((p) => ({ associados: p.associados.map((x) => (x.id === a.id ? { ...x, dueDate: v } : x)) }));
        // só vale a partir da próxima cobrança gerada — não altera a fatura pendente já gerada
        updateAssociado(a.id, { dueDate: v })
          .then(() => showToast(`Dia de vencimento (${v}) salvo — vale a partir da próxima cobrança gerada`))
          .catch((err) => showToast('Erro ao salvar: ' + translateError(err.message)));
      },
      showCobrar: !isPago && !sameMonth(a.lastChargeSentAt),
      showEnviado: !isPago && sameMonth(a.lastChargeSentAt),
      showCobrado: isPago,
      cobrarSending: isSending,
      cobrarLabel: isSending ? 'Enviando...' : isAtrasado ? 'Cobrar novamente' : 'Cobrar',
      cobrarBg: isAtrasado ? 'oklch(93% 0.05 25)' : '#fff',
      cobrarColor: isAtrasado ? 'oklch(45% 0.15 25)' : 'oklch(32% 0.08 220)',
      cobrarBorder: isAtrasado ? 'oklch(85% 0.06 25)' : 'oklch(32% 0.08 220)',
      onCobrar: () => enviarCobranca(a.id, a.name),
    };
  });

  const expenses = s.despesas.map((e) => ({
    ...e,
    valueFmt: brl(e.value),
    onDelete: () => {
      askConfirm({
        title: 'Remover despesa?',
        message: `"${e.description}" será removida. Essa ação não pode ser desfeita.`,
        confirmLabel: 'Remover',
        danger: true,
        onConfirm: () => {
          setState((p) => ({ despesas: p.despesas.filter((x) => x.id !== e.id) }));
          deleteDespesa(e.id).catch((err) => showToast('Erro ao remover: ' + translateError(err.message)));
        },
      });
    },
    onEdit: () => openEditExpense(e),
  }));
  const admins = s.admins.map((a) => ({
    ...a,
    initials: initials(a.name),
    onDelete: () => {
      askConfirm({
        title: 'Remover administrador?',
        message: `${a.name} perde o acesso administrativo ao sistema.`,
        confirmLabel: 'Remover',
        danger: true,
        onConfirm: () => {
          setState((p) => ({ admins: p.admins.filter((x) => x.id !== a.id) }));
          deleteAdmin(a.id).catch((err) => showToast('Erro ao remover: ' + translateError(err.message)));
        },
      });
    },
  }));

  const despesaSearchQ = s.despesaSearch.trim().toLowerCase();
  const expensesFiltered = despesaSearchQ
    ? expenses.filter((e) => e.description.toLowerCase().includes(despesaSearchQ) || e.category.toLowerCase().includes(despesaSearchQ))
    : expenses;
  const despesaPageSize = s.despesaPageSize;
  const despesaTotalPages = Math.max(1, Math.ceil(expensesFiltered.length / despesaPageSize));
  const despesaCurrentPage = Math.min(s.despesaPage, despesaTotalPages - 1);
  const expensesPage = expensesFiltered.slice(despesaCurrentPage * despesaPageSize, despesaCurrentPage * despesaPageSize + despesaPageSize);
  const despesaPageLabel = `Página ${despesaCurrentPage + 1} de ${despesaTotalPages} · ${expensesFiltered.length} despesa(s)`;

  const adminSearchQ = s.adminSearch.trim().toLowerCase();
  const adminsFiltered = adminSearchQ
    ? admins.filter((a) => a.name.toLowerCase().includes(adminSearchQ) || a.email.toLowerCase().includes(adminSearchQ))
    : admins;
  const adminListPageSize = s.adminListPageSize;
  const adminTotalPages = Math.max(1, Math.ceil(adminsFiltered.length / adminListPageSize));
  const adminCurrentPage = Math.min(s.adminListPage, adminTotalPages - 1);
  const adminsPage = adminsFiltered.slice(adminCurrentPage * adminListPageSize, adminCurrentPage * adminListPageSize + adminListPageSize);
  const adminPageLabel = `Página ${adminCurrentPage + 1} de ${adminTotalPages} · ${adminsFiltered.length} administrador(es)`;

  // --- relatórios: período selecionável (mês/ano) + extrato por associado ---
  const periodToSortKey = (label) => {
    const [monthName, year] = label.split('/');
    const idx = MONTH_NAMES_PT.indexOf(monthName);
    return Number(year) * 12 + (idx === -1 ? 0 : idx);
  };
  const currentMonthLabel = `${MONTH_NAMES_PT[now.getMonth()]}/${now.getFullYear()}`;
  const despesaPeriodOf = (e) => {
    if (!e.dateIso) return currentMonthLabel;
    const [y, m] = e.dateIso.split('-');
    return `${MONTH_NAMES_PT[Number(m) - 1]}/${y}`;
  };
  const periodSet = new Set([currentMonthLabel]);
  s.allFaturas.forEach((f) => periodSet.add(f.month));
  expenses.forEach((e) => periodSet.add(despesaPeriodOf(e)));
  const periodOptions = [
    { value: '__all__', label: 'Todos os períodos' },
    ...[...periodSet].sort((a, b) => periodToSortKey(b) - periodToSortKey(a)).map((p) => ({ value: p, label: p })),
  ];
  const selectedPeriod = s.relatorioPeriod || currentMonthLabel;
  const isAllPeriods = selectedPeriod === '__all__';
  const faturasInPeriod = isAllPeriods ? s.allFaturas : s.allFaturas.filter((f) => f.month === selectedPeriod);
  const arrecadadoPeriod = faturasInPeriod.filter((f) => f.status === 'pago').reduce((sum, f) => sum + f.value, 0);
  const expensesInPeriod = isAllPeriods ? expenses : expenses.filter((e) => despesaPeriodOf(e) === selectedPeriod);
  const gastoPeriod = expensesInPeriod.reduce((sum, e) => sum + e.value, 0);
  const saldoPeriod = arrecadadoPeriod - gastoPeriod;
  const reportStats = {
    arrecadadoFmt: brl(arrecadadoPeriod),
    gastoFmt: brl(gastoPeriod),
    saldoFmt: brl(saldoPeriod),
    saldoColor: saldoPeriod >= 0 ? 'oklch(38% 0.13 150)' : 'oklch(45% 0.15 25)',
  };
  const despesasPorCategoria = Object.values(
    expensesInPeriod.reduce((acc, e) => {
      if (!acc[e.category]) acc[e.category] = { category: e.category, total: 0 };
      acc[e.category].total += e.value;
      return acc;
    }, {}),
  )
    .sort((a, b) => b.total - a.total)
    .map((c) => ({ ...c, totalFmt: brl(c.total) }));

  const associadosOptions = s.associados.map((a) => ({ id: a.id, name: a.name }));
  const extratoAssociado = s.relatorioAssociadoId
    ? s.allFaturas
        .filter((f) => f.associadoId === s.relatorioAssociadoId)
        .sort((a, b) => periodToSortKey(b.month) - periodToSortKey(a.month))
        .map((f) => ({
          id: f.id,
          month: f.month,
          valueFmt: brl(f.value),
          statusLabel: STATUS_META[f.status] ? STATUS_META[f.status].label : f.status,
          dueDate: f.dueDate,
          paidAtFmt: f.paidAt ? new Date(f.paidAt).toLocaleDateString('pt-BR') : '—',
        }))
    : [];

  const arrecadado = associados.filter((a) => a.status === 'pago').reduce((sum, a) => sum + a.value, 0);
  const gasto = expenses.reduce((sum, e) => sum + e.value, 0);
  const saldo = arrecadado - gasto;
  const inadimplentes = associados.filter((a) => a.status !== 'pago').length;
  const inadimplenciaPct = associados.length ? Math.round((inadimplentes / associados.length) * 100) : 0;
  const pagoCount = associados.filter((a) => a.status === 'pago').length;
  const pagoPct = associados.length ? Math.round((pagoCount / associados.length) * 100) : 0;

  const stats = {
    arrecadadoFmt: brl(arrecadado),
    gastoFmt: brl(gasto),
    saldoFmt: brl(saldo),
    saldoColor: saldo >= 0 ? 'oklch(38% 0.13 150)' : 'oklch(45% 0.15 25)',
    inadimplenciaPct,
    pagoPct,
  };

  // arrecadação por mês a partir das faturas pagas de verdade (agrupadas
  // pelo mês de vencimento), em vez de números fixos de exemplo
  const revenueByMonth = new Map();
  s.allFaturas.filter((f) => f.status === 'pago').forEach((f) => {
    const [, mm, yyyy] = f.dueDate.split('/');
    const key = `${yyyy}-${mm}`;
    const entry = revenueByMonth.get(key) || { key, label: MONTH_ABBR_PT[parseInt(mm, 10) - 1], sum: 0 };
    entry.sum += f.value;
    revenueByMonth.set(key, entry);
  });
  const revenueMonths = Array.from(revenueByMonth.values()).sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)).slice(-12);
  const maxRev = Math.max(...revenueMonths.map((m) => m.sum), 1);
  const revenueBars = revenueMonths.map((m, i) => ({
    month: m.label,
    valueFmt: brl(m.sum).replace('R$', '').trim(),
    heightPct: Math.round((m.sum / maxRev) * 100),
    color: i === revenueMonths.length - 1 ? 'oklch(45% 0.13 210)' : 'oklch(85% 0.03 220)',
  }));

  const pendenteCount = associados.filter((a) => a.status === 'pendente').length;
  const atrasadoCount = associados.filter((a) => a.status === 'atrasado').length;
  const total = associados.length || 1;
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

  const cobrancaFiltered = s.cobrancaStatusFilter === 'todos' ? associadosFiltered : associadosFiltered.filter((a) => a.status === s.cobrancaStatusFilter);
  const cobrancaTotalPages = Math.max(1, Math.ceil(cobrancaFiltered.length / pageSize));
  const cobrancaCurrentPage = Math.min(s.associadoPage, cobrancaTotalPages - 1);
  const cobrancaPage = cobrancaFiltered.slice(cobrancaCurrentPage * pageSize, cobrancaCurrentPage * pageSize + pageSize);
  const cobrancaPageLabel = `Página ${cobrancaCurrentPage + 1} de ${cobrancaTotalPages} · ${cobrancaFiltered.length} associado(s)`;

  const isMobile = s.isMobile;
  const modalWidth = isMobile ? '92vw' : '400px';

  const viewProfileData = s.viewProfileId ? associados.find((a) => a.id === s.viewProfileId) : null;
  const assocProfile = s.ownAssociado;

  const invoicesOpen = s.faturas.filter((i) => i.status !== 'pago');
  const hasOverdue = invoicesOpen.some((i) => i.status === 'atrasado');
  const totalAberto = invoicesOpen.reduce((sum, i) => sum + i.value + multaFor(i.value, i.status), 0);
  const currentInvoice = {
    valueFmt: brl(totalAberto),
    dueDate: invoicesOpen[0] ? invoicesOpen[0].dueDate : '—',
    dueDateColor: hasOverdue ? 'oklch(75% 0.13 25)' : 'oklch(85% 0.03 220)',
    consumption: assocProfile ? assocProfile.consumption : 0,
    statusLabel: hasOverdue ? 'Em atraso' : invoicesOpen.length ? 'Pendente' : 'Em dia',
    statusBg: hasOverdue ? 'oklch(55% 0.18 25)' : 'rgba(255,255,255,0.18)',
    statusColor: '#fff',
    cardBg: hasOverdue ? 'linear-gradient(160deg, oklch(48% 0.15 25), oklch(38% 0.14 20))' : 'linear-gradient(160deg, oklch(32% 0.08 220), oklch(24% 0.07 235))',
    count: invoicesOpen.length,
  };
  const invoicesList = s.faturas.map((inv) => {
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

  const dueDateSortKey = (dueDate) => {
    const [d, m, y] = dueDate.split('/');
    return `${y}-${m}-${d}`;
  };
  const paymentHistory = [...s.faturas]
    .sort((a, b) => (dueDateSortKey(a.dueDate) < dueDateSortKey(b.dueDate) ? 1 : -1))
    .map((f) => {
      const meta = STATUS_META[f.status] || STATUS_META.pendente;
      return {
        ref: f.month,
        valueFmt: brl(f.value),
        method: f.paymentMethod === 'boleto' ? 'Boleto' : f.paymentMethod === 'pix' ? 'Pix' : '—',
        dueDate: f.dueDate,
        paidAtFmt: f.paidAt ? new Date(f.paidAt).toLocaleDateString('pt-BR') : '—',
        statusLabel: meta.label,
        statusBg: meta.bg,
        statusColor: meta.color,
      };
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

  const currentUserInitials = initials(s.profile?.name || '?');
  const currentUserName = s.profile?.name || '';
  const currentUserFirstName = (assocProfile?.name || s.profile?.name || '').split(' ')[0];
  const currentUserRoleLabel = s.profile?.role === 'admin' ? 'Administrador' : 'Associado';
  const sidebarProfileClick = s.ownAssociado ? openEditProfile : () => {};
  const hasOwnAssociado = !!s.ownAssociado;
  const inAdminArea = s.profile?.role === 'admin' && s.viewMode === 'admin';
  const inAssocArea = s.profile?.role === 'associado' || (s.profile?.role === 'admin' && s.viewMode === 'associado');

  const expenseModalTitle = s.editingExpenseId ? 'Editar despesa' : 'Lançar despesa';
  const expenseConfirmLabel = s.editingExpenseId ? 'Salvar' : 'Lançar';

  // ============================================================
  // renderização
  // ============================================================

  if (s.session === undefined) {
    return <div style={{ minHeight: '100vh', background: 'oklch(97.5% 0.006 230)' }} />;
  }

  if (!s.session) {
    if (s.authView === 'cadastro') {
      return <Cadastro isMobile={isMobile} doSignUp={doSignUp} goLogin={goLoginView} />;
    }
    return <Login isMobile={isMobile} doSignIn={doSignIn} goCadastro={goCadastro} />;
  }

  if (!s.profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'oklch(97.5% 0.006 230)', color: 'oklch(40% 0.02 230)', fontSize: 14 }}>
        Carregando...
      </div>
    );
  }

  return (
    <div style={appShellStyle}>
      <Sidebar
        isMobile={isMobile}
        role={s.profile.role}
        viewMode={s.viewMode}
        showMinhaConta={s.profile.role === 'admin' && hasOwnAssociado}
        adminPage={s.adminPage}
        assocPage={s.assocPage}
        goAdminDashboard={goAdminDashboard}
        goAdminAssociados={goAdminAssociados}
        goAdminCobranca={goAdminCobranca}
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
        {s.dataLoading && <Skeleton rows={6} />}

        {!s.dataLoading && inAdminArea && s.adminPage === 'dashboard' && (
          <Dashboard isMobile={isMobile} stats={stats} revenueBars={revenueBars} donutSegments={donutSegments} overdueList={overdueList} goAdminCobranca={goAdminCobranca} />
        )}
        {!s.dataLoading && inAdminArea && s.adminPage === 'associados' && (
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
            openAddAssociado={openAddAssociado}
          />
        )}
        {!s.dataLoading && inAdminArea && s.adminPage === 'cobranca' && (
          <Cobranca
            isMobile={isMobile}
            associadosFull={cobrancaPage}
            associadoSearch={s.associadoSearch}
            setAssociadoSearch={setAssociadoSearch}
            statusFilter={s.cobrancaStatusFilter}
            setStatusFilter={setCobrancaStatusFilter}
            pageLabel={cobrancaPageLabel}
            prevDisabled={cobrancaCurrentPage <= 0}
            nextDisabled={cobrancaCurrentPage >= cobrancaTotalPages - 1}
            goAssociadoPrevPage={goAssociadoPrevPage}
            goAssociadoNextPage={goAssociadoNextPage}
            generateMonthlyCharges={generateMonthlyCharges}
            openBulkDueDate={openBulkDueDate}
            cobrarTodos={cobrarTodos}
            cobrarTodosSending={s.bulkCobrancaSending}
            openBillingSettings={openBillingSettings}
          />
        )}
        {!s.dataLoading && inAdminArea && s.adminPage === 'despesas' && (
          <Despesas
            expenses={expensesPage}
            despesaSearch={s.despesaSearch}
            setDespesaSearch={setDespesaSearch}
            pageLabel={despesaPageLabel}
            prevDisabled={despesaCurrentPage <= 0}
            nextDisabled={despesaCurrentPage >= despesaTotalPages - 1}
            goDespesaPrevPage={goDespesaPrevPage}
            goDespesaNextPage={goDespesaNextPage}
            openAddExpense={openAddExpense}
          />
        )}
        {!s.dataLoading && inAdminArea && s.adminPage === 'administradores' && (
          <Administradores
            isMobile={isMobile}
            admins={adminsPage}
            adminSearch={s.adminSearch}
            setAdminSearch={setAdminSearch}
            pageLabel={adminPageLabel}
            prevDisabled={adminCurrentPage <= 0}
            nextDisabled={adminCurrentPage >= adminTotalPages - 1}
            goAdminListPrevPage={goAdminListPrevPage}
            goAdminListNextPage={goAdminListNextPage}
            openAddAdmin={openAddAdmin}
          />
        )}
        {!s.dataLoading && inAdminArea && s.adminPage === 'relatorios' && (
          <Relatorios
            periodOptions={periodOptions}
            selectedPeriod={selectedPeriod}
            setRelatorioPeriod={setRelatorioPeriod}
            stats={reportStats}
            despesasPorCategoria={despesasPorCategoria}
            associadosOptions={associadosOptions}
            selectedAssociadoId={s.relatorioAssociadoId}
            setRelatorioAssociado={setRelatorioAssociado}
            extratoAssociado={extratoAssociado}
            exportPdf={exportPdf}
            exportCsv={exportCsv}
          />
        )}

        {!s.dataLoading && inAssocArea && !assocProfile && (
          <p style={{ fontSize: 13.5, color: 'oklch(52% 0.01 230)' }}>
            Sua conta ainda não está vinculada a nenhuma unidade. Peça para um administrador te cadastrar como associado com este mesmo e-mail.
          </p>
        )}
        {!s.dataLoading && inAssocArea && assocProfile && s.assocPage === 'inicio' && (
          <Inicio isMobile={isMobile} currentUserFirstName={currentUserFirstName} currentInvoice={currentInvoice} assocProfile={assocProfile} invoicesList={invoicesList} goPagarTodas={goPagarTodas} />
        )}
        {!s.dataLoading && inAssocArea && assocProfile && s.assocPage === 'pagar' && (
          <Pagar
            selectedInvoices={selectedInvoices}
            selectedTotalFmt={selectedTotalFmt}
            hasSelectedInvoices={selectedInvoices.some((i) => i.checked)}
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
        {!s.dataLoading && inAssocArea && assocProfile && s.assocPage === 'historico' && <Historico paymentHistory={paymentHistory} />}
      </main>

      <Toast message={s.toast} />

      {s.showViewProfile && (
        <ViewProfileModal
          width={modalWidth}
          data={viewProfileData}
          close={closeViewProfile}
          edit={viewProfileData ? () => openAdminEditAssociado(viewProfileData.id) : null}
          resetPassword={viewProfileData ? () => resetAssociadoPassword(viewProfileData.name, viewProfileData.email) : null}
        />
      )}

      {s.showEditProfile && (
        <EditProfileModal
          width={modalWidth}
          draft={s.editProfileDraft}
          isAdmin={s.profile.role === 'admin'}
          setName={setEditProfileName}
          setEmail={setEditProfileEmail}
          setPhone={setEditProfilePhone}
          setAddress={setEditProfileAddress}
          setUnit={setEditProfileUnit}
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

      {s.showBillingSettings && (
        <BillingSettingsModal
          width={modalWidth}
          draft={s.billingSettingsDraft}
          setMinValue={setBillingMinValue}
          setPricePerM3={setBillingPricePerM3}
          setExtraChargeLabel={setExtraChargeLabel}
          setExtraChargeValue={setExtraChargeValue}
          addExtraCharge={addExtraCharge}
          removeExtraCharge={removeExtraCharge}
          close={closeBillingSettings}
          confirm={confirmBillingSettings}
        />
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
          close={closeAddExpense}
          confirm={confirmAddExpense}
        />
      )}

      {s.showAddAdmin && (
        <AddAdminModal width={modalWidth} newAdmin={s.newAdmin} setName={setNewAdminName} setEmail={setNewAdminEmail} setCargo={setNewAdminCargo} close={closeAddAdmin} confirm={confirmAddAdmin} />
      )}

      {s.confirmDialog && (
        <ConfirmModal
          width={modalWidth}
          title={s.confirmDialog.title}
          message={s.confirmDialog.message}
          confirmLabel={s.confirmDialog.confirmLabel}
          danger={s.confirmDialog.danger}
          close={closeConfirm}
          confirm={runConfirm}
        />
      )}
    </div>
  );
}
