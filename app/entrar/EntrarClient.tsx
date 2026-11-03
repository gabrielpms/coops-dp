'use client';
import { useState } from 'react';
import { CoopsLink } from '@/components/nav/useCoopsRouter';
import { deskInput, label } from '@/components/ds/tokens';

export function EntrarClient({ linkError }: { linkError: boolean }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(linkError ? 'Esse link venceu ou já foi usado. Peça um novo.' : '');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError('');
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) });
    const d = await r.json(); setBusy(false);
    if (!r.ok) { setError(d.error ?? 'Algo deu errado.'); return; }
    setDevLink(d.devLink); setSent(true);
  };
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>coops<span style={{ color: '#B7A6FF' }}>.</span></span>
        <span style={{ ...label(12, '0.1em'), color: '#B7A6FF' }}>ENTRAR</span>
        <h1 style={{ margin: 0, fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05 }}>{sent ? 'Confira seu e-mail' : 'Que bom ter você de volta'}</h1>
        {sent ? (
          <>
            <p style={{ margin: 0, color: '#A3A1AD', fontSize: 16, lineHeight: 1.5 }}>Se existe uma conta para {email}, enviamos um link de acesso. Ele vale por 15 minutos.</p>
            {devLink && <p style={{ margin: 0, fontSize: 14, wordBreak: 'break-all' }}>Ambiente de desenvolvimento: <a href={devLink}>abrir o link</a></p>}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="ent-email" style={{ fontSize: 14, color: '#A3A1AD' }}>E-mail de trabalho</label>
              <input id="ent-email" type="email" required autoComplete="email" placeholder="voce@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} style={deskInput()} />
            </div>
            {error && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{error}</span>}
            <button type="submit" disabled={busy} style={{ minHeight: 52, color: '#0E0E12', background: '#B7A6FF', border: 0, fontFamily: 'inherit', fontWeight: 600, fontSize: 16, borderRadius: 14, cursor: 'pointer' }}>Receber link de acesso</button>
          </>
        )}
        <p style={{ margin: 0, fontSize: 14, color: '#A3A1AD', textAlign: 'center' }}>Ainda não tem conta? <CoopsLink href="/cadastro">Criar conta</CoopsLink></p>
      </form>
    </main>
  );
}
