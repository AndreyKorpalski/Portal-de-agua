-- Portal Amolina — schema do banco de dados (Supabase / Postgres)
--
-- Como aplicar: Supabase Dashboard → SQL Editor → cole este arquivo inteiro → Run.
-- (ou via CLI: supabase db push)

-- ============================================================
-- profiles: um registro por usuário autenticado (auth.users)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'associado')),
  name text not null,
  email text not null,
  phone text not null default '',
  address text not null default '',
  created_at timestamptz not null default now()
);

-- ============================================================
-- admins: dados extras de administradores (cargo)
-- ============================================================
create table if not exists admins (
  id bigint generated always as identity primary key,
  profile_id uuid references profiles(id) on delete set null,
  name text not null,
  email text not null default '',
  cargo text not null default 'Administrador Geral',
  created_at timestamptz not null default now()
);

-- ============================================================
-- associados: unidades/membros da associação
-- profile_id fica nulo até a pessoa criar login e ser vinculada
-- ============================================================
create table if not exists associados (
  id bigint generated always as identity primary key,
  profile_id uuid references profiles(id) on delete set null,
  name text not null,
  unit text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  monthly_value numeric(10,2) not null default 0,
  consumption numeric(10,2) not null default 0,
  due_date text not null default '10/07',
  status text not null default 'pendente' check (status in ('pago', 'pendente', 'atrasado')),
  last_charge_sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- despesas: gastos lançados pela associação
-- ============================================================
create table if not exists despesas (
  id bigint generated always as identity primary key,
  date date not null default current_date,
  description text not null,
  category text not null default 'Outros',
  value numeric(10,2) not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- faturas: cobranças mensais de cada associado
-- ============================================================
create table if not exists faturas (
  id bigint generated always as identity primary key,
  associado_id bigint not null references associados(id) on delete cascade,
  month text not null,
  value numeric(10,2) not null,
  due_date date not null,
  status text not null default 'pendente' check (status in ('pago', 'pendente', 'atrasado')),
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists faturas_associado_id_idx on faturas (associado_id);

-- impede gerar a mesma cobrança do mês duas vezes para o mesmo associado
create unique index if not exists faturas_associado_month_unique on faturas (associado_id, month);

-- ============================================================
-- billing_settings: valores usados para calcular a cobrança
-- automaticamente a partir do consumo (linha única, id = 1).
-- extra_charges é uma lista de custos fixos somados a toda
-- cobrança, ex: [{"label": "Taxa de manutenção", "value": 5}]
-- ============================================================
create table if not exists billing_settings (
  id int primary key default 1,
  min_value numeric(10,2) not null default 12,
  price_per_m3 numeric(10,2) not null default 3,
  extra_charges jsonb not null default '[]'::jsonb,
  constraint billing_settings_singleton check (id = 1)
);

insert into billing_settings (id) values (1)
  on conflict (id) do nothing;

-- impede cadastrar dois associados com o mesmo e-mail (permite múltiplos
-- registros sem e-mail definido, representado pelo placeholder '—')
create unique index if not exists associados_email_unique on associados (email) where email <> '—' and email <> '';

-- ============================================================
-- Função auxiliar: o usuário logado é admin?
-- (security definer evita recursão de RLS ao consultar profiles)
-- ============================================================
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table admins enable row level security;
alter table associados enable row level security;
alter table despesas enable row level security;
alter table faturas enable row level security;
alter table billing_settings enable row level security;

-- profiles: cada usuário vê/edita o próprio perfil; admin vê todos
create policy "profiles_select_own_or_admin" on profiles
  for select using (id = auth.uid() or is_admin());
create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());
create policy "profiles_insert_own" on profiles
  for insert with check (id = auth.uid());

-- admins: somente admin
create policy "admins_all_admin" on admins
  for all using (is_admin()) with check (is_admin());

-- associados: admin vê/edita tudo; associado vê/edita só o próprio registro
create policy "associados_select" on associados
  for select using (is_admin() or profile_id = auth.uid());
create policy "associados_insert_admin" on associados
  for insert with check (is_admin());
create policy "associados_update" on associados
  for update using (is_admin() or profile_id = auth.uid());
create policy "associados_delete_admin" on associados
  for delete using (is_admin());

-- despesas: somente admin (associado não enxerga despesas da associação)
create policy "despesas_all_admin" on despesas
  for all using (is_admin()) with check (is_admin());

-- faturas: admin vê/edita tudo; associado vê/edita só as próprias faturas
create policy "faturas_select" on faturas
  for select using (
    is_admin() or associado_id in (select id from associados where profile_id = auth.uid())
  );
create policy "faturas_insert_admin" on faturas
  for insert with check (is_admin());
create policy "faturas_update" on faturas
  for update using (
    is_admin() or associado_id in (select id from associados where profile_id = auth.uid())
  );
create policy "faturas_delete_admin" on faturas
  for delete using (is_admin());

-- billing_settings: somente admin (usado pra calcular o valor da cobrança)
create policy "billing_settings_all_admin" on billing_settings
  for all using (is_admin()) with check (is_admin());

-- ============================================================
-- Trigger: cria o profile (e vincula/cria o associado ou admin)
-- automaticamente quando alguém se cadastra em auth.users.
-- Roda como security definer, então funciona mesmo antes da
-- confirmação de e-mail (não depende de RLS).
-- O papel ('admin' ou 'associado') e o nome vêm de
-- options.data passado no supabase.auth.signUp() do app.
--
-- Cadastro de administrador é restrito: o primeiro admin do sistema
-- pode se cadastrar livremente (bootstrap); depois disso, só entra
-- quem já foi pré-cadastrado por um admin existente (tela
-- Administradores → "+ Adicionar administrador", que cria uma linha
-- em public.admins com profile_id nulo — igual já funciona pra
-- associados). Sem isso, qualquer pessoa poderia se autopromover a
-- administrador só escolhendo a aba certa no cadastro.
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_role text := coalesce(new.raw_user_meta_data->>'role', 'associado');
  chosen_name text := coalesce(new.raw_user_meta_data->>'name', '');
  invited_admin_id bigint;
  any_admin_exists boolean;
begin
  if chosen_role = 'admin' then
    select id into invited_admin_id
      from public.admins where email = new.email and profile_id is null
      order by id limit 1;
    select exists(select 1 from public.admins where profile_id is not null) into any_admin_exists;

    if invited_admin_id is not null then
      update public.admins
        set profile_id = new.id, name = coalesce(nullif(chosen_name, ''), name)
        where id = invited_admin_id;
    elsif not any_admin_exists then
      insert into public.admins (profile_id, name, email) values (new.id, chosen_name, new.email);
    else
      raise exception 'Cadastro de administrador requer convite prévio de um administrador existente.';
    end if;

    insert into public.profiles (id, role, name, email) values (new.id, 'admin', chosen_name, new.email);
  else
    -- usa subquery com limit 1: mesmo que existam associados duplicados
    -- com o mesmo e-mail (cadastro errado do admin), só um é vinculado
    update public.associados
      set profile_id = new.id
      where id = (
        select id from public.associados
        where email = new.email and profile_id is null
        order by id
        limit 1
      );

    if not found then
      insert into public.associados (profile_id, name, email)
      values (new.id, chosen_name, new.email);
    end if;

    insert into public.profiles (id, role, name, email) values (new.id, 'associado', chosen_name, new.email);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Trigger: mantém associados.status sempre sincronizado com as
-- faturas dele (não deixa o status ser uma verdade separada que
-- o cliente poderia escrever livremente).
-- ============================================================
create or replace function sync_associado_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id bigint := coalesce(new.associado_id, old.associado_id);
  has_atrasado boolean;
  has_pendente boolean;
begin
  select
    exists(select 1 from faturas where associado_id = target_id and status = 'atrasado'),
    exists(select 1 from faturas where associado_id = target_id and status = 'pendente')
  into has_atrasado, has_pendente;

  update associados
  set status = case when has_atrasado then 'atrasado' when has_pendente then 'pendente' else 'pago' end
  where id = target_id;

  return null;
end;
$$;

drop trigger if exists sync_associado_status_trigger on faturas;
create trigger sync_associado_status_trigger
  after insert or update or delete on faturas
  for each row execute function sync_associado_status();

-- ============================================================
-- Trigger: impede que um associado altere, no próprio registro,
-- campos que só o admin deveria controlar (valor mensal, consumo,
-- vencimento, unidade, vínculo de conta). status é liberado porque
-- é mantido pelo trigger acima; nome/e-mail/telefone/endereço são
-- o que o associado pode editar no próprio perfil.
-- ============================================================
create or replace function protect_associado_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    new.monthly_value := old.monthly_value;
    new.consumption := old.consumption;
    new.due_date := old.due_date;
    new.unit := old.unit;
    new.profile_id := old.profile_id;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_associado_fields_trigger on associados;
create trigger protect_associado_fields_trigger
  before update on associados
  for each row execute function protect_associado_fields();
