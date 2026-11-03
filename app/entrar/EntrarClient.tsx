'use client';
import { useState } from 'react';
import { CoopsLink, useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { PasswordField } from '@/components/ds/PasswordField';
import { deskInput, label } from '@/components/ds/tokens';

export function EntrarClient() {
  const { go } = useCoopsRouter();
  const [v, setV] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [focus, setFocus] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(v) });
      const d = await r.json();
      if (!r.ok) { setError(d.error ?? 'Não foi possível entrar.'); setBusy(false); return; }
      go(d.next);
    } catch { setError('Sem conexão. Tente de novo.'); setBusy(false); }
  };
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <CoopsLink href="/" style={{ color: '#F5F2EC', textDecoration: 'none', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>coops<span style={{ color: '#B7A6FF' }}>.</span></CoopsLink>
        <span style={{ ...label(12, '0.1em'), color: '#B7A6FF' }}>ENTRAR</span>
        <h1 style={{ margin: 0, fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05 }}>Que bom ter você de volta</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="ent-email" style={{ fontSize: 14, color: '#A3A1AD' }}>E-mail de trabalho</label>
          <input id="ent-email" type="email" required autoComplete="email" placeholder="voce@empresa.com" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={deskInput(focus)} />
        </div>
        <PasswordField id="ent-senha" label="Senha" autoComplete="current-password" value={v.password} onChange={(password) => setV({ ...v, password })} />
        {error && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{error}</span>}
        <button type="submit" disabled={busy} style={{ minHeight: 52, color: '#0E0E12', background: '#B7A6FF', border: 0, fontFamily: 'inherit', fontWeight: 600, fontSize: 16, borderRadius: 14, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1 }}>Entrar</button>
        <p style={{ margin: 0, fontSize: 14, color: '#A3A1AD', textAlign: 'center' }}>Ainda não tem conta? <CoopsLink href="/cadastro">Criar conta</CoopsLink></p>
      </form>
    </main>
  );
}
