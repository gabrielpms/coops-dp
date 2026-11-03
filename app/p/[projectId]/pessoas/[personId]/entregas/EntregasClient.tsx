'use client';
import { useEffect, useRef, useState } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import { OpenDeckBanner } from '@/components/ds/OpenDeckBanner';
import { FocusCard } from '@/components/ds/FocusCard';
import { DeliveryDeck, type DeliveryDraft, type DeliveryView } from '@/components/person/DeliveryDeck';
import { DiRocket } from '@/components/person/DeckIcons';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { label } from '@/components/ds/tokens';
import { MONTHS, STATUS_LABEL, STATUS_LONG, firstName, plural } from '@/lib/format';
import { hostOf } from '@/lib/validation';
import type { AvatarConfig } from '@/components/avatar/Avatar';

type Filter = 'todas' | 'ENTREGUE' | 'EM_ANDAMENTO' | 'PAUSADA';
const FILTERS: [Filter, string][] = [['todas', 'Todas'], ['ENTREGUE', 'Entregues'], ['EM_ANDAMENTO', 'Em andamento'], ['PAUSADA', 'Pausadas']];
const LS = 'coops.filter.entregas';

export function EntregasClient({ user, person, projectId, isOwn, initiatives, deliveries, draft: d0 }: {
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; person: { id: string; name: string; avatar: AvatarConfig | null; squad: string };
  projectId: string; isOwn: boolean; initiatives: { id: string; title: string }[]; deliveries: DeliveryView[]; draft: DeliveryDraft | null;
}) {
  const { refresh } = useCoopsRouter();
  const [filter, setFilter] = useState<Filter>('todas');
  const [focus, setFocus] = useState<{ d: DeliveryView; rect: DOMRect | null } | null>(null);
  const [deck, setDeck] = useState<{ editing: DeliveryView | null } | null>(null);
  const [draft, setDraft] = useState(d0);
  const [impact, setImpact] = useState('');
  const [impactErr, setImpactErr] = useState(false);
  const fn = firstName(person.name);
  const last = useRef<HTMLElement | null>(null);
  useEffect(() => { try { const v = localStorage.getItem(LS) as Filter | null; if (v && FILTERS.some(([f]) => f === v)) setFilter(v); } catch {} }, []);
  const pick = (f: Filter) => { setFilter(f); try { localStorage.setItem(LS, f); } catch {} };
  const count = (f: Filter) => (f === 'todas' ? deliveries.length : deliveries.filter((d) => d.status === f).length);
  const shown = filter === 'todas' ? deliveries : deliveries.filter((d) => d.status === filter);
  const done = () => { setDeck(null); refresh(); };
  const open = (d: DeliveryView, el: HTMLElement) => { last.current = el; setImpact(''); setImpactErr(false); setFocus({ d, rect: el.getBoundingClientRect() }); };
  const saveImpact = async () => {
    if (!focus) return;
    if (!impact.trim()) { setImpactErr(true); return; }
    const r = await fetch(`/api/people/${person.id}/deliveries/${focus.d.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ impact: impact.trim() }) });
    if (r.ok) { setFocus({ ...focus, d: { ...focus.d, impact: impact.trim() } }); refresh(); }
  };
  const cur = focus?.d;
  const [, m, day] = (cur?.date ?? '0000-01-01').split('-');

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <OpenDeckBanner bg="#8FE3C8" icon={<DiRocket />} avatar={{ ...DEFAULT_AVATAR_CFG, ...(person.avatar ?? {}) }} back={{ href: `/p/${projectId}/pessoas/${person.id}`, label: `← ${isOwn ? 'Meu perfil' : person.name}` }}
          title={isOwn ? 'Suas entregas' : `Entregas ${fn.endsWith('a') ? 'da' : 'do'} ${fn}`} desc={isOwn ? 'O que você entregou nas iniciativas do squad, com o impacto de cada entrega.' : `O que ${fn} entregou nas iniciativas do squad, com o impacto de cada entrega.`}
          cta={isOwn ? { label: '+ Nova entrega', onClick: () => setDeck({ editing: null }) } : null} />
        <div role="tablist" aria-label="Filtrar entregas" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FILTERS.map(([f, text]) => { const on = filter === f; return <button key={f} type="button" role="tab" aria-selected={on} onClick={() => pick(f)} style={{ fontFamily: 'inherit', fontWeight: on ? 600 : 400, fontSize: 14, color: on ? '#0E0E12' : '#F5F2EC', background: on ? '#F5F2EC' : 'transparent', border: on ? 0 : '1px solid #4A4858', borderRadius: 999, minHeight: 44, padding: '0 16px', cursor: 'pointer' }}>{text} · {count(f)}</button>; })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {shown.map((d) => (
            <button key={d.id} type="button" className="coops-card" aria-label={`Abrir a entrega ${d.title}`} onClick={(e) => open(d, e.currentTarget)}
              style={{ fontFamily: 'inherit', textAlign: 'left', height: 340, boxSizing: 'border-box', borderRadius: 22, background: '#8FE3C8', color: '#0E0E12', border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', boxShadow: '0 16px 36px rgba(0,0,0,0.45)' }}>
              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <DiRocket />
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' }}>{d.date.slice(8, 10)}</span><span style={label(11, '0')}>{MONTHS[Number(d.date.slice(5, 7)) - 1]}</span></span>
              </span>
              <span style={{ marginTop: 'auto', ...label(11, '0.08em') }}>ENTREGA · {STATUS_LABEL[d.status]}</span>
              <span style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.2 }}>{d.title}</span>
              {d.description && <span style={{ fontSize: 14, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{d.description}</span>}
              <span style={{ width: '100%', boxSizing: 'border-box', fontSize: 13, borderTop: '1.5px solid #0E0E12', paddingTop: 10 }}>{d.initiativeTitle ?? 'Sem iniciativa'}</span>
            </button>
          ))}
          {isOwn && <button type="button" onClick={() => setDeck({ editing: null })} className="tw-add" style={{ fontFamily: 'inherit', height: 340, boxSizing: 'border-box', borderRadius: 22, background: 'transparent', border: '1.5px dashed #4A4858', color: '#F5F2EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', padding: 20 }}>
            <span style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #4A4858', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></span>
            <span style={{ fontSize: 17, fontWeight: 600 }}>{deliveries.length ? 'Nova entrega' : 'Registrar a primeira entrega'}</span><span style={{ fontSize: 13, color: '#A3A1AD', textAlign: 'center' }}>Conte o que foi para o ar e o impacto</span>
          </button>}
        </div>
        {!isOwn && deliveries.length === 0 && <p style={{ margin: 0, color: '#A3A1AD', fontSize: 16 }}>{fn} ainda não registrou nenhuma entrega.</p>}
        {shown.length === 0 && deliveries.length > 0 && <p style={{ margin: 0, color: '#A3A1AD', fontSize: 15 }}>Nenhuma entrega neste filtro. Veja {plural(1, 'o filtro', 'os filtros')} acima.</p>}
      </div>

      {focus && cur && (
        <FocusCard origin={focus.rect} bg="#8FE3C8" ariaLabel={`Entrega ${cur.title}`} onClose={() => { setFocus(null); last.current?.focus?.(); }}>
          <span style={label(11, '0.08em')}>ENTREGAS {isOwn ? 'SUAS' : `DE ${fn.toUpperCase()}`} · {day} {MONTHS[Number(m) - 1]}</span>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{cur.title}</h2>
          {cur.description && <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{cur.description}</p>}
          <div style={{ borderRadius: 14, background: 'rgba(245,242,236,0.6)', border: '1.5px solid #0E0E12', padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={label(10)}>IMPACTO</span>
            {cur.impact ? <span style={{ fontSize: 15, lineHeight: 1.45 }}>{cur.impact}</span> : isOwn ? (<>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Impacto pendente</span>
              <textarea aria-label="Impacto da entrega" value={impact} onChange={(e) => { setImpact(e.target.value); setImpactErr(false); }} placeholder="O que mudou por causa dessa entrega?" style={{ fontFamily: 'inherit', fontSize: 15, borderRadius: 10, border: '1.5px solid rgba(14,14,18,0.3)', background: '#F5F2EC', padding: '10px 12px', minHeight: 80, resize: 'vertical', boxSizing: 'border-box', width: '100%' }} />
              {impactErr && <span role="alert" style={{ fontSize: 13, fontWeight: 600 }}>Escreva o impacto para salvar.</span>}
              <button type="button" onClick={saveImpact} style={{ alignSelf: 'flex-start', fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#F5F2EC', background: '#0E0E12', border: 0, borderRadius: 12, minHeight: 44, padding: '0 16px', cursor: 'pointer' }}>Salvar impacto</button>
            </>) : <span style={{ fontSize: 14 }}>Impacto pendente</span>}
          </div>
          <div style={{ borderRadius: 14, background: 'rgba(245,242,236,0.6)', border: '1.5px solid #0E0E12', padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}><span style={label(10)}>{isOwn ? 'SEU PAPEL' : `PAPEL ${fn.endsWith('a') ? 'DA' : 'DO'} ${fn.toUpperCase()}`}</span><span style={{ fontSize: 15 }}>{cur.role || 'Sem descrição'}</span></div>
          {cur.links.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={label(10)}>LINKS · {cur.links.length}</span>{cur.links.map((l) => <a key={l} href={/^https?:\/\//i.test(l) ? l : `https://${l}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0E0E12', fontWeight: 600, fontSize: 14, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{hostOf(l)} ↗</a>)}</div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, borderTop: '1.5px solid #0E0E12', paddingTop: 10 }}>
            {person.squad && <span><b>Squad </b>{person.squad}</span>}<span><b>Status </b>{STATUS_LONG[cur.status]}</span>
          </div>
          <span style={{ fontSize: 13 }}>{cur.initiativeTitle ? `Ligada à iniciativa “${cur.initiativeTitle}”` : 'Sem iniciativa ligada'}</span>
          {isOwn && <button type="button" onClick={() => { const e = cur; setFocus(null); setDeck({ editing: e }); }} style={{ alignSelf: 'flex-start', fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#0E0E12', background: 'transparent', border: '1.5px solid #0E0E12', borderRadius: 12, minHeight: 44, padding: '0 16px', cursor: 'pointer' }}>Editar entrega</button>}
        </FocusCard>
      )}
      {deck && <DeliveryDeck key={deck.editing?.id ?? 'new'} personId={person.id} editing={deck.editing} initiatives={initiatives} draft={draft} onDraftChange={setDraft} onClose={() => setDeck(null)} onSaved={done} />}
    </div>
  );
}
