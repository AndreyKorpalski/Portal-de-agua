# Associação das Águas

Sistema de gestão para associações de água — cobranças, pagamentos e despesas, com áreas separadas para administradores e associados.

App em React com backend real no Supabase (banco de dados, autenticação e regras de segurança).

## Funcionalidades

**Administrador**
- Dashboard financeiro (arrecadação, gastos, saldo, inadimplência)
- Gestão de associados (valor mensal, consumo, vencimento, cobranças)
- Lançamento de despesas
- Gestão de administradores
- Relatórios exportáveis em PDF e CSV

**Associado**
- Resumo de faturas em aberto
- Pagamento via Pix ou boleto
- Histórico de pagamentos

## Configuração do banco (Supabase)

Este app usa o [Supabase](https://supabase.com) como backend (banco de dados Postgres e autenticação).

1. Crie uma conta grátis em [supabase.com](https://supabase.com) e um novo projeto.
2. No painel do projeto, abra **SQL Editor**, cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e execute (`Run`). Isso cria todas as tabelas e permissões.
3. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.
4. Copie `.env.example` para `.env` e preencha com esses valores:
   ```bash
   cp .env.example .env
   ```

## Desenvolvimento

```bash
npm install
npm run dev
```

```bash
npm run build   # build de produção
npm run lint    # oxlint
```
