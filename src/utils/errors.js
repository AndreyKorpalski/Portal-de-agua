const EXACT_MESSAGES = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'User already registered': 'Já existe uma conta com este e-mail.',
  'Database error saving new user': 'Não foi possível criar a conta de administrador — seu e-mail precisa ser cadastrado antes por um administrador existente (tela Administradores).',
};

const PATTERN_MESSAGES = [
  {
    test: /failed to send a request to the edge function/i,
    message: 'Não foi possível conectar ao serviço de envio de e-mail. A função "send-cobranca" pode não estar publicada no Supabase — confira em Edge Functions no painel do projeto.',
  },
  { test: /fetch|network|connection/i, message: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.' },
  { test: /associados_email_unique/i, message: 'Já existe um associado cadastrado com esse e-mail.' },
  { test: /faturas_associado_month_unique/i, message: 'Já existe uma cobrança gerada para esse associado neste mês.' },
  { test: /duplicate key value violates unique constraint/i, message: 'Já existe um registro com esses dados.' },
  { test: /row-level security policy|permission denied/i, message: 'Você não tem permissão para fazer isso.' },
  { test: /jwt expired|invalid jwt|invalid or expired/i, message: 'Sua sessão expirou. Saia e entre novamente.' },
  { test: /rate limit/i, message: 'Muitas tentativas em pouco tempo. Aguarde um instante e tente de novo.' },
];

export function translateError(message) {
  if (!message) return 'Ocorreu um erro inesperado.';
  if (EXACT_MESSAGES[message]) return EXACT_MESSAGES[message];
  const match = PATTERN_MESSAGES.find((p) => p.test.test(message));
  if (match) return match.message;
  return message;
}
