import { supabase } from './supabaseClient';
import { isoToShort, isoToLong, todayIso } from '../utils/date';

// ---- mapeamento DB (snake_case) <-> UI (camelCase, datas BR) ----

function mapAssociado(row) {
  return {
    id: row.id,
    profileId: row.profile_id,
    name: row.name,
    unit: row.unit,
    email: row.email,
    phone: row.phone,
    address: row.address,
    value: Number(row.monthly_value),
    consumption: Number(row.consumption),
    dueDate: row.due_date,
    status: row.status,
    lastChargeSentAt: row.last_charge_sent_at,
  };
}

function mapDespesa(row) {
  return {
    id: row.id,
    date: isoToShort(row.date),
    description: row.description,
    category: row.category,
    value: Number(row.value),
    receipt: row.receipt_path || 'sem-comprovante',
    receiptPath: row.receipt_path,
  };
}

function mapAdmin(row) {
  return { id: row.id, name: row.name, email: row.email, cargo: row.cargo };
}

function mapFatura(row) {
  return {
    id: row.id,
    associadoId: row.associado_id,
    month: row.month,
    value: Number(row.value),
    dueDate: isoToLong(row.due_date),
    status: row.status,
    paymentMethod: row.payment_method,
    paidAt: row.paid_at,
  };
}

// ---- associados ----

export async function fetchAssociados() {
  const { data, error } = await supabase.from('associados').select('*').order('name');
  if (error) throw error;
  return data.map(mapAssociado);
}

export async function fetchOwnAssociado(profileId) {
  // .limit(1) em vez de .maybeSingle(): tolera dados legados com mais de
  // um associado vinculado ao mesmo perfil, em vez de estourar erro
  const { data, error } = await supabase.from('associados').select('*').eq('profile_id', profileId).order('id').limit(1);
  if (error) throw error;
  return data && data.length ? mapAssociado(data[0]) : null;
}

export async function insertAssociado({ name, unit, email, value }) {
  const { data, error } = await supabase
    .from('associados')
    .insert({ name, unit: unit || '—', email: email || '—', monthly_value: value || 0, due_date: '10/07', status: 'pendente' })
    .select()
    .single();
  if (error) throw error;
  return mapAssociado(data);
}

export async function updateAssociado(id, patch) {
  const dbPatch = {};
  if ('value' in patch) dbPatch.monthly_value = patch.value;
  if ('consumption' in patch) dbPatch.consumption = patch.consumption;
  if ('dueDate' in patch) dbPatch.due_date = patch.dueDate;
  if ('status' in patch) dbPatch.status = patch.status;
  if ('name' in patch) dbPatch.name = patch.name;
  if ('email' in patch) dbPatch.email = patch.email;
  if ('phone' in patch) dbPatch.phone = patch.phone;
  if ('address' in patch) dbPatch.address = patch.address;
  if ('lastChargeSentAt' in patch) dbPatch.last_charge_sent_at = patch.lastChargeSentAt;
  const { data, error } = await supabase.from('associados').update(dbPatch).eq('id', id).select().single();
  if (error) throw error;
  return mapAssociado(data);
}

export async function deleteAssociado(id) {
  const { error } = await supabase.from('associados').delete().eq('id', id);
  if (error) throw error;
}

// ---- despesas ----

export async function fetchDespesas() {
  const { data, error } = await supabase.from('despesas').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data.map(mapDespesa);
}

export async function insertDespesa({ description, category, value, receiptPath }) {
  const { data, error } = await supabase
    .from('despesas')
    .insert({ date: todayIso(), description, category, value, receipt_path: receiptPath || null })
    .select()
    .single();
  if (error) throw error;
  return mapDespesa(data);
}

export async function updateDespesa(id, { description, category, value, receiptPath }) {
  const dbPatch = { description, category, value };
  if (receiptPath !== undefined) dbPatch.receipt_path = receiptPath;
  const { data, error } = await supabase.from('despesas').update(dbPatch).eq('id', id).select().single();
  if (error) throw error;
  return mapDespesa(data);
}

export async function deleteDespesa(id) {
  const { error } = await supabase.from('despesas').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadReceipt(file) {
  const path = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('comprovantes').upload(path, file);
  if (error) throw error;
  return path;
}

// ---- admins ----

export async function fetchAdmins() {
  const { data, error } = await supabase.from('admins').select('*').order('name');
  if (error) throw error;
  return data.map(mapAdmin);
}

export async function insertAdmin({ name, email, cargo }) {
  const { data, error } = await supabase.from('admins').insert({ name, email: email || '—', cargo }).select().single();
  if (error) throw error;
  return mapAdmin(data);
}

export async function deleteAdmin(id) {
  const { error } = await supabase.from('admins').delete().eq('id', id);
  if (error) throw error;
}

// ---- faturas ----

export async function fetchFaturas() {
  const { data, error } = await supabase.from('faturas').select('*').order('due_date');
  if (error) throw error;
  return data.map(mapFatura);
}

export async function fetchFaturasByAssociado(associadoId) {
  const { data, error } = await supabase.from('faturas').select('*').eq('associado_id', associadoId).order('due_date');
  if (error) throw error;
  return data.map(mapFatura);
}

export async function insertFatura({ associadoId, month, value, dueDateIso, status }) {
  const { data, error } = await supabase
    .from('faturas')
    .insert({ associado_id: associadoId, month, value, due_date: dueDateIso, status })
    .select()
    .single();
  if (error) throw error;
  return mapFatura(data);
}

export async function markFaturasPaid(ids, paymentMethod) {
  const { data, error } = await supabase
    .from('faturas')
    .update({ status: 'pago', payment_method: paymentMethod, paid_at: new Date().toISOString() })
    .in('id', ids)
    .select();
  if (error) throw error;
  return data.map(mapFatura);
}
