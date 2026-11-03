'use client';
import { useEffect, useRef, useState } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import { OpenDeckBanner } from '@/components/ds/OpenDeckBanner';
import { FocusCard } from '@/components/ds/FocusCard';
import { BottomSheet } from '@/components/sheet/BottomSheet';
import { Spinner } from '@/components/ds/ScreenLoader';
import { CoopsLink, useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { DiPeople } from '@/components/person/DeckIcons';
import { EventDeck, type EventDraft, type EventKind } from '@/components/person/EventDeck';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { label } from '@/components/ds/tokens';
import { EVENT_TYPE_LABEL } from '@/lib/validation';
import { MONTHS, MONTHS_LONG, firstName } from '@/lib/format';
import type { AvatarConfig } from '@/components/avatar/Avatar';

type Type = EventKind | 'ENTREGA';
export type EventView = { id: string; type: Type; title: string; date: string; data: Record<string, any>; archived: boolean; mine: boolean; comments: { id: string; authorName: string; text: string; createdAt: string }[] };
const COLOR: Record<Type, string> = { CHECKIN: '#B7A6FF', FEEDBACK: '#F5F2EC', ENTREGA: '#8FE3C8', PROMOCAO: '#E8C46A', MERITO: '#F5A9D6', MUDANCA_TIME: '#8FE3C8' };
const HINT: Record<EventKind, string> = { CHECKIN: 'Conversa 1:1 com resumo, pedidos e combinados.', FEEDBACK: 'O que alguém disse sobre o trabalho, com anexos.', PROMOCAO: 'Mudança de cargo ou de nível.', MERITO: 'Reconhecimento por algo que fez diferença.', MUDANCA_TIME: 'Saída de um squad e chegada em outro.' };
const longDate = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${d} de ${MONTHS_LONG[m - 1]} de ${y}`; };
const LS = 'coops.filter.eventos';

export function EventosClient({ user, person, projectId, isOwn, isManager, events, drafts }: {
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; person: { id: string; name: string; avatar: AvatarConfig | null }; projectId: string; isOwn: boolean; isManager: boolean; events: EventView[]; drafts: Record<string, EventDraft | null>;
}) {
  const { refresh } = useCoopsRouter();
  const [filter, setFilter] = useState<string>('todos');
  const [sheet, setSheet] = useState<{ k: 'pick' } | { k: 'new'; kind: EventKind } | null>(null);
  const [focus, setFocus] = useState<{ id: string; rect: DOMRect | null } | null>(null);
  const [dr, setDr] = useState(drafts);
  const [com, setCom] = useState(''); const [comBusy, setComBusy] = useState(false); const [comErr, setComErr] = useState('');
  const [local, setLocal] = useState<Record<string, EventView['comments']>>({});
  const lastEl = useRef<HTMLElement | null>(null);
  const fn = firstName(person.name);
  useEffect(() => { try { const v = localStorage.getItem(LS); if (v) setFilter(v); } catch {} }, []);
  const pick = (f: string) => { setFilter(f); try { localStorage.setItem(LS, f); } catch {} };
  const active = events.filter((e) => !e.archived), archived = events.filter((e) => e.archived);
  const base = filter === 'arquivados' ? archived : filter === 'todos' ? active : active.filter((e) => e.type === filter);
  const types: [string, string, number][] = [['todos', 'Todos', active.length], ...(['CHECKIN', 'FEEDBACK', 'ENTREGA', 'PROMOCAO', 'MERITO', 'MUDANCA_TIME'] as Type[]).map((t) => [t, EVENT_TYPE_LABEL[t], active.filter((e) => e.type === t).length] as [string, string, number])];
  if (archived.length) types.push(['arquivados', 'Arquivados', archived.length]);
  const cur = focus ? events.find((e) => e.id === focus.id) : null;
  const canNew = isManager || isOwn;
  const open = () => (isManager ? setSheet({ k: 'pick' }) : setSheet({ k: 'new', kind: 'FEEDBACK' }));

  const archive = async (e: EventView, archivedFlag: boolean) => { await fetch(`/api/people/${person.id}/events/${e.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ archived: archivedFlag }) }); setFocus(null); refresh(); };
  const publish = async (e: EventView) => {
    if (!com.trim()) { setComErr('Escreva o comentário para publicar.'); return; }
    setComBusy(true); setComErr('');
    try { const r = await fetch(`/api/people/${person.id}/events/${e.id}/comments`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: com.trim() }) }); const d = await r.json(); if (!r.ok) { setComErr(d.error ?? 'Não deu para publicar.'); return; } setLocal((l) => ({ ...l, [e.id]: [...(l[e.id] ?? []), d.comment] })); setCom(''); }
    catch { setComErr('Sem conexão. Tente de novo.'); } finally { setComBusy(false); }
  };
  const list = (title: string, items?: string[]) => items && items.length > 0 ? <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={label(10)}>{title} · {items.length}</span>{items.map((t, i) => <span key={i} style={{ fontSize: 14 }}>{i + 1}. {t}</span>)}</div> : null;

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <OpenDeckBanner bg="#B7A6FF" icon={<DiPeople />} avatar={{ ...DEFAULT_AVATAR_CFG, ...(person.avatar ?? {}) }} back={{ href: `/p/${projectId}/pessoas/${person.id}`, label: `← ${isOwn ? 'Meu perfil' : person.name}` }}
          title="Eventos" desc={isOwn ? 'Check-ins, feedbacks, entregas, promoções e méritos do seu caminho.' : `O caminho de ${fn}: check-ins, feedbacks, entregas, promoções e méritos.`} cta={canNew ? { label: '+ Evento', onClick: open } : null} />
        <div role="tablist" aria-label="Filtrar eventos" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {types.map(([f, t, n]) => { const on = filter === f; return <button key={f} type="button" role="tab" aria-selected={on} onClick={() => pick(f)} style={{ fontFamily: 'inherit', fontWeight: on ? 600 : 400, fontSize: 14, color: on ? '#0E0E12' : '#F5F2EC', background: on ? '#F5F2EC' : 'transparent', border: on ? 0 : '1px solid #4A4858', borderRadius: 999, minHeight: 44, padding: '0 16px', cursor: 'pointer' }}>{t} · {n}</button>; })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {base.map((e) => (
            <button key={e.id} type="button" className="coops-card" aria-label={`Abrir o evento ${e.title}`} onClick={(ev) => { lastEl.current = ev.currentTarget; setCom(''); setComErr(''); setFocus({ id: e.id, rect: ev.currentTarget.getBoundingClientRect() }); }}
              style={{ fontFamily: 'inherit', textAlign: 'left', height: 340, boxSizing: 'border-box', borderRadius: 22, background: e.archived ? '#A3A1AD' : COLOR[e.type], color: '#0E0E12', border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', boxShadow: '0 16px 36px rgba(0,0,0,0.45)' }}>
              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}><DiPeople /><span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}>{e.date.slice(8, 10)}</span><span style={label(11, '0')}>{MONTHS[Number(e.date.slice(5, 7)) - 1]}</span></span></span>
              <span style={{ marginTop: 'auto', ...label(11, '0.08em') }}>EVENTOS · {EVENT_TYPE_LABEL[e.type].toUpperCase()}{e.archived ? ' · ARQUIVADO' : ''}</span>
              <span style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.title}</span>
              <span style={{ width: '100%', boxSizing: 'border-box', fontSize: 13, borderTop: '1.5px solid #0E0E12', paddingTop: 10 }}>{e.type === 'FEEDBACK' ? (e.data.autor || 'Sem autor') : e.type === 'ENTREGA' ? 'Registrada em Entregas' : `${(e.comments.length + (local[e.id]?.length ?? 0))} comentário(s)`}</span>
            </button>
          ))}
          {canNew && filter !== 'arquivados' && <button type="button" onClick={open} className="tw-add" style={{ fontFamily: 'inherit', height: 340, boxSizing: 'border-box', borderRadius: 22, background: 'transparent', border: '1.5px dashed #4A4858', color: '#F5F2EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', padding: 20 }}>
            <span style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #4A4858', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></span>
            <span style={{ fontSize: 17, fontWeight: 600 }}>{events.length ? 'Novo evento' : 'Registrar o primeiro evento'}</span><span style={{ fontSize: 13, color: '#A3A1AD', textAlign: 'center' }}>{isManager ? 'Check-in, feedback, promoção, mérito ou mudança' : 'Registre um feedback que recebeu'}</span>
          </button>}
        </div>
        {base.length === 0 && !canNew && <p style={{ margin: 0, color: '#A3A1AD' }}>Nenhum evento registrado ainda.</p>}
      </div>

      {sheet?.k === 'pick' && (
        <BottomSheet tag="DECK DE EVENTOS · NOVO EVENTO" title="Que tipo de evento você quer registrar?" onClose={() => setSheet(null)}>
          <p style={{ margin: 0, fontSize: 14, color: '#A3A1AD' }}>Escolha uma carta. Depois vêm as perguntas, uma por carta.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {(['CHECKIN', 'FEEDBACK', 'PROMOCAO', 'MERITO', 'MUDANCA_TIME'] as EventKind[]).map((k) => <button key={k} type="button" onClick={() => setSheet({ k: 'new', kind: k })} className="coops-card" style={{ fontFamily: 'inherit', textAlign: 'left', minHeight: 140, borderRadius: 18, background: COLOR[k], color: '#0E0E12', border: '2px solid #0E0E12', padding: 16, display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer' }}><span style={{ fontSize: 20, fontWeight: 700 }}>{EVENT_TYPE_LABEL[k]}</span><span style={{ fontSize: 13, lineHeight: 1.4 }}>{HINT[k]}</span></button>)}
          </div>
        </BottomSheet>
      )}
      {sheet?.k === 'new' && <EventDeck key={sheet.kind} personId={person.id} personName={isOwn ? 'você' : fn} kind={sheet.kind} draft={dr[sheet.kind]} onDraftChange={(d) => setDr((x) => ({ ...x, [sheet.kind]: d }))} onChangeType={() => (isManager ? setSheet({ k: 'pick' }) : setSheet(null))} onClose={() => setSheet(null)} onSaved={() => { setSheet(null); refresh(); }} />}

      {cur && focus && (
        <FocusCard origin={focus.rect} bg={cur.archived ? '#A3A1AD' : COLOR[cur.type]} ariaLabel={cur.title} onClose={() => { setFocus(null); lastEl.current?.focus?.(); }}>
          <span style={label(11, '0.08em')}>DECK DE EVENTOS › {EVENT_TYPE_LABEL[cur.type].toUpperCase()} · {cur.date.slice(8, 10)} {MONTHS[Number(cur.date.slice(5, 7)) - 1]}</span>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{cur.title}</h2>
          <span style={{ fontSize: 13 }}>{longDate(cur.date)}</span>
          {cur.data.body && <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{cur.type === 'CHECKIN' ? <><b style={label(10)}>RESUMO DA CONVERSA</b><br /></> : null}{cur.data.body}</p>}
          {(cur.type === 'PROMOCAO' || cur.type === 'MUDANCA_TIME') && (cur.data.de || cur.data.para) && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 14 }}><span><b style={label(10)}>DE </b>{cur.data.de || '—'}</span><span><b style={label(10)}>PARA </b>{cur.data.para || '—'}</span></div>}
          {cur.data.msg && <blockquote style={{ margin: 0, borderLeft: '3px solid #0E0E12', paddingLeft: 12, fontSize: 15, lineHeight: 1.5 }}>{cur.data.msg}</blockquote>}
          {cur.type === 'FEEDBACK' && <><span style={{ fontSize: 14 }}><b style={label(10)}>AUTOR DO FEEDBACK </b>{cur.data.autor || 'Sem autor'}</span>{(cur.data.anexos?.length ?? 0) > 0 ? <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={label(10)}>ANEXOS · {cur.data.anexos.length}</span>{cur.data.anexos.map((a: string) => /^https?:\/\//i.test(a) || /\./.test(a) ? <a key={a} href={/^https?:\/\//i.test(a) ? a : `https://${a}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0E0E12', fontWeight: 600, fontSize: 14, minHeight: 44, display: 'inline-flex', alignItems: 'center', wordBreak: 'break-all' }}>{a} ↗</a> : <span key={a} style={{ fontSize: 14 }}>{a}</span>)}</div> : <span style={{ fontSize: 13 }}>Nenhum anexo neste feedback.</span>}</>}
          {cur.type === 'CHECKIN' && <>{list('PEDIDOS', cur.data.pedidos)}{list('NO RADAR', cur.data.radar)}{list('COMBINADOS', cur.data.combinados)}{list('PARA O PRÓXIMO ENCONTRO', cur.data.proximo)}</>}
          {cur.type === 'ENTREGA' ? <CoopsLink href={`/p/${projectId}/pessoas/${person.id}/entregas`} style={{ color: '#0E0E12', fontWeight: 600, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Ver no deck de Entregas →</CoopsLink> : (
            <div style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={label(10)}>COMENTÁRIOS · {cur.comments.length + (local[cur.id]?.length ?? 0)}</span>
              {cur.comments.length + (local[cur.id]?.length ?? 0) === 0 && <span style={{ fontSize: 14 }}>Nenhum comentário ainda. Seja a primeira pessoa a comentar.</span>}
              {[...cur.comments, ...(local[cur.id] ?? [])].map((c) => <div key={c.id} style={{ borderRadius: 12, background: 'rgba(245,242,236,0.6)', border: '1.5px solid #0E0E12', padding: '8px 12px' }}><span style={{ fontSize: 12 }}><b>{c.authorName}</b> · {longDate(c.createdAt.slice(0, 10))}</span><br /><span style={{ fontSize: 14 }}>{c.text}</span></div>)}
              <textarea aria-label="Adicionar comentário" value={com} onChange={(e) => { setCom(e.target.value); setComErr(''); }} placeholder="Adicionar comentário" style={{ fontFamily: 'inherit', fontSize: 15, borderRadius: 10, border: '1.5px solid rgba(14,14,18,0.3)', background: '#F5F2EC', padding: '10px 12px', minHeight: 70, resize: 'vertical', boxSizing: 'border-box', width: '100%' }} />
              {comErr && <span role="alert" style={{ fontSize: 13, fontWeight: 600 }}>{comErr}</span>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button type="button" disabled={comBusy} onClick={() => publish(cur)} style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#F5F2EC', background: '#0E0E12', border: 0, borderRadius: 12, minHeight: 44, padding: '0 16px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>{comBusy && <Spinner />}Publicar</button>
                {(isManager || cur.mine) && (cur.archived ? <button type="button" onClick={() => archive(cur, false)} style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#0E0E12', background: 'transparent', border: '1.5px solid #0E0E12', borderRadius: 12, minHeight: 44, padding: '0 16px', cursor: 'pointer' }}>Desarquivar</button> : <button type="button" onClick={() => archive(cur, true)} style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#0E0E12', background: 'transparent', border: '1.5px solid #0E0E12', borderRadius: 12, minHeight: 44, padding: '0 16px', cursor: 'pointer' }}>Arquivar</button>)}
              </div>
            </div>
          )}
        </FocusCard>
      )}
    </div>
  );
}
