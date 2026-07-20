# Portal Amolina

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

## Envio de cobrança por e-mail (Resend)

O botão "Cobrar" manda um e-mail de verdade para o associado, via [Resend](https://resend.com) (grátis até 3.000 e-mails/mês) chamado por uma Supabase Edge Function — a chave do Resend nunca fica exposta no navegador.

1. Crie uma conta grátis em [resend.com](https://resend.com) e pegue uma **API Key** em *API Keys*.
2. **Verifique um domínio seu** em *Domains* (adicionar os registros DNS que o Resend pedir). Sem isso, o Resend só entrega e-mails pro próprio endereço da sua conta — não dá pra cobrar associados de verdade. Isso é o único custo real do fluxo: você precisa ser dono de um domínio (não precisa ser exclusivo pra isso, um subdomínio como `notificacoes.suaassociacao.com.br` já serve).
3. Instale a [Supabase CLI](https://supabase.com/docs/guides/cli) e faça login (`supabase login`).
4. Na pasta do projeto, rode:
   ```bash
   supabase link --project-ref <seu-project-ref>   # o ref está na Project URL: https://<ref>.supabase.co
   supabase secrets set RESEND_API_KEY=re_xxxxxxxx
   supabase secrets set COBRANCA_FROM_EMAIL="Portal Amolina <cobranca@seudominio.com.br>"
   supabase functions deploy send-cobranca
   ```
5. Pronto — os botões "Cobrar" e "Cobrar todos" já passam a enviar e-mail de verdade.

Sem esse passo, clicar em "Cobrar" mostra um erro (a função não vai existir ainda no seu projeto).

## Desenvolvimento

```bash
npm install
npm run dev
```

```bash
npm run build   # build de produção
npm run lint    # oxlint
```
