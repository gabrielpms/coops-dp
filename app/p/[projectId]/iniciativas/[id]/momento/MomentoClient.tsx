'use client';
import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import type { AvatarConfig } from '@/components/avatar/Avatar';
import { CoopsLink, useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { BottomSheet } from '@/components/sheet/BottomSheet';
import { cardInput, darkBtn, label } from '@/components/ds/tokens';
import { MOMENTS, type Tool } from '@/lib/tools';

type RCard = { id: string; title: string; tag: string; description: string; impact: string; effort: string; metric: string; nextStep: string; decision: 'KEPT' | 'DISCARDED' | null; note: string };
type Play = { id: string; toolId: string; cards: RCard[] };

export function MomentoClient({ user, projectId, initiative, tools, plays }: {
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; projectId: string;
  initiative: { id: string; product: string; moment: number; reason: string; closed: boolean }; tools: Tool[]; plays: Play[];
}) {
  const { refresh } = useCoopsRouter();
  const canPlay = user.role === 'MANAGER' && !initiative.closed;
  const [openPlay, setOpenPlay] = useState<string | null>(null);
  const [local, setLocal] = useState<Record<string, Partial<RCard>>>({}); // decisões/notas otimistas
  const [review, setReview] = useState(false); // fim do deck: mostra o resumo
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const play = plays.find((p) => p.id === openPlay) ?? null;
  const cards = (play?.cards ?? []).map((c) => ({ ...c, ...local[c.id] }));
  const pending = cards.filter((c) => !c.decision);
  const reviewed = cards.length - pending.length;
  const [openCard, setOpenCard] = useState<string | null>(null);
  const current = cards.find((c) => c.id === openCard) ?? pending[0] ?? null;
  const api = `/api/initiatives/${initiative.id}`;

  const jogar = async (toolId: string) => {
    const existing = plays.find((p) => p.toolId === toolId);
    if (existing) { setOpenCard(null); setReview(false); setOpenPlay(existing.id); return; }
    setBusy(true); setError(null);
    try {
      const res = await fetch(`${api}/plays`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ toolId }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? 'Não deu para jogar a carta.'); return; }
      setOpenCard(null); setReview(false); setOpenPlay(data.play.id); // abre assim que a página recarregar com o deck novo
      refresh();
    } catch { setError('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };
  const patch = async (id: string, body: object) => {
    const res = await fetch(`/api/response-cards/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null);
    if (!res?.ok) { setError('Não foi possível salvar a decisão. Tente de novo.'); return false; }
    return true;
  };
  const decide = async (c: RCard, decision: 'KEPT' | 'DISCARDED') => {
    setError(null);
    setLocal((l) => ({ ...l, [c.id]: { ...l[c.id], decision } }));
    setOpenCard(null);
    if (!(await patch(c.id, { decision }))) setLocal((l) => ({ ...l, [c.id]: { ...l[c.id], decision: null } }));
  };
  const saveNote = async (c: RCard, note: string) => { if (note !== c.note) { setLocal((l) => ({ ...l, [c.id]: { ...l[c.id], note } })); await patch(c.id, { note }); } };
  const again = async () => { if (!play) return; await fetch(`/api/plays/${play.id}`, { method: 'DELETE' }); setLocal({}); setReview(false); refresh(); };
  const close = () => { setOpenPlay(null); setOpenCard(null); setReview(false); refresh(); };

  // setas ← descartar / → para a mesa
  useEffect(() => {
    if (!play || !current || !canPlay || current.decision) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') void decide(current, 'DISCARDED'); else if (e.key === 'ArrowRight') void decide(current, 'KEPT');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const tool = (id: string) => tools.find((t) => t.id === id);
  const kept = cards.filter((c) => c.decision === 'KEPT');
  const done = play && !pending.length && cards.length > 0;
  const card = { color: '#0E0E12', borderRadius: 22, border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, height: 240, boxSizing: 'border-box', boxShadow: '0 16px 36px rgba(0,0,0,0.45)', textAlign: 'left', fontFamily: 'inherit' } as const;
  const ghost = { ...darkBtn, background: 'transparent', color: '#F5F2EC', border: '1.5px solid #4A4858', minHeight: 48 } as const;
  const primary = { fontFamily: 'inherit', fontWeight: 600, fontSize: 15, color: '#0E0E12', background: '#B7A6FF', border: '2px solid #0E0E12', borderRadius: 14, minHeight: 48, padding: '0 20px', cursor: 'pointer' } as const;
  const kv = (k: string, v: string) => <span key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={label(10)}>{k}</span><span style={{ fontSize: 14, lineHeight: 1.35 }}>{v}</span></span>;

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8, borderRadius: 32, background: '#17171D', border: '1px solid #2C2C36', padding: 'clamp(20px, 4vw, 36px)' }}>
          <CoopsLink href={`/p/${projectId}/iniciativas/${initiative.id}/mesa`} style={{ fontSize: 14, minHeight: 44, display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start' }}>← Mesa da iniciativa</CoopsLink>
          <span style={{ ...label(12, '0.1em'), color: '#B7A6FF' }}>{initiative.product.toUpperCase()}</span>
          <h1 style={{ margin: 0, fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05 }}>Sua iniciativa está em {MOMENTS[initiative.moment]}</h1>
          {initiative.reason && <p style={{ margin: 0, fontSize: 16, color: '#A3A1AD', lineHeight: 1.45 }}>{initiative.reason}</p>}
          <ol aria-label="Os 5 momentos" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0, margin: '8px 0 0' }}>
            {[1, 2, 3, 4, 5].map((n) => <li key={n} aria-current={n === initiative.moment ? 'step' : undefined} style={{ fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 999, color: n === initiative.moment ? '#0E0E12' : '#A3A1AD', background: n === initiative.moment ? '#B7A6FF' : 'transparent', border: n === initiative.moment ? '2px solid #0E0E12' : '1.5px solid #4A4858' }}>{n} · {MOMENTS[n]}</li>)}
          </ol>
        </section>

        <section aria-label="Deck de ferramentas" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {tools.map((t) => {
            const p = plays.find((x) => x.toolId === t.id); const total = p?.cards.length ?? 0; const rev = p?.cards.filter((c) => c.decision).length ?? 0;
            const disabled = busy || (!p && !canPlay);
            return (
              <button key={t.id} type="button" disabled={disabled} onClick={() => jogar(t.id)} className="coops-card" aria-label={`${p ? 'Abrir' : 'Jogar'} ${t.title}`} style={{ ...card, background: t.bg, cursor: disabled ? 'default' : 'pointer' }}>
                <span style={label(11, '0.08em')}>{t.type.toUpperCase()}</span>
                <span style={{ marginTop: 'auto', fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>{t.title}</span>
                <span style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 8, fontSize: 13, lineHeight: 1.4 }}>{p ? `${rev} de ${total} revisadas` : t.desc}</span>
              </button>
            );
          })}
        </section>
        {error && !play && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{error}</span>}
        <p style={{ margin: 0, color: '#A3A1AD', fontSize: 14 }}>As respostas são fixas por enquanto; o agente de IA entra no M9.</p>
      </div>

      {play && (
        <BottomSheet tag="DECK DE RESPOSTA" title={tool(play.toolId)?.title ?? 'Deck de resposta'} onClose={close}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Escolha quais caminhos vão para a mesa da iniciativa</p>
          <span style={{ ...label(12, '0.08em'), color: '#B7A6FF' }}>{reviewed} DE {cards.length} REVISADAS</span>
          {done || review ? (
            <>
              <h2 style={{ margin: 0, fontSize: 22 }}>{kept.length ? 'Caminhos que foram para a mesa' : 'Nenhum caminho foi para a mesa'}</h2>
              {kept.map((c) => <div key={c.id} style={{ borderRadius: 16, background: '#9BE3C3', color: '#0E0E12', padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}><b style={{ fontSize: 16 }}>{c.title}</b><span style={{ fontSize: 14 }}><b>Próximo passo:</b> {c.nextStep}</span>{c.note && <span style={{ fontSize: 13 }}>Nota: {c.note}</span>}</div>)}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {canPlay && <button type="button" onClick={again} style={ghost}>Revisar de novo</button>}
                <CoopsLink href={`/p/${projectId}/iniciativas/${initiative.id}/mesa`} style={{ ...primary, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>Ver na mesa da iniciativa</CoopsLink>
              </div>
            </>
          ) : current && (
            <>
              <div style={{ borderRadius: 22, background: '#F5F2EC', color: '#0E0E12', border: '2px solid #0E0E12', padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', ...label(11, '0.08em') }}><span>CAMINHO {cards.findIndex((c) => c.id === current.id) + 1} DE {cards.length}</span><span style={{ border: '1.5px solid #0E0E12', borderRadius: 999, padding: '2px 8px' }}>{current.tag}</span></span>
                <span style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.15 }}>{current.title}</span>
                <span style={{ fontSize: 15, lineHeight: 1.45 }}>{current.description}</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, borderTop: '1.5px solid #0E0E12', paddingTop: 10 }}>{[kv('IMPACTO', current.impact), kv('ESFORÇO', current.effort), kv('MÉTRICA AFETADA', current.metric)]}</div>
                {kv('PRÓXIMO PASSO SE FOR PARA A MESA', current.nextStep)}
                <textarea key={current.id} aria-label="Nota sobre este caminho" maxLength={1000} placeholder="Nota (opcional)" defaultValue={current.note} onBlur={(e) => saveNote(current, e.target.value.trim())} style={{ ...cardInput, minHeight: 70, resize: 'vertical' }} />
              </div>
              {error && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{error}</span>}
              {canPlay ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => decide(current, 'DISCARDED')} style={ghost}>← Descartar</button>
                  <button type="button" onClick={() => decide(current, 'KEPT')} style={primary}>Para a mesa →</button>
                </div>
              ) : <span style={{ fontSize: 13, color: '#A3A1AD' }}>Só o manager decide os caminhos.</span>}
            </>
          )}
          <div aria-label="Cartas do deck" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid #2C2C36', paddingTop: 12 }}>
            {cards.map((c, n) => <button key={c.id} type="button" onClick={() => { setReview(false); setOpenCard(c.id); }} aria-label={`Caminho ${n + 1}: ${c.decision === 'KEPT' ? 'na mesa' : c.decision === 'DISCARDED' ? 'descartado' : 'pendente'}`} style={{ fontFamily: 'inherit', fontSize: 12, fontWeight: 600, minHeight: 44, padding: '0 12px', borderRadius: 10, cursor: 'pointer', color: c.decision === 'DISCARDED' ? '#A3A1AD' : '#0E0E12', background: c.decision === 'KEPT' ? '#9BE3C3' : c.decision === 'DISCARDED' ? '#2C2C36' : '#F5F2EC', border: '1.5px solid #4A4858' }}>{n + 1} · {c.decision === 'KEPT' ? 'Na mesa' : c.decision === 'DISCARDED' ? 'Descartada' : 'Pendente'}</button>)}
          </div>
          <button type="button" onClick={close} style={{ ...ghost, alignSelf: 'flex-start' }}>Fechar e continuar depois</button>
        </BottomSheet>
      )}
    </div>
  );
}
