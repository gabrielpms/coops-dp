'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import type { AvatarConfig } from '@/components/avatar/Avatar';
import { CoopsLink, useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { TOOL_ICON_PARTS } from '@/lib/toolIcons';
import { cardInput, darkBtn, label, mono } from '@/components/ds/tokens';
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
  const [grid, setGrid] = useState(false); // leque com todas as cartas
  const [facet, setFacet] = useState<'how' | 'notes'>('how');
  const [wait, setWait] = useState(false); // deck sendo montado
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
    if (existing) { setOpenCard(null); setReview(false); setGrid(false); setOpenPlay(existing.id); return; }
    setBusy(true); setError(null);
    try {
      const res = await fetch(`${api}/plays`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ toolId }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? 'Não deu para jogar a carta.'); return; }
      setOpenCard(null); setReview(false); setGrid(false); setOpenPlay(data.play.id); setWait(true); // abre assim que a página recarregar com o deck novo
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
  const close = () => { setOpenPlay(null); setOpenCard(null); setReview(false); setGrid(false); setWait(false); refresh(); };
  useEffect(() => { if (play) setWait(false); }, [play]);

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

  const KIND: Record<string, string> = { 'DIAGNÓSTICO': 'search', 'PESSOAS': 'people', 'DADOS': 'chart', 'IDEIAS': 'bulb', 'JORNADA': 'path', 'FUTURO': 'future', 'EXPLORAÇÃO': 'branches', 'PROVOCAÇÃO': 'ebulb', 'MERCADO': 'coffee', 'RARA · TENDÊNCIA': 'crystal', 'ANÁLISE': 'search', 'TESTE': 'test', 'MÉTRICAS': 'gauge', 'NARRATIVA': 'bubble', 'DECISÃO': 'sign' };
  const parts = (t: Tool) => TOOL_ICON_PARTS[KIND[t.type.toUpperCase()] ?? 'star'] ?? [];
  const TAGBG: Record<string, string> = { SEGURA: '#8FE3C8', 'MÉDIA': '#F3D36B', OUSADA: '#FF8A5B' };
  const lvl = (v: string) => (/alt/i.test(v) ? 3 : /m[eé]d/i.test(v) ? 2 : 1);
  const bars = (v: string) => <span style={{ display: 'flex', gap: 4 }}>{[1, 2, 3].map((n) => <span key={n} style={{ flex: 1, height: 11, borderRadius: 4, border: '1.5px solid #0E0E12', background: n <= lvl(v) ? '#0E0E12' : 'transparent' }} />)}</span>;
  const kpi = (k: string, body: React.ReactNode) => <div key={k} style={{ background: 'rgba(245,242,236,0.7)', border: '1.5px solid #0E0E12', borderRadius: 14, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}><span style={{ ...mono, fontSize: 10 }}>{k}</span>{body}</div>;
  const rot = ['rotate(-5deg) translateY(10px)', 'rotate(-1.5deg) translateY(-4px)', 'rotate(1.5deg) translateY(-4px)', 'rotate(5deg) translateY(10px)'];
  const lastPlay = plays.length ? plays[plays.length - 1] : null;
  const playTool = play ? tool(play.toolId) : null;
  const toolColor = playTool?.bg ?? '#B7A6FF';
  const view = done || review ? 'end' : grid ? 'deck' : 'finding';
  const n = current ? cards.findIndex((c) => c.id === current.id) + 1 : 0;
  const dialogOpen = !!openPlay;

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <section style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'stretch' }}>
          <CoopsLink href={`/p/${projectId}/iniciativas/${initiative.id}/mesa`} className="coops-card" style={{ flex: '0 0 240px', minHeight: 220, boxSizing: 'border-box', borderRadius: 22, background: '#B7A6FF', color: '#0E0E12', border: '2px solid #0E0E12', padding: 18, display: 'flex', flexDirection: 'column', gap: 10, textDecoration: 'none', boxShadow: '0 16px 36px rgba(0,0,0,0.45)' }}>
            <span style={{ display: 'flex', justifyContent: 'space-between', ...label(11, '0.08em') }}><span>INICIATIVA</span><span>MESA</span></span>
            <span style={{ marginTop: 'auto', fontSize: 20, fontWeight: 800, lineHeight: 1.15 }}>{initiative.product}</span>
            <span style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 8, fontSize: 13 }}>← Mesa da iniciativa</span>
          </CoopsLink>
          <div style={{ flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16, borderRadius: 32, background: '#17171D', border: '1px solid #2C2C36', padding: 'clamp(20px, 4vw, 32px)' }}>
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <span className="coops-ichov" aria-hidden="true" style={{ flex: '0 0 72px', height: 72, borderRadius: 20, border: '2px solid #8FE3C8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="44" height="44" viewBox="0 0 64 64" fill="none" stroke="#8FE3C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}><path className="ic-bulb" d="M32 8a16 16 0 0 0-10 28c3 3 4 6 4 10h12c0-4 1-7 4-10A16 16 0 0 0 32 8z" /><path d="M26 52h12M28 58h8" /></svg>
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                <span style={{ ...label(12, '0.1em'), color: '#8FE3C8' }}>AGENTE DE MOMENTO</span>
                <h1 style={{ margin: 0, fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05 }}>Sua iniciativa está em {MOMENTS[initiative.moment]}</h1>
                {initiative.reason && <p style={{ margin: 0, fontSize: 16, color: '#A3A1AD', lineHeight: 1.45 }}>{initiative.reason}</p>}
              </div>
            </div>
            <ol aria-label="Os 5 momentos" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
              {[1, 2, 3, 4, 5].map((m) => <li key={m} aria-current={m === initiative.moment ? 'step' : undefined} style={{ fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 999, color: m === initiative.moment ? '#0E0E12' : '#A3A1AD', background: m === initiative.moment ? '#B7A6FF' : 'transparent', border: m === initiative.moment ? 0 : '1px solid #4A4858' }}>{m} · {MOMENTS[m]}</li>)}
            </ol>
          </div>
        </section>

        <section aria-label="Deck de ferramentas" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}><h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Deck de ferramentas · {MOMENTS[initiative.moment]}</h2><span style={{ fontSize: 14, color: '#A3A1AD' }}>Jogue uma carta e o agente devolve um deck de resposta</span></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', padding: '16px 0 8px' }}>
            {tools.map((t, i) => {
              const p = plays.find((x) => x.toolId === t.id); const total = p?.cards.length ?? 3; const rev = p?.cards.filter((c) => c.decision).length ?? 0;
              const disabled = busy || (!p && !canPlay);
              return (
                <button key={t.id} type="button" disabled={disabled} onClick={() => jogar(t.id)} className="coops-card" aria-pressed={!!p} aria-label={`${p ? 'Abrir' : 'Jogar'} ${t.title}`} style={{ fontFamily: 'inherit', textAlign: 'left', flex: '0 0 210px', height: 290, boxSizing: 'border-box', borderRadius: 22, background: t.bg, color: '#0E0E12', border: '2px solid #0E0E12', outline: p ? '3px solid #F5F2EC' : '0 solid transparent', outlineOffset: 4, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, transform: p ? 'translateY(-24px)' : rot[i % 4], boxShadow: '0 14px 30px rgba(0,0,0,0.45)', cursor: disabled ? 'default' : 'pointer' }}>
                  <span style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ overflow: 'visible' }}>{parts(t).map(([c, st, d], k) => <path key={k} className={c || undefined} style={st ? Object.fromEntries(st.split(';').filter(Boolean).map((x) => { const [a, b] = x.split(':'); return [a.trim().startsWith('--') ? a.trim() : a.trim().replace(/-(\w)/g, (_, ch) => ch.toUpperCase()), b.trim()]; })) as CSSProperties : undefined} d={d} />)}</svg>
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 38, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' }}>{String(total).padStart(2, '0')}</span><span style={{ ...mono, fontSize: 10 }}>CARTAS</span></span>
                  </span>
                  <span style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', ...mono, fontSize: 11, letterSpacing: '0.06em' }}>{t.type.toUpperCase()}{p && <span style={{ fontWeight: 700, color: '#F5F2EC', background: '#0E0E12', borderRadius: 999, padding: '2px 8px' }}>JOGADA</span>}</span>
                  <span style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.15 }}>{t.title}</span>
                  <span style={{ fontSize: 12, lineHeight: 1.4 }}>{p ? `${rev} de ${total} revisadas` : t.desc}</span>
                </button>
              );
            })}
          </div>
        </section>
        {lastPlay && !dialogOpen && (() => { const lt = tool(lastPlay.toolId); return (
          <section aria-label="Última resposta do agente" style={{ borderRadius: 22, border: '1.5px dashed #4A4858', padding: '18px 20px', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
            <span aria-hidden="true" style={{ flex: '0 0 44px', height: 56, borderRadius: 10, background: lt?.bg ?? '#B7A6FF', border: '2px solid #0E0E12', boxShadow: '4px 4px 0 #2C2C36' }} />
            <span style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontWeight: 600 }}>Deck de resposta · {lt?.title}</span><span style={{ fontSize: 14, color: '#A3A1AD' }}>{lastPlay.cards.filter((c) => c.decision === 'KEPT').length} na mesa · {lastPlay.cards.filter((c) => c.decision === 'DISCARDED').length} descartadas · {lastPlay.cards.filter((c) => !c.decision).length} pendentes</span></span>
            <button type="button" onClick={() => jogar(lastPlay.toolId)} style={ghost}>Reabrir deck</button>
          </section>); })()}
        {error && !play && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{error}</span>}
        <p style={{ margin: 0, color: '#A3A1AD', fontSize: 14 }}>As respostas são fixas por enquanto; o agente de IA entra no M9.</p>
      </div>

      {dialogOpen && (
        <>
          <button type="button" aria-label="Fechar deck de resposta" onClick={close} className="coops-overlay" style={{ position: 'fixed', inset: 0, zIndex: 90, border: 0, padding: 0, background: 'rgba(14,14,18,0.72)', backdropFilter: 'blur(3px)', cursor: 'pointer' }} />
          <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, top: 72, zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pointerEvents: 'none' }}>
            <section role="dialog" aria-modal="true" aria-labelledby="resp-title" style={{ animation: 'coopsSheetIn 560ms cubic-bezier(.22,1,.36,1) both', pointerEvents: 'auto', height: '100%', maxHeight: '100%', overflowY: 'auto', boxSizing: 'border-box', background: '#0E0E12', borderRadius: '32px 32px 0 0', borderTop: `3px solid ${toolColor}`, padding: '12px clamp(16px, 4vw, 40px) 40px', display: 'flex', flexDirection: 'column', gap: 28, boxShadow: '0 -30px 80px rgba(0,0,0,0.6)' }}>
              <div aria-hidden="true" style={{ width: 56, height: 5, borderRadius: 3, background: '#4A4858', margin: '0 auto -6px', flex: '0 0 auto' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
                  <span style={{ ...mono, fontSize: 11, letterSpacing: '0.08em', color: toolColor }}>DECK DE RESPOSTA</span>
                  <h2 id="resp-title" style={{ margin: 0, fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 }}>{playTool?.title ?? 'Deck de resposta'}</h2>
                  <div className="s11-goal" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 4 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#1C1C24', border: '1.5px solid #2C2C36', borderRadius: 999, padding: '6px 14px 6px 6px', fontSize: 14 }}><span style={{ background: toolColor, color: '#0E0E12', borderRadius: 999, padding: '4px 10px', fontWeight: 700, fontSize: 12 }}>Objetivo</span>Escolha quais caminhos vão para a mesa da iniciativa</span>
                    {play && <span style={{ ...mono, fontSize: 11, letterSpacing: '0.06em', color: '#A3A1AD' }}>{reviewed} DE {cards.length} REVISADAS</span>}
                  </div>
                </div>
                <button type="button" aria-label="Fechar deck de resposta" onClick={close} className="coops-x" style={{ flex: '0 0 48px', width: 48, height: 48, borderRadius: 14, background: '#212129', border: '1.5px solid #3A3846', color: '#F5F2EC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
              </div>

              {!play && (
                <div style={{ minHeight: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
                  <div aria-hidden="true" style={{ position: 'relative', width: 260, height: 230 }}>
                    <div style={{ position: 'absolute', left: 70, top: 10, width: 150, height: 200, borderRadius: 20, border: '2px dashed #4A4858', transform: 'rotate(10deg)' }} />
                    <div style={{ position: 'absolute', left: 50, top: 14, width: 150, height: 200, borderRadius: 20, border: '2px dashed #6E6C7A', transform: 'rotate(3deg)' }} />
                    <div style={{ position: 'absolute', left: 30, top: 20, width: 150, height: 200, borderRadius: 20, border: `2px dashed ${toolColor}`, transform: 'rotate(-5deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke={toolColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M32 8c2.4 14 7.6 19.2 21.6 21.6C39.6 32 34.4 37.2 32 51.2 29.6 37.2 24.4 32 10.4 29.6 24.4 27.2 29.6 22 32 8z" /></svg></div>
                  </div>
                  <span role="status" style={{ fontSize: 17 }}>O agente está montando o deck com o contexto da sua mesa…</span>
                </div>
              )}

              {play && (
                <div className="s11-table">
                  {view === 'deck' && (
                    <div className="s11-deck">
                      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '4px 16px 0' }}>
                        <span style={{ ...mono, fontSize: 11, letterSpacing: '0.08em', color: toolColor }}>{cards.length} CARTAS · {reviewed} REVISADAS</span>
                        <h3 style={{ margin: 0, fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.12, maxWidth: 720 }}>Escolha uma carta para abrir</h3>
                      </div>
                      <div className="s11-fanwrap" role="list" aria-label="Cartas do deck">
                        {cards.map((c, i) => { const off = i - (cards.length - 1) / 2; return (
                          <button key={c.id} type="button" role="listitem" onClick={() => { setOpenCard(c.id); setGrid(false); setReview(false); }} className="s11-fan" aria-label={`Abrir carta ${i + 1}: ${c.title}`} style={{ ['--o' as string]: off, ['--a' as string]: Math.abs(off), background: c.decision === 'DISCARDED' ? '#A3A1AD' : '#F5F2EC', opacity: c.decision === 'DISCARDED' ? 0.6 : 1, animationDelay: `${i * 60}ms` } as CSSProperties}>
                            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><span style={{ fontSize: 44, fontWeight: 800, lineHeight: 1 }}>{i + 1}</span>{c.decision && <span style={{ ...mono, fontSize: 9.5, fontWeight: 700, background: c.decision === 'KEPT' ? '#8FE3C8' : '#F5F2EC', border: '1.5px solid #0E0E12', borderRadius: 999, padding: '3px 8px' }}>{c.decision === 'KEPT' ? 'NA MESA' : 'DESCARTADA'}</span>}</span>
                            <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}><span style={{ ...mono, fontSize: 10, fontWeight: 700, color: '#0E0E12', background: TAGBG[c.tag] ?? '#F5F2EC', border: '1.5px solid #0E0E12', borderRadius: 6, padding: '2px 7px' }}>{c.tag}</span></span>
                            <span style={{ marginTop: 'auto', fontSize: 20, fontWeight: 700, lineHeight: 1.15 }}>{c.title}</span>
                            <span className="s11-fanbody" style={{ fontSize: 13, lineHeight: 1.45, color: '#2A2833' }}>{c.description}</span>
                            <span style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #0E0E12', paddingTop: 10, fontSize: 12.5, fontWeight: 600 }}><span>{c.decision ? 'Rever' : 'Abrir'}</span><span aria-hidden="true">↑</span></span>
                          </button>); })}
                      </div>
                    </div>
                  )}

                  {view === 'finding' && current && (
                    <div className="s11-stage">
                      <button type="button" disabled={!canPlay} onClick={() => decide(current, 'DISCARDED')} aria-pressed={current.decision === 'DISCARDED'} className="s11-side s11-side-x" style={{ borderStyle: current.decision === 'DISCARDED' ? 'solid' : undefined }}>
                        <svg className="s11-ico" width="40" height="40" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 20h36l-3 34H17z" /><path d="M10 20h44M26 20v-6h12v6M26 30v16M38 30v16" /></svg>
                        <b>← Descartar</b><span className="s11-sidetx">Sai do deck. Dá para rever depois.</span><span className="s11-key" style={{ fontFamily: "'JetBrains Mono', monospace" }}>←</span>
                      </button>
                      <article id="s11-focus" className="s11-focus" aria-labelledby="s11-ftitle" style={{ background: playTool?.bg ?? '#F5F2EC', boxShadow: `0 0 0 3px #0E0E12, 0 0 0 6px ${toolColor}, 0 30px 70px rgba(0,0,0,0.55)` }}>
                        <header style={{ padding: '22px 26px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ ...mono, fontSize: 10, fontWeight: 700, color: '#0E0E12', background: TAGBG[current.tag] ?? '#F5F2EC', border: '1.5px solid #0E0E12', borderRadius: 6, padding: '2px 7px' }}>{current.tag}</span>
                            <span style={{ ...mono, fontSize: 10.5, letterSpacing: '0.06em' }}>CAMINHO {n} DE {cards.length}</span>
                            <span style={{ flex: 1 }} />
                            {current.decision && <span style={{ ...mono, fontSize: 9.5, fontWeight: 700, background: current.decision === 'KEPT' ? '#8FE3C8' : '#F5F2EC', border: '1.5px solid #0E0E12', borderRadius: 999, padding: '3px 8px' }}>{current.decision === 'KEPT' ? 'NA MESA' : 'DESCARTADA'}</span>}
                            <button type="button" onClick={() => setGrid(true)} className="s11-btn" style={{ fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, color: '#0E0E12', background: 'transparent', border: '1.5px solid #0E0E12', borderRadius: 10, padding: '6px 12px', cursor: 'pointer' }}>Ver todas as cartas</button>
                          </div>
                          <h3 id="s11-ftitle" style={{ margin: 0, fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.08 }}>{current.title}</h3>
                          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, maxWidth: 620 }}>{current.description}</p>
                          <div className="s11-kpis">
                            {kpi(`IMPACTO · ${current.impact.toUpperCase()}`, bars(current.impact))}
                            {kpi(`ESFORÇO · ${current.effort.toUpperCase()}`, bars(current.effort))}
                            {kpi('MÉTRICA AFETADA', <b style={{ fontSize: 15, lineHeight: 1.25 }}>{current.metric}</b>)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', background: '#F5F2EC', border: '2px solid #0E0E12', borderRadius: 14, padding: '12px 14px' }}><span style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: '1 1 240px' }}><span style={{ ...mono, fontSize: 10, color: '#4B36B0' }}>SE FOR PARA A MESA, O PRÓXIMO PASSO É</span><b style={{ fontSize: 16 }}>{current.nextStep}</b></span></div>
                        </header>
                        <div role="tablist" aria-label="Aprofundar" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '0 26px 14px' }}>
                          {([['how', 'Como seguir'], ['notes', 'Suas notas']] as const).map(([k, t]) => <button key={k} type="button" role="tab" aria-selected={facet === k} onClick={() => setFacet(k)} className="s11-facet">{t}</button>)}
                        </div>
                        <div id="s11-fbody" role="tabpanel" style={{ borderTop: '1.5px solid #0E0E12', background: 'rgba(245,242,236,0.45)', padding: '20px 26px 24px', minHeight: 140 }}>
                          {facet === 'how' ? <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65 }}>{current.description} Se for para a mesa: <b>{current.nextStep}</b></p> : (
                            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ ...mono, fontSize: 10 }}>SUAS NOTAS</span>
                              <textarea key={current.id} aria-label="Nota sobre este caminho" maxLength={1000} readOnly={!canPlay} placeholder="Anote o que levar para o squad" defaultValue={current.note} onBlur={(e) => saveNote(current, e.target.value.trim())} style={{ ...cardInput, minHeight: 90, resize: 'vertical' }} /></label>
                          )}
                        </div>
                      </article>
                      <button type="button" disabled={!canPlay} onClick={() => decide(current, 'KEPT')} aria-pressed={current.decision === 'KEPT'} className="s11-side s11-side-k">
                        <svg className="s11-ico" width="40" height="40" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="10" y="30" width="44" height="22" rx="4" /><path d="M32 8v24M22 20l10 12 10-12" /></svg>
                        <b>Para a mesa →</b><span className="s11-sidetx">O squad vai discutir este caminho.</span><span className="s11-key" style={{ fontFamily: "'JetBrains Mono', monospace" }}>→</span>
                      </button>
                    </div>
                  )}

                  {view === 'end' && (
                    <div className="s11-end" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, padding: '12px 0 8px' }}>
                      <span style={{ ...mono, fontSize: 11, letterSpacing: '0.08em', color: toolColor }}>DECK REVISADO · {reviewed} DE {cards.length}</span>
                      <h3 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>{kept.length ? 'Caminhos que foram para a mesa' : 'Nenhum caminho foi para a mesa'}</h3>
                      <p style={{ margin: 0, color: '#A3A1AD', fontSize: 15 }}>{kept.length} {kept.length === 1 ? 'caminho' : 'caminhos'} na mesa · {cards.length - kept.length} {cards.length - kept.length === 1 ? 'descartado' : 'descartados'}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, margin: '14px 0 8px' }}>
                        {kept.map((c) => <div key={c.id} style={{ width: 210, minHeight: 250, boxSizing: 'border-box', borderRadius: 20, border: '2px solid #0E0E12', background: playTool?.bg ?? '#F5F2EC', color: '#0E0E12', padding: 16, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', boxShadow: '0 14px 30px rgba(0,0,0,0.45)' }}><span><span style={{ ...mono, fontSize: 10, fontWeight: 700, background: TAGBG[c.tag] ?? '#F5F2EC', border: '1.5px solid #0E0E12', borderRadius: 6, padding: '2px 7px' }}>{c.tag}</span></span><b style={{ marginTop: 'auto', fontSize: 18, lineHeight: 1.15 }}>{c.title}</b><span style={{ ...mono, fontSize: 10, marginTop: 6 }}>PRÓXIMO PASSO</span><span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>{c.nextStep}</span>{c.note && <span style={{ fontSize: 12, lineHeight: 1.35 }}>“{c.note}”</span>}</div>)}
                      </div>
                      <span style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
                        {canPlay && <button type="button" onClick={again} className="s11-btn" style={{ fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#F5F2EC', background: 'transparent', border: '1.5px solid #4A4858', borderRadius: 12, minHeight: 46, padding: '0 18px', cursor: 'pointer' }}>Revisar de novo</button>}
                        <CoopsLink href={`/p/${projectId}/iniciativas/${initiative.id}/mesa`} className="s11-btn" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 46, color: '#0E0E12', background: '#F5F2EC', textDecoration: 'none', fontWeight: 600, fontSize: 14, borderRadius: 12, padding: '0 18px' }}>Ver na mesa da iniciativa →</CoopsLink>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {play && (
                <div className="s11-dock" aria-label="Cartas do deck">
                  <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ ...mono, fontSize: 10, color: '#A3A1AD' }}>DESCARTADAS</span><b style={{ fontSize: 22 }}>{cards.filter((c) => c.decision === 'DISCARDED').length}</b></div>
                  <div role="tablist" aria-label="Cartas do deck" className="s11-minis">
                    {cards.map((c, i) => <button key={c.id} type="button" role="tab" aria-selected={current?.id === c.id && view === 'finding'} onClick={() => { setGrid(false); setReview(false); setOpenCard(c.id); }} title={c.title} aria-label={`Caminho ${i + 1}: ${c.decision === 'KEPT' ? 'na mesa' : c.decision === 'DISCARDED' ? 'descartado' : 'pendente'}`} className="s11-mini" style={{ background: c.decision === 'DISCARDED' ? '#A3A1AD' : c.decision === 'KEPT' ? '#8FE3C8' : '#F5F2EC', opacity: c.decision === 'DISCARDED' ? 0.6 : 1 }}>{i + 1}</button>)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ ...mono, fontSize: 10, color: '#A3A1AD' }}>NA MESA</span><b style={{ fontSize: 22 }}>{kept.length}</b></div>
                </div>
              )}
              <button type="button" onClick={close} style={{ ...ghost, alignSelf: 'flex-start' }}>Fechar e continuar depois</button>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
