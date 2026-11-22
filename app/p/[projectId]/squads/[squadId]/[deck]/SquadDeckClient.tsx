'use client';
import { useEffect, useRef, useState } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import { BackLink } from '@/components/nav/BackLink';
import { CoopsLink } from '@/components/nav/useCoopsRouter';
import { ICP } from '@/components/squad/deckIcons';
import { FocusCard } from '@/components/ds/FocusCard';
import { Avatar, type AvatarConfig } from '@/components/avatar/Avatar';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { DiFlag, DiRocket, DiStar } from '@/components/person/DeckIcons';
import { SquadCardDeck, formOf, type CardDraft } from '@/components/squad/SquadCardDeck';
import { DECK_META, type Action, type SquadCardView, type SquadDeckId, type SquadPerson } from '@/components/squad/types';
import { useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { label } from '@/components/ds/tokens';
import { MONTHS } from '@/lib/format';

const ICON: Record<SquadDeckId, () => React.ReactElement> = { DESAFIO: DiRocket, FRENTE: DiFlag, ESTRATEGIA: DiStar, INDICADOR: DiStar, ALAVANCA: DiRocket };
const TREND = { sobe: '▲ SOBE', desce: '▼ DESCE', estavel: '● ESTÁVEL' } as const;
type Filter = 'ABERTA' | 'ENCERRADA';

export function SquadDeckClient({ user, projectId, squad, deck, isManager, cards: initial, people, challenges, draft: d0, deckCounts }: { deckCounts: Record<string, number>;
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; projectId: string; squad: { id: string; name: string }; deck: SquadDeckId; isManager: boolean;
  cards: SquadCardView[]; people: SquadPerson[]; challenges: { id: string; title: string }[]; draft: CardDraft | null;
}) {
  const meta = DECK_META[deck]; const Icon = ICON[deck];
  const fem = meta.one === 'frente' || meta.one === 'alavanca';
  const { refresh } = useCoopsRouter();
  const [cards, setCards] = useState(initial);
  const latest = useRef(initial);
  useEffect(() => { setCards(initial); latest.current = initial; }, [initial]);
  const [filter, setFilter] = useState<Filter>('ABERTA');
  const [focus, setFocus] = useState<{ id: string; rect: DOMRect | null } | null>(null);
  const [edit, setEdit] = useState<{ card: SquadCardView | null } | null>(null);
  const [draft, setDraft] = useState(d0);
  const [warn, setWarn] = useState<string | null>(null);
  const lastEl = useRef<HTMLElement | null>(null);
  const LS = `coops.filter.squad.${deck}`;
  useEffect(() => { try { const v = localStorage.getItem(LS) as Filter | null; if (v === 'ABERTA' || v === 'ENCERRADA') setFilter(v); } catch {} }, [LS]);
  const pick = (f: Filter) => { setFilter(f); try { localStorage.setItem(LS, f); } catch {} };
  const open = cards.filter((c) => c.status === 'ABERTA'), closed = cards.filter((c) => c.status === 'ENCERRADA');
  const shown = filter === 'ABERTA' ? open : closed;
  const cur = focus ? cards.find((c) => c.id === focus.id) : null;
  const personOf = (id: string | null) => people.find((p) => p.id === id) ?? null;
  const done = () => { setEdit(null); refresh(); };

  const call = async (c: SquadCardView, body: unknown, optimistic: (x: SquadCardView) => SquadCardView) => {
    const prev = latest.current; latest.current = prev.map((x) => (x.id === c.id ? optimistic(x) : x)); setCards(latest.current); setWarn(null);
    try { const r = await fetch(`/api/squads/${squad.id}/cards/${c.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); if (!r.ok) throw new Error(); refresh(); }
    catch { latest.current = prev; setCards(prev); setWarn('Não deu para salvar a mudança.'); }
  };
  const setStatus = (c: SquadCardView, status: 'ABERTA' | 'ENCERRADA') => call(c, { status }, (x) => ({ ...x, status, closedAt: status === 'ENCERRADA' ? new Date().toISOString() : null }));
  const toggleAction = (c: SquadCardView, i: number) => {
    const acoes: Action[] = (latest.current.find((x) => x.id === c.id)?.data.acoes ?? c.data.acoes).map((a: Action, j: number) => (j === i ? { ...a, done: !a.done } : a));
    return call(c, { ...formOf(c), deck, title: c.title, acoes }, (x) => ({ ...x, data: { ...x.data, acoes } }));
  };
  const remove = async (c: SquadCardView) => { if (!window.confirm(`Remover ${meta.one === 'frente' ? 'esta' : 'este'} ${meta.one}?`)) return; await fetch(`/api/squads/${squad.id}/cards/${c.id}`, { method: 'DELETE' }); setFocus(null); refresh(); };
  const doneOf = (c: SquadCardView) => { const a: Action[] = c.data.acoes ?? []; return [a.filter((x) => x.done).length, a.length]; };

  const face = (c: SquadCardView) => {
    const [d, n] = doneOf(c), champ = personOf(c.championPersonId);
    const big = c.deck === 'DESAFIO' ? `${d}/${n}` : c.deck === 'FRENTE' ? `${c.level ?? 1}/5` : c.deck === 'INDICADOR' ? (c.data.progresso ? `${c.data.progresso}%` : c.data.valor || '—') : String(cards.indexOf(c) + 1).padStart(2, '0');
    const bigLabel = c.deck === 'DESAFIO' ? 'AÇÕES' : c.deck === 'FRENTE' ? 'PROGRESSO' : c.deck === 'INDICADOR' ? (c.data.progresso ? 'DA META' : TREND[(c.data.variacao as keyof typeof TREND) ?? 'estavel']) : c.deck === 'ALAVANCA' ? (ALV[c.data.status as string] ?? 'COMEÇANDO').toUpperCase() : '';
    const foot = c.deck === 'DESAFIO' ? c.data.cenario : c.deck === 'FRENTE' ? c.data.oque : c.deck === 'ESTRATEGIA' ? c.data.texto : c.deck === 'INDICADOR' ? (challenges.find((x) => x.id === c.data.challengeId)?.title ? `Ligado a ${challenges.find((x) => x.id === c.data.challengeId)?.title}` : 'Sem desafio ligado') : c.data.descricao;
    return { big, bigLabel, foot: foot || 'Sem descrição', champ };
  };

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <BackLink href={`/p/${projectId}/squads/${squad.id}`} label={squad.name} />
        <section className="coops-icdemo coops-dkban" aria-labelledby="dk-title" style={{ position: 'relative', borderRadius: 28, border: '2px solid #0E0E12', background: meta.color, color: '#0E0E12', padding: '26px 30px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px 28px', overflow: 'hidden', boxShadow: '0 18px 40px rgba(0,0,0,0.45)' }}>
          <span aria-hidden="true" className="coops-dkban-ring" style={{ position: 'absolute', right: -70, bottom: -110, width: 320, height: 320, borderRadius: '50%', border: '2px solid rgba(14,14,18,0.18)', boxShadow: '0 0 0 44px rgba(14,14,18,0.04)', pointerEvents: 'none' }} />
          <div aria-hidden="true" className="coops-dkban-ic" style={{ position: 'relative', flex: 'none', width: 116, height: 116, boxSizing: 'border-box', borderRadius: 24, border: '2px solid #0E0E12', background: 'rgba(245,242,236,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="84" height="84" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>{(ICP[meta.slug] ?? []).map(([c, d], i) => <path key={i} className={c || undefined} d={d} />)}</svg>
          </div>
          <div style={{ position: 'relative', flex: '1 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h1 id="dk-title" style={{ margin: 0, fontSize: 'clamp(34px, 6vw, 52px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1 }}>{meta.title}</h1>
            <p style={{ margin: '0 0 8px', fontSize: 17, lineHeight: 1.4 }}>{meta.desc}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[[open.length, open.length === 1 ? 'ativa' : 'ativas'], [closed.length, closed.length === 1 ? 'encerrada' : 'encerradas']].map(([n, t]) => <span key={String(t)} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, border: '1.5px solid #0E0E12', borderRadius: 999, padding: '6px 12px', fontSize: 13, fontWeight: 600, background: 'rgba(245,242,236,0.55)' }}><span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{n}</span>{t}</span>)}
            </div>
          </div>
          <div style={{ position: 'relative', flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
            <CoopsLink href={`/p/${projectId}/squads/${squad.id}`} aria-label={`Voltar para a mesa do ${squad.name}`} className="coops-mban-me" style={{ flex: 'none', width: 112, height: 84, boxSizing: 'border-box', borderRadius: 18, background: '#B7A6FF', border: '2px solid #0E0E12', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', textDecoration: 'none' }}>
              <div aria-hidden="true" style={{ position: 'relative', width: 80, height: 78, flex: 'none' }}>
                <span style={{ position: 'absolute', left: 10, top: 17, width: 60, height: 60, boxSizing: 'border-box', borderRadius: '50%', background: '#8B74F2', border: '1.5px solid #0E0E12' }} />
                <span style={{ position: 'absolute', left: 10, top: 14, width: 60, height: 60, boxSizing: 'border-box', borderRadius: '50%', background: '#F5F2EC', border: '1.5px solid #0E0E12' }} />
                {people.slice(0, 3).map((p, i) => { const pos = [{ left: 2, top: 16, size: 20 }, { left: 28, top: 0, size: 23 }, { left: 58, top: 16, size: 20 }][people.length >= 3 ? i : i === 0 ? 1 : 2]; return <div key={p.id} style={{ position: 'absolute', left: pos.left, top: pos.top, zIndex: 2, lineHeight: 0, borderRadius: '50%', border: '1.5px solid #0E0E12', boxShadow: '0 2px 0 #4B36B0' }}><Avatar {...DEFAULT_AVATAR_CFG} {...(p.avatar ?? {})} size={pos.size} label="" /></div>; })}
              </div>
            </CoopsLink>
            {isManager
              ? <button type="button" className="coops-dkban-add" onClick={() => setEdit({ card: null })} style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 15, color: '#F5F2EC', background: '#0E0E12', border: '2px solid #0E0E12', borderRadius: 14, minHeight: 48, padding: '0 20px', cursor: 'pointer' }}>{meta.addLabel}</button>
              : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 48, padding: '0 14px', borderRadius: 12, border: '1.5px solid #0E0E12', background: 'rgba(245,242,236,0.55)', fontSize: 13 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>Só o manager cadastra {meta.one}s</span>}
          </div>
        </section>
        <div role="tablist" aria-label="Decks do squad" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {([...(Object.keys(DECK_META) as (keyof typeof DECK_META)[]).map((k) => ({ k: k as string, slug: DECK_META[k].slug, label: DECK_META[k].title, color: DECK_META[k].color, n: deckCounts[k] ?? 0 })), { k: 'SAUDE', slug: 'saude', label: 'Saúde do time', color: '#A9D8F5', n: null as number | null }]).map((t) => { const on = t.slug === meta.slug; return (
            <CoopsLink key={t.k} href={`/p/${projectId}/squads/${squad.id}/${t.slug}`} role="tab" aria-selected={on} className="coops-dktab" style={{ fontFamily: 'inherit', fontWeight: on ? 600 : 400, fontSize: 14, color: on ? '#0E0E12' : '#F5F2EC', background: on ? '#F5F2EC' : 'transparent', border: `1px solid ${on ? '#F5F2EC' : '#3A3846'}`, borderRadius: 999, minHeight: 44, padding: '0 14px 0 10px', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}><span aria-hidden="true" style={{ width: 14, height: 14, boxSizing: 'border-box', borderRadius: 4, border: '1.5px solid #0E0E12', background: t.color }} />{t.label}{t.n !== null && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: on ? '#0E0E12' : '#A3A1AD' }}>{t.n}</span>}</CoopsLink>); })}
        </div>
        {!isManager && <p style={{ margin: 0, color: '#A3A1AD', fontSize: 14 }}>Você está vendo como time. Só o manager edita este deck.</p>}
        {warn && <div role="alert" style={{ borderRadius: 14, border: '1.5px solid #FF8A5B', padding: '10px 14px', fontSize: 14 }}>{warn}</div>}
        <div role="tablist" aria-label="Filtrar cartas" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {([['ABERTA', 'Ativas', open.length], ['ENCERRADA', 'Encerradas', closed.length]] as const).map(([f, t, n]) => { const on = filter === f; return <button key={f} type="button" role="tab" aria-selected={on} onClick={() => pick(f)} style={{ fontFamily: 'inherit', fontWeight: on ? 600 : 400, fontSize: 14, color: on ? '#0E0E12' : '#F5F2EC', background: on ? '#F5F2EC' : 'transparent', border: on ? 0 : '1px solid #4A4858', borderRadius: 999, minHeight: 44, padding: '0 16px', cursor: 'pointer' }}>{t} · {n}</button>; })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {shown.map((c) => { const f = face(c); const closedCard = c.status === 'ENCERRADA'; return (
            <button key={c.id} type="button" className="coops-card" aria-label={`Abrir ${c.title}`} onClick={(e) => { lastEl.current = e.currentTarget; setFocus({ id: c.id, rect: e.currentTarget.getBoundingClientRect() }); }}
              style={{ fontFamily: 'inherit', textAlign: 'left', height: 340, boxSizing: 'border-box', borderRadius: 22, background: closedCard ? '#A3A1AD' : meta.color, color: '#0E0E12', border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', boxShadow: '0 16px 36px rgba(0,0,0,0.45)' }}>
              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                {f.champ ? <span style={{ lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12', background: '#F5F2EC' }}><Avatar {...DEFAULT_AVATAR_CFG} {...(f.champ.avatar ?? {})} crown size={52} label={`Champion ${f.champ.name}`} /></span> : <Icon />}
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' }}>{f.big}</span><span style={label(11, '0')}>{f.bigLabel}</span></span>
              </span>
              <span style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                {closedCard && <span style={{ ...label(10, '0.06em'), border: '1.5px dashed #0E0E12', borderRadius: 999, padding: '2px 8px' }}>DESCONTINUADA EM {MONTHS[new Date(c.closedAt ?? Date.now()).getMonth()]}</span>}
                <span style={label(11, '0.08em')}>{meta.kicker}{c.deck === 'FRENTE' && f.champ ? ` · CHAMPION ${f.champ.name.split(' ')[0].toUpperCase()}` : ''}</span>
              </span>
              <span style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.title}</span>
              <span style={{ width: '100%', boxSizing: 'border-box', fontSize: 13, lineHeight: 1.4, borderTop: '1.5px solid #0E0E12', paddingTop: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{f.foot}</span>
            </button>); })}
          {isManager && filter === 'ABERTA' && <button type="button" onClick={() => setEdit({ card: null })} className="tw-add" style={{ fontFamily: 'inherit', height: 340, boxSizing: 'border-box', borderRadius: 22, background: 'transparent', border: '1.5px dashed #4A4858', color: '#F5F2EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', padding: 20 }}>
            <span style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #4A4858', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></span>
            <span style={{ fontSize: 17, fontWeight: 600 }}>{open.length ? `${fem ? 'Nova' : 'Novo'} ${meta.one}` : `Criar ${fem ? 'a primeira' : 'o primeiro'} ${meta.one}`}</span>
          </button>}
        </div>
        {shown.length === 0 && (!isManager || filter === 'ENCERRADA') && <p style={{ margin: 0, color: '#A3A1AD' }}>{filter === 'ENCERRADA' ? 'Nenhuma carta encerrada.' : meta.empty + '.'}</p>}
      </div>

      {cur && focus && (
        <FocusCard origin={focus.rect} bg={cur.status === 'ENCERRADA' ? '#A3A1AD' : meta.color} ariaLabel={cur.title} onClose={() => { setFocus(null); lastEl.current?.focus?.(); }}>
          <span style={label(11, '0.08em')}>{meta.title.toUpperCase()}{cur.status === 'ENCERRADA' ? ' · ENCERRADA' : ''}</span>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{cur.title}</h2>
          {cur.deck === 'DESAFIO' && <Block k="CENÁRIO ATUAL" v={cur.data.cenario} />}
          {cur.deck === 'FRENTE' && <>{personOf(cur.championPersonId) ? <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12' }}><Avatar {...DEFAULT_AVATAR_CFG} {...(personOf(cur.championPersonId)!.avatar ?? {})} crown size={44} label="" /></span><span><span style={label(10)}>CHAMPION DA FRENTE</span><br /><b>{personOf(cur.championPersonId)!.name}</b></span></div> : <span style={{ fontSize: 14 }}>Sem champion por agora</span>}<Block k="O QUE ELA FAZ" v={cur.data.oque} /><Block k="IMPACTO DESEJADO" v={cur.data.impacto} /></>}
          {cur.deck === 'ESTRATEGIA' && <><Block k="DECLARAÇÃO DA ESTRATÉGIA" v={cur.data.texto} /><Block k="COMO O TIME SE PARECE AGORA" v={cur.data.agora} /><Block k="COMO VAI SE PARECER NO FUTURO" v={cur.data.futuro} />{[cur.data.h1, cur.data.h2, cur.data.h3].some(Boolean) && <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={label(10)}>HORIZONTES · O QUE FAREMOS EM CADA ETAPA</span>{[cur.data.h1, cur.data.h2, cur.data.h3].map((h, i) => h ? <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline', fontSize: 14 }}><span style={{ ...label(10), border: '1.5px solid #0E0E12', borderRadius: 999, padding: '2px 8px' }}>H{i + 1}</span>{h}</div> : null)}</div>}</>}
          {cur.deck === 'INDICADOR' && <><Block k="POR QUE ESCOLHEMOS ESSE INDICADOR" v={cur.data.porque} /><div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>{cur.data.meta && <Block k="META" v={cur.data.meta} />}{cur.data.valor && <Block k={`ATUAL · ${TREND[(cur.data.variacao as keyof typeof TREND) ?? 'estavel']}`} v={cur.data.valor} />}</div><div><span style={label(10)}>PROGRESSO DA META · {cur.data.progresso ?? 0}%</span><div aria-hidden="true" style={{ height: 12, borderRadius: 6, border: '1.5px solid #0E0E12', marginTop: 6, overflow: 'hidden' }}><div style={{ width: `${cur.data.progresso ?? 0}%`, height: '100%', background: '#0E0E12' }} /></div></div></>}
          {cur.deck === 'ALAVANCA' && <><Block k="OBJETIVO" v={cur.data.objetivo} /><Block k="COMO ELA FUNCIONA" v={cur.data.descricao} /><Block k="STATUS" v={ALV[cur.data.status as string] ?? 'Começando'} /><Block k="RESULTADOS ATÉ AQUI" v={cur.data.resultados} /></>}
          {(cur.deck === 'DESAFIO' || cur.deck === 'FRENTE') && <div><span style={label(10)}>{cur.deck === 'DESAFIO' ? 'NÍVEL DE COMPLEXIDADE' : 'NÍVEL DE PROGRESSO'} · {cur.level ?? 1} DE 5</span><div aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5, marginTop: 6 }}>{[1, 2, 3, 4, 5].map((n) => <span key={n} style={{ height: 14, borderRadius: 4, border: '1.5px solid #0E0E12', background: n <= (cur.level ?? 1) ? '#0E0E12' : 'transparent' }} />)}</div></div>}
          {(cur.data.evidencias?.length ?? 0) > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={label(10)}>EVIDÊNCIAS · {cur.data.evidencias.length}</span>{cur.data.evidencias.map((e: any, i: number) => <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 14 }}><span style={{ ...label(10), border: '1.5px solid #0E0E12', borderRadius: 999, padding: '2px 8px' }}>{String(e.tipo).toUpperCase()}</span>{e.texto}</div>)}</div>}
          {cur.deck === 'DESAFIO' && cur.data.abordagem && <Block k="COMO VAMOS ATACAR" v={cur.data.abordagem} />}
          {(cur.data.acoes?.length ?? 0) > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={label(10)}>LISTA DE AÇÕES · {doneOf(cur)[0]} DE {doneOf(cur)[1]}</span>
            {cur.data.acoes.map((a: Action, i: number) => <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, cursor: isManager ? 'pointer' : 'default', fontSize: 14 }}><input type="checkbox" checked={a.done} disabled={!isManager} onChange={() => toggleAction(cur, i)} style={{ width: 20, height: 20, accentColor: '#0E0E12' }} /><span style={{ flex: 1, textDecoration: a.done ? 'line-through' : 'none' }}>{a.texto}<br /><span style={{ fontSize: 12 }}>{[a.dono, a.prazo].filter(Boolean).join(' · ')}</span></span></label>)}</div>}
          {isManager ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, borderTop: '1.5px solid #0E0E12', paddingTop: 12 }}>
            <Btn onClick={() => { const c = cur; setFocus(null); setEdit({ card: c }); }}>Editar {meta.one}</Btn>
            {cur.status === 'ABERTA' ? <Btn onClick={() => setStatus(cur, 'ENCERRADA')}>Encerrar</Btn> : <Btn onClick={() => setStatus(cur, 'ABERTA')}>Reabrir</Btn>}
            <Btn onClick={() => remove(cur)}>Remover</Btn>
          </div> : <span style={{ fontSize: 13 }}>Você está vendo como time. Só o manager edita.</span>}
        </FocusCard>
      )}
      {edit && <SquadCardDeck key={edit.card?.id ?? 'new'} squadId={squad.id} deck={deck} editing={edit.card} people={people} challenges={challenges} draft={draft} onDraftChange={setDraft} onClose={() => setEdit(null)} onSaved={done} />}
    </div>
  );
}
const ALV: Record<string, string> = { COMECANDO: 'Começando', EM_TESTE: 'Em teste', EM_USO: 'Em uso', CONCLUIDA: 'Concluída' };
const Block = ({ k, v }: { k: string; v: string }) => v ? <div style={{ borderRadius: 14, background: 'rgba(245,242,236,0.6)', border: '1.5px solid #0E0E12', padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}><span style={label(10)}>{k}</span><span style={{ fontSize: 15, lineHeight: 1.45 }}>{v}</span></div> : null;
const Btn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => <button type="button" onClick={onClick} style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#0E0E12', background: 'transparent', border: '1.5px solid #0E0E12', borderRadius: 12, minHeight: 44, padding: '0 16px', cursor: 'pointer' }}>{children}</button>;
