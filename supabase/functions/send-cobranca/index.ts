// Supabase Edge Function: envia um e-mail de cobrança para um associado via Resend.
//
// Deploy: supabase functions deploy send-cobranca
// Segredo necessário: supabase secrets set RESEND_API_KEY=re_xxxxxxxx
// Opcional: supabase secrets set COBRANCA_FROM_EMAIL="Portal Amolina <cobranca@seudominio.com.br>"
//   (sem isso, usa o domínio de testes do Resend, que só entrega para o
//   próprio e-mail da conta Resend — configure um domínio verificado
//   antes de cobrar associados de verdade)
import { createClient } from 'jsr:@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const FROM_EMAIL = Deno.env.get('COBRANCA_FROM_EMAIL') ?? 'Portal Amolina <onboarding@resend.dev>';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!RESEND_API_KEY) return json({ error: 'RESEND_API_KEY não configurada no projeto Supabase' }, 500);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Não autenticado' }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: 'Não autenticado' }, 401);

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return json({ error: 'Apenas administradores podem enviar cobranças' }, 403);

    const { associadoId } = await req.json();
    if (!associadoId) return json({ error: 'associadoId é obrigatório' }, 400);

    const { data: associado, error: fetchError } = await supabase
      .from('associados')
      .select('name, email, unit, monthly_value, due_date, status')
      .eq('id', associadoId)
      .single();
    if (fetchError || !associado) return json({ error: 'Associado não encontrado' }, 404);
    if (!associado.email || associado.email === '—') return json({ error: 'Associado sem e-mail cadastrado' }, 400);

    const valueFmt = brl(Number(associado.monthly_value));
    const atrasado = associado.status === 'atrasado';

    const html = `
      <div style="font-family: -apple-system, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
        <h2 style="color:#1e405a; margin-bottom: 4px;">Portal Amolina</h2>
        <p>Olá, ${escapeHtml(associado.name)},</p>
        <p>Sua fatura de água (${escapeHtml(associado.unit || '')}) está ${atrasado ? '<strong style="color:#b91c1c;">em atraso</strong>' : 'em aberto'}:</p>
        <p style="font-size:26px; font-weight:bold; color:#1e405a; margin: 12px 0;">${valueFmt}</p>
        <p>Vencimento: <strong>${escapeHtml(associado.due_date)}</strong></p>
        <p>Acesse o sistema da associação para pagar via Pix ou boleto.</p>
        <p style="color:#888; font-size:12px; margin-top:24px;">Esta é uma mensagem automática, não responda este e-mail.</p>
      </div>
    `;

    const resendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: associado.email,
        subject: `Cobrança — ${valueFmt} vence em ${associado.due_date}`,
        html,
      }),
    });

    if (!resendResp.ok) {
      const errText = await resendResp.text();
      return json({ error: `Falha ao enviar e-mail: ${errText}` }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
