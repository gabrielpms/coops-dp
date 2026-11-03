'use client';
import { useEffect, useRef, useState } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import { OpenDeckBanner } from '@/components/ds/OpenDeckBanner';
import { BottomSheet } from '@/components/sheet/BottomSheet';
import { DiFlag } from '@/components/person/DeckIcons';
import { JourneyDeck, type JourneyDraft, type JourneyKind, type JourneyView } from '@/components/person/JourneyDeck';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { label } from '@/components/ds/tokens';
import { cycleLabel, firstName } from '@/lib/format';
import type { AvatarConfig } from '@/components/avatar/Avatar';

type Filter = 'todas' | 'OBJETIVO' | 'FOCO' | 'anteriores';
const FILTERS: [Filter, string][] = [['todas', 'Ciclo atual'], ['OBJETIVO', 'Objetivos'], ['FOCO', 'Focos'], ['anteriores', 'Ciclos anteriores']];
const LS = 'coops.filter.jornada';
const PROG = ['COMEÇANDO', '', '', '', 'SINAL ATINGIDO'];

export function JornadaClient({ user, person, projectId, isOwn, cycle, skills, goals: initial, drafts }: {
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; person: { id: string; name: string; avatar: AvatarConfig | null }; projectId: string; isOwn: boolean; cycle: string; skills: string[];
  goals: JourneyView[]; drafts: Record<JourneyKind, JourneyDraft | null>;
}) {
  const { refresh } = useCoopsRouter();
  const [goals, setGoals] = useState(initial);
  const latest = useRef(initial);
  useEffect(() => { setGoals(initial); latest.current = initial; }, [initial]);
  const [filter, setFilter] = useState<Filter>('todas');
  const [sheet, setSheet] = useState<{ k: 'pick' } | { k: 'new'; kind: JourneyKind } | { k: 'detail'; id: string } | null>(null);
  const [dr, setDr] = useState(drafts);
  const [warn, setWarn] = useState<string | null>(null);
  const fn = firstName(person.name);
  useEffect(() => { try { const v = localStorage.getItem(LS) as Filter | null; if (v && FILTERS.some(([f]) => f === v)) setFilter(v); } catch {} }, []);
  const pick = (f: Filter) => { setFilter(f); try { localStorage.setItem(LS, f); } catch {} };
  const now = goals.filter((g) => g.cycle === cycle), past = goals.filter((g) => g.cycle !== cycle);
  const objs = now.filter((g) => g.kind === 'OBJETIVO');
  const avg = objs.length ? Math.round((objs.reduce((a, g) => a + g.progress, 0) / (objs.length * 5)) * 100) : 0;
  const shown = filter === 'anteriores' ? [] : now.filter((g) => filter === 'todas' || g.kind === filter);
  const cur = sheet?.k === 'detail' ? goals.find((g) => g.id === sheet.id) : null;
  const pastCycles = [...new Set(past.map((g) => g.cycle))];

  const setProgress = async (g: JourneyView, n: number) => {
    const prev = latest.current; latest.current = prev.map((x) => (x.id === g.id ? { ...x, progress: n } : x)); setGoals(latest.current); setWarn(null);
    try { const r = await fetch(`/api/people/${person.id}/journey/${g.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ progress: n }) }); if (!r.ok) throw new Error(); }
    catch { latest.current = prev; setGoals(prev); setWarn('Não deu para salvar o progresso.'); }
  };
  const remove = async () => { if (!cur || !window.confirm('Remover esta carta da jornada?')) return; await fetch(`/api/people/${person.id}/journey/${cur.id}`, { method: 'DELETE' }); setSheet(null); refresh(); };
  const pips = (g: JourneyView, big?: boolean) => (
    <div role={isOwn ? 'radiogroup' : 'img'} aria-label={`Progresso do objetivo: ${g.progress} de 5`} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
      {[1, 2, 3, 4, 5].map((n) => { const st = { height: big ? 44 : 22, borderRadius: 8, border: '2px solid #0E0E12', background: n <= g.progress ? '#0E0E12' : 'transparent', padding: 0, cursor: isOwn ? 'pointer' : 'default' } as const; return isOwn ? <button key={n} type="button" role="radio" aria-checked={g.progress === n} aria-label={`Progresso ${n} de 5`} onClick={(e) => { e.stopPropagation(); void setProgress(g, g.progress === n ? n - 1 : n); }} style={st} /> : <span key={n} style={st} />; })}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <OpenDeckBanner bg="#FF8A5B" icon={<DiFlag />} avatar={{ ...DEFAULT_AVATAR_CFG, ...(person.avatar ?? {}) }} back={{ href: `/p/${projectId}/pessoas/${person.id}`, label: `← ${isOwn ? 'Meu perfil' : person.name}` }}
          title="Jornada" desc={isOwn ? `Para onde você está indo no ciclo ${cycleLabel(cycle)}: objetivos com sinal, focos de desenvolvimento e os ciclos anteriores.` : `Para onde ${fn} está indo no ciclo ${cycleLabel(cycle)}.`} cta={isOwn ? { label: '+ Carta', onClick: () => setSheet({ k: 'pick' }) } : null} />
        {warn && <div role="alert" style={{ borderRadius: 14, border: '1.5px solid #FF8A5B', padding: '10px 14px', fontSize: 14 }}>{warn}</div>}
        <div role="tablist" aria-label="Filtrar a jornada" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FILTERS.map(([f, text]) => { const on = filter === f; return <button key={f} type="button" role="tab" aria-selected={on} onClick={() => pick(f)} style={{ fontFamily: 'inherit', fontWeight: on ? 600 : 400, fontSize: 14, color: on ? '#0E0E12' : '#F5F2EC', background: on ? '#F5F2EC' : 'transparent', border: on ? 0 : '1px solid #4A4858', borderRadius: 999, minHeight: 44, padding: '0 16px', cursor: 'pointer' }}>{text}</button>; })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {(filter === 'todas') && objs.length > 0 && (
            <article aria-label="Progresso do ciclo" style={{ height: 340, boxSizing: 'border-box', borderRadius: 22, background: '#F5F2EC', color: '#0E0E12', border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ display: 'flex', justifyContent: 'space-between' }}><DiFlag /><span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}>{avg}%</span></span>
              <span style={{ marginTop: 'auto', ...label(11, '0.08em') }}>PROGRESSO · {cycleLabel(cycle)}</span><span style={{ fontSize: 21, fontWeight: 600 }}>Média dos objetivos</span><span style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 10, fontSize: 13 }}>{objs.length} {objs.length === 1 ? 'objetivo' : 'objetivos'} no ciclo</span>
            </article>
          )}
          {shown.map((g) => (
            <article key={g.id} className="coops-card" style={{ height: 340, boxSizing: 'border-box', borderRadius: 22, background: g.kind === 'OBJETIVO' ? '#FF8A5B' : '#F3D36B', color: '#0E0E12', border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 16px 36px rgba(0,0,0,0.45)' }}>
              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><DiFlag /><span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}>{g.kind === 'OBJETIVO' ? `${g.progress}/5` : `${g.levelFrom}→${g.levelTo}`}</span><span style={label(11, '0')}>{g.kind === 'OBJETIVO' ? (g.progress >= 5 ? 'ATINGIDO' : 'PROGRESSO') : 'NÍVEL'}</span></span></span>
              <button type="button" onClick={() => setSheet({ k: 'detail', id: g.id })} aria-label={`Abrir ${g.title}`} style={{ marginTop: 'auto', fontFamily: 'inherit', textAlign: 'left', background: 'none', border: 0, padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 44 }}>
                <span style={label(11, '0.08em')}>{g.kind === 'OBJETIVO' ? 'OBJETIVO' : 'FOCO DE DESENVOLVIMENTO'} · {cycleLabel(g.cycle)}</span>
                <span style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{g.title}</span>
              </button>
              {g.kind === 'OBJETIVO' ? <div style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 10 }}>{pips(g)}</div> : <span style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 10, fontSize: 13 }}>{g.practice || 'Sem passos ainda'}</span>}
            </article>
          ))}
          {filter === 'anteriores' && pastCycles.map((c) => { const gs = past.filter((g) => g.cycle === c); return (
            <article key={c} style={{ minHeight: 200, boxSizing: 'border-box', borderRadius: 22, background: '#A3A1AD', color: '#0E0E12', border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={label(11, '0.08em')}>CICLO · {cycleLabel(c)}</span><span style={{ fontSize: 20, fontWeight: 600 }}>{gs.length} {gs.length === 1 ? 'carta' : 'cartas'}</span><span style={{ fontSize: 14, lineHeight: 1.4 }}>{gs.map((g) => g.title).join(' · ')}</span>
            </article>); })}
          {isOwn && filter !== 'anteriores' && <button type="button" onClick={() => setSheet({ k: 'pick' })} className="tw-add" style={{ fontFamily: 'inherit', height: 340, boxSizing: 'border-box', borderRadius: 22, background: 'transparent', border: '1.5px dashed #4A4858', color: '#F5F2EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', padding: 20 }}>
            <span style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #4A4858', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></span>
            <span style={{ fontSize: 17, fontWeight: 600 }}>{now.length ? 'Nova carta' : 'Montar a jornada do ciclo'}</span><span style={{ fontSize: 13, color: '#A3A1AD', textAlign: 'center' }}>Objetivo com sinal ou foco de desenvolvimento</span>
          </button>}
        </div>
        {filter === 'anteriores' && pastCycles.length === 0 && <p style={{ margin: 0, color: '#A3A1AD' }}>Ainda não há ciclos anteriores.</p>}
        {!isOwn && now.length === 0 && filter !== 'anteriores' && <p style={{ margin: 0, color: '#A3A1AD' }}>{fn} ainda não montou a jornada deste ciclo.</p>}
      </div>

      {sheet?.k === 'pick' && (
        <BottomSheet tag="JORNADA · NOVA CARTA" title="O que você quer adicionar ao ciclo?" onClose={() => setSheet(null)}>
          <p style={{ margin: 0, fontSize: 14, color: '#A3A1AD' }}>Escolha uma carta. Depois vêm as perguntas, uma por carta.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {([['OBJETIVO', 'Objetivo', `O que ${isOwn ? 'você quer' : `${fn} quer`} alcançar no ciclo, com o sinal que vamos acompanhar.`, '#FF8A5B'], ['FOCO', 'Foco de desenvolvimento', 'A skill que vai ser treinada, do nível de hoje até a meta do ciclo.', '#F3D36B']] as [JourneyKind, string, string, string][]).map(([k, t, h, bg]) => (
              <button key={k} type="button" onClick={() => setSheet({ k: 'new', kind: k })} className="coops-card" style={{ fontFamily: 'inherit', textAlign: 'left', minHeight: 150, borderRadius: 18, background: bg, color: '#0E0E12', border: '2px solid #0E0E12', padding: 16, display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer' }}><span style={{ fontSize: 20, fontWeight: 700 }}>{t}</span><span style={{ fontSize: 13, lineHeight: 1.4 }}>{h}</span></button>
            ))}
          </div>
        </BottomSheet>
      )}
      {sheet?.k === 'new' && <JourneyDeck key={sheet.kind} personId={person.id} personName={isOwn ? 'você' : fn} kind={sheet.kind} skills={skills} cycleName={cycleLabel(cycle)} draft={dr[sheet.kind]} onDraftChange={(d) => setDr((x) => ({ ...x, [sheet.kind]: d }))} onChangeType={() => setSheet({ k: 'pick' })} onClose={() => setSheet(null)} onSaved={() => { setSheet(null); refresh(); }} />}
      {sheet?.k === 'detail' && cur && (
        <BottomSheet tag={`JORNADA › ${cur.kind === 'OBJETIVO' ? 'OBJETIVO' : 'FOCO'}`} title={cur.title} onClose={() => setSheet(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cur.kind === 'OBJETIVO' ? <>
              <span style={label(11)}>PROGRESSO DO OBJETIVO · {PROG[Math.max(0, cur.progress - 1)] || `${cur.progress} DE 5`}</span>
              <div style={{ borderRadius: 16, background: '#FF8A5B', border: '2px solid #0E0E12', padding: 14 }}>{pips(cur, true)}</div>
              <Row k="POR QUÊ" v={cur.why || 'Sem contexto registrado.'} /><Row k="SINAL" v={cur.signal} />{cur.measure && <Row k="PRAZO OU MEDIDA" v={cur.measure} />}
            </> : <><Row k="NÍVEL" v={`de ${cur.levelFrom} para ${cur.levelTo}`} /><Row k="COMO VAI PRATICAR" v={cur.practice || 'Sem passos ainda.'} /></>}
            {isOwn && <button type="button" onClick={remove} style={{ alignSelf: 'flex-start', fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#F5F2EC', background: 'transparent', border: '1.5px solid #4A4858', borderRadius: 12, minHeight: 48, padding: '0 16px', cursor: 'pointer' }}>Remover da jornada</button>}
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
const Row = ({ k, v }: { k: string; v: string }) => <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderRadius: 12, background: '#17171D', border: '1px solid #2C2C36', padding: '10px 14px' }}><span style={{ ...label(10), color: '#A3A1AD' }}>{k}</span><span style={{ fontSize: 15, lineHeight: 1.45 }}>{v}</span></div>;
