'use client';
import { useState } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import type { AvatarConfig } from '@/components/avatar/Avatar';
import { CoopsLink, useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { BottomSheet } from '@/components/sheet/BottomSheet';
import { cardInput, darkBtn, label } from '@/components/ds/tokens';
import { plural } from '@/lib/format';

type Msg = { id: string; role: 'USER' | 'AGENT'; text: string };
type Doubt = { id: string; question: string; resolved: boolean; summary: string; messages: Msg[] };

export function ConfereClient({ user, projectId, initiative, doubts }: {
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; projectId: string;
  initiative: { id: string; product: string; problem: string; need: string; deducedNeed: string; tableOpened: boolean }; doubts: Doubt[];
}) {
  const { refresh, go: push } = useCoopsRouter();
  const isManager = user.role === 'MANAGER';
  const [openId, setOpenId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const missing = doubts.filter((d) => !d.resolved).length;
  const current = doubts.find((d) => d.id === openId) ?? null;
  const api = `/api/initiatives/${initiative.id}`;

  const call = async (url: string, method: string, body?: object) => {
    setBusy(true); setError(null);
    try {
      const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? 'Não deu certo. Tente de novo.'); return false; }
      return true;
    } catch { setError('Sem conexão. Tente de novo.'); return false; } finally { setBusy(false); }
  };
  const send = async () => { if (!text.trim()) return; if (await call(`${api}/doubts/${openId}/messages`, 'POST', { text })) { setText(''); refresh(); } };
  const resolve = async () => { if (await call(`${api}/doubts/${openId}/resolve`, 'POST')) { setOpenId(null); refresh(); } };
  const reopen = async (id: string) => { if (await call(`${api}/doubts/${id}/resolve`, 'DELETE')) refresh(); };
  const openTable = async () => { if (await call(`${api}/table`, 'POST')) { refresh(); push(`/p/${projectId}/iniciativas`); } };

  const card = { color: '#0E0E12', borderRadius: 22, border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200, boxSizing: 'border-box', boxShadow: '0 16px 36px rgba(0,0,0,0.45)' } as const;
  const info = (tag: string, bg: string, body: string, flag?: string) => (
    <div key={tag} style={{ ...card, background: bg }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8, ...label(11, '0.08em') }}><span>{tag}</span>{flag && <span style={{ border: '1.5px solid #0E0E12', borderRadius: 999, padding: '2px 8px' }}>{flag}</span>}</span>
      <span style={{ fontSize: 17, lineHeight: 1.35, fontWeight: 600 }}>{body}</span>
    </div>
  );
  const lastIsAgent = current?.messages.at(-1)?.role === 'AGENT';

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8, borderRadius: 32, background: '#17171D', border: '1px solid #2C2C36', padding: 'clamp(20px, 4vw, 36px)' }}>
          <CoopsLink href={`/p/${projectId}/iniciativas`} style={{ fontSize: 14, minHeight: 44, display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start' }}>← Iniciativas</CoopsLink>
          <span style={{ ...label(12, '0.1em'), color: '#9BE3C3' }}>{initiative.product.toUpperCase()}</span>
          <h1 style={{ margin: 0, fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1 }}>Confere se entendi?</h1>
        </section>

        <section aria-label="O que o agente entendeu" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {info('PRODUTO', '#B7A6FF', initiative.product)}
          {info('PROBLEMA', '#F3D36B', initiative.problem || 'Ainda não informado')}
          {info('NECESSIDADE', '#A9D8F5', initiative.need || initiative.deducedNeed, initiative.need ? undefined : 'PRECISA CONFIRMAR')}
          {doubts.map((d, n) => d.resolved ? (
            <div key={d.id} style={{ ...card, background: '#F5F2EC' }}>
              <span style={label(11, '0.08em')}>{String(n + 1).padStart(2, '0')} CONTEXTO · RESOLVIDO COM O AGENTE</span>
              <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{d.question}</span>
              <span style={{ fontSize: 14, lineHeight: 1.4 }}>{d.summary}</span>
              {isManager && !initiative.tableOpened && <button type="button" disabled={busy} onClick={() => reopen(d.id)} style={{ ...darkBtn, marginTop: 'auto', alignSelf: 'flex-start', minHeight: 44 }}>Reabrir dúvida</button>}
            </div>
          ) : (
            <div key={d.id} style={{ ...card, background: '#9BE3C3' }}>
              <span style={label(11, '0.08em')}>DÚVIDA {n + 1}</span>
              <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>{d.question}</span>
              {isManager ? <button type="button" onClick={() => { setOpenId(d.id); setText(''); setError(null); }} style={{ ...darkBtn, marginTop: 'auto', alignSelf: 'flex-start', minHeight: 44 }}>Responder</button> : <span style={{ marginTop: 'auto', fontSize: 13 }}>O manager responde esta dúvida.</span>}
            </div>
          ))}
        </section>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {initiative.tableOpened ? <span style={{ ...label(12, '0.08em'), color: '#9BE3C3' }}>MESA ABERTA · AS CARTAS DE CONTEXTO ENTRAM NO PRÓXIMO PASSO</span> : isManager && (
            <>
              <button type="button" disabled={missing > 0 || busy} onClick={openTable} style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 16, color: '#0E0E12', background: '#B7A6FF', border: '2px solid #0E0E12', borderRadius: 14, minHeight: 52, padding: '0 22px', cursor: missing ? 'not-allowed' : 'pointer', opacity: missing ? 0.45 : 1 }}>Isso mesmo, abrir a mesa</button>
              {missing > 0 && <span style={{ ...label(12, '0.08em'), color: '#F3D36B' }}>FALTAM RESOLVER {missing} {plural(missing, 'DÚVIDA', 'DÚVIDAS')}</span>}
            </>
          )}
          {error && !current && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{error}</span>}
        </div>
      </div>

      {current && (
        <BottomSheet tag="AGENTE · DÚVIDA" title="Conversa com o agente" onClose={() => setOpenId(null)}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>{current.question}</p>
          <div role="log" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {current.messages.map((m) => (
              <div key={m.id} style={{ alignSelf: m.role === 'USER' ? 'flex-end' : 'flex-start', maxWidth: '85%', borderRadius: 16, padding: '10px 14px', fontSize: 15, lineHeight: 1.45, background: m.role === 'USER' ? '#2C2C36' : '#9BE3C3', color: m.role === 'USER' ? '#F5F2EC' : '#0E0E12' }}>{m.text}</div>
            ))}
          </div>
          {lastIsAgent ? (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" disabled={busy} onClick={() => document.getElementById('conf-reply')?.focus()} style={{ ...darkBtn, background: 'transparent', color: '#F5F2EC', border: '1.5px solid #4A4858', minHeight: 48 }}>Não, vou explicar melhor</button>
              <button type="button" disabled={busy} onClick={resolve} style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 15, color: '#0E0E12', background: '#B7A6FF', border: '2px solid #0E0E12', borderRadius: 14, minHeight: 48, padding: '0 20px', cursor: 'pointer' }}>Sim, resolver dúvida</button>
            </div>
          ) : null}
          <form onSubmit={(e) => { e.preventDefault(); void send(); }} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea id="conf-reply" aria-label="Sua resposta" maxLength={2000} placeholder="Explique com suas palavras" value={text} onChange={(e) => setText(e.target.value)} style={{ ...cardInput, minHeight: 100, resize: 'vertical' }} />
            <button type="submit" disabled={busy || !text.trim()} style={{ ...darkBtn, alignSelf: 'flex-start', minHeight: 48, opacity: text.trim() ? 1 : 0.5 }}>{busy ? 'Enviando…' : 'Enviar'}</button>
          </form>
          {error && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{error}</span>}
        </BottomSheet>
      )}
    </div>
  );
}
