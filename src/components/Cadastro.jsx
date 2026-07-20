import { useState } from 'react';
import { DropletIcon } from './icons';
import { translateError } from '../utils/errors';

function handleInvalid(e) {
  const el = e.target;
  if (el.validity.valueMissing) el.setCustomValidity('Preencha este campo.');
  else if (el.validity.typeMismatch) el.setCustomValidity('Digite um e-mail válido.');
  else if (el.validity.tooShort) el.setCustomValidity('A senha precisa ter pelo menos 6 caracteres.');
  else el.setCustomValidity('');
}

function clearValidity(e) {
  e.target.setCustomValidity('');
}

export default function Cadastro({ isMobile, doSignUp, goLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const loginGridStyle = {
    width: '100%',
    maxWidth: isMobile ? '420px' : '900px',
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 20px 60px -20px oklch(30% 0.05 230 / 0.35)',
    background: '#fff',
  };

  const inputStyle = {
    border: '1.5px solid oklch(89% 0.01 230)',
    borderRadius: 9,
    padding: '11px 13px',
    fontSize: 14,
    marginBottom: 16,
    outline: 'none',
    color: 'oklch(20% 0.02 230)',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      const result = await doSignUp({ email, password, name, role: 'associado' });
      if (!result?.session) {
        setNotice('Conta criada! Verifique seu e-mail para confirmar antes de entrar.');
      } else {
        goLogin();
      }
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'oklch(97.5% 0.006 230)',
        padding: 24,
      }}
    >
      <div style={loginGridStyle}>
        {!isMobile && (
          <div
            style={{
              background: 'linear-gradient(160deg, oklch(32% 0.08 220), oklch(24% 0.07 235))',
              padding: '48px 40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: '#fff',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
                <DropletIcon size={30} stroke="#fff" strokeWidth={1.6} />
                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '.01em' }}>Portal Amolina</span>
              </div>
              <h1 style={{ fontSize: 32, lineHeight: 1.25, fontWeight: 800, margin: '0 0 16px' }}>
                Cadastro de associado
              </h1>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'oklch(88% 0.03 220)', maxWidth: 340, margin: 0 }}>
                Crie sua conta para acompanhar suas cobranças e pagamentos.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'oklch(18% 0.02 230)' }}>Criar minha conta</div>
            <div style={{ fontSize: 12.5, color: 'oklch(52% 0.01 230)', marginTop: 3 }}>Cadastro exclusivo para associados</div>
          </div>

          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'oklch(35% 0.02 230)', marginBottom: 6 }}>Nome completo</label>
          <input
            value={name}
            onChange={(e) => { clearValidity(e); setName(e.target.value); }}
            onInvalid={handleInvalid}
            required
            style={inputStyle}
          />

          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'oklch(35% 0.02 230)', marginBottom: 6 }}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { clearValidity(e); setEmail(e.target.value); }}
            onInvalid={handleInvalid}
            placeholder="associado@email.com"
            required
            style={inputStyle}
          />

          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'oklch(35% 0.02 230)', marginBottom: 6 }}>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { clearValidity(e); setPassword(e.target.value); }}
            onInvalid={handleInvalid}
            placeholder="••••••••"
            minLength={6}
            required
            style={{ ...inputStyle, marginBottom: 20 }}
          />

          {error && (
            <p style={{ fontSize: 12.5, color: 'oklch(45% 0.15 25)', background: 'oklch(95% 0.04 25)', borderRadius: 8, padding: '8px 11px', margin: '0 0 14px' }}>
              {error}
            </p>
          )}
          {notice && (
            <p style={{ fontSize: 12.5, color: 'oklch(38% 0.13 150)', background: 'oklch(94% 0.04 150)', borderRadius: 8, padding: '8px 11px', margin: '0 0 14px' }}>
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: 'oklch(32% 0.08 220)',
              color: '#fff',
              border: 'none',
              borderRadius: 9,
              padding: 13,
              fontSize: 14.5,
              fontWeight: 700,
              cursor: submitting ? 'default' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              marginBottom: 14,
            }}
          >
            {submitting ? 'Aguarde...' : 'Criar conta'}
          </button>

          <button
            type="button"
            onClick={goLogin}
            style={{ background: 'none', border: 'none', color: 'oklch(45% 0.13 230)', fontSize: 12.5, textAlign: 'center', cursor: 'pointer' }}
          >
            Já tem conta? Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
