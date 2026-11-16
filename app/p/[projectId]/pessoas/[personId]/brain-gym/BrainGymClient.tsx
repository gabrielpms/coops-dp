'use client';
import { useEffect, useRef, useState } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import { OpenDeckBanner } from '@/components/ds/OpenDeckBanner';
import { FocusCard, FocusClose } from '@/components/ds/FocusCard';
import { StudyTypeIcon } from '@/components/person/StudyTypeIcon';
import { BannerBrain } from '@/components/person/BannerIcons';
import { StudyDeck, TypePicker, STUDY_META, type StudyDraft, type StudyType, type StudyView } from '@/components/person/StudyDecks';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { label, mono } from '@/components/ds/tokens';
import { firstName, plural } from '@/lib/format';
import type { AvatarConfig } from '@/components/avatar/Avatar';

type Filter = 'todos' | 'fila' | 'estudando' | 'concluido';
const FILTERS: [Filter, string][] = [['todos', 'Todos'], ['fila', 'Na fila'], ['estudando', 'Estudando'], ['concluido', 'Concluídos']];
const LS = 'coops.filter.braingym';
const state = (i: StudyView): Filter => (i.progress === 0 ? 'fila' : i.progress >= i.total ? 'concluido' : 'estudando');
const STATE_LABEL = { fila: 'NA FILA', estudando: 'ESTUDANDO', concluido: 'CONCLUÍDO', todos: '' };

export function BrainGymClient({ user, person, projectId, isOwn, skills, items: initial, draft: d0 }: {
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; person: { id: string; name: string; avatar: AvatarConfig | null }; projectId: string; isOwn: boolean;
  skills: { id: string; name: string }[]; items: StudyView[]; draft: StudyDraft | null;
}) {
  const { refresh } = useCoopsRouter();
  const [items, setItems] = useState(initial);
  const latest = useRef(initial); // sempre o valor mais recente: cliques rápidos não perdem incrementos
  useEffect(() => { setItems(initial); latest.current = initial; }, [initial]);
  const [filter, setFilter] = useState<Filter>('todos');
  const [sheet, setSheet] = useState<{ k: 'pick' } | { k: 'new'; type: StudyType } | { k: 'detail'; id: string; rect: DOMRect | null } | null>(null);
  const [draft, setDraft] = useState(d0);
  const [warn, setWarn] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const fn = firstName(person.name);
  useEffect(() => { try { const v = localStorage.getItem(LS) as Filter | null; if (v && FILTERS.some(([f]) => f === v)) setFilter(v); } catch {} }, []);
  const pick = (f: Filter) => { setFilter(f); try { localStorage.setItem(LS, f); } catch {} };
  const count = (f: Filter) => (f === 'todos' ? items.length : items.filter((i) => state(i) === f).length);
  const shown = filter === 'todos' ? items : items.filter((i) => state(i) === filter);
  const cur = sheet?.k === 'detail' ? items.find((i) => i.id === sheet.id) : null;

  // progresso (+/−): otimista e salvo na hora
  const step = async (it: StudyView, delta: number) => {
    const curItem = latest.current.find((x) => x.id === it.id) ?? it;
    const next = Math.max(0, Math.min(curItem.total, curItem.progress + delta)); if (next === curItem.progress) return;
    const prev = latest.current; latest.current = prev.map((x) => (x.id === it.id ? { ...x, progress: next } : x)); setItems(latest.current); setWarn(null);
    try { const r = await fetch(`/api/people/${person.id}/study/${it.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ progress: next }) }); if (!r.ok) throw new Error(); }
    catch { latest.current = latest.current.map((x) => (x.id === it.id ? { ...x, progress: prev.find((y) => y.id === it.id)?.progress ?? x.progress } : x)); setItems(latest.current); setWarn('Não deu para salvar o progresso.'); }
  };
  const saveNotes = async () => { if (!cur) return; await fetch(`/api/people/${person.id}/study/${cur.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ notes }) }); setItems((all) => all.map((x) => (x.id === cur.id ? { ...x, notes } : x))); setSheet(null); };
  const remove = async () => { if (!cur || !window.confirm('Remover este conteúdo do deck?')) return; await fetch(`/api/people/${person.id}/study/${cur.id}`, { method: 'DELETE' }); setSheet(null); refresh(); };
  const setTo = (it: StudyView, n: number) => { const c = latest.current.find((x) => x.id === it.id) ?? it; void step(it, (c.progress === n ? n - 1 : n) - c.progress); };
  const Controls = ({ it, onCard }: { it: StudyView; onCard?: boolean }) => {
    const stepTxt = `${it.progress} de ${it.total} ${STUDY_META[it.type].unit}`;
    return (
      <>
        <div role="group" aria-label={`Progresso de ${it.title}`} style={{ display: 'grid', gridTemplateColumns: `repeat(${it.total}, minmax(0, 1fr))`, gap: 3 }}>
          {Array.from({ length: it.total }, (_, k) => isOwn
            ? <button key={k} type="button" className="bg-blk" aria-label={`Marcar ${k + 1} de ${it.total}`} onClick={(e) => { e.stopPropagation(); setTo(it, k + 1); }} style={{ height: onCard ? 30 : 36, padding: 0, borderRadius: 6, background: k < it.progress ? '#0E0E12' : 'transparent', border: '2px solid #0E0E12', cursor: 'pointer' }} />
            : <span key={k} style={{ height: onCard ? 30 : 36, borderRadius: 6, background: k < it.progress ? '#0E0E12' : 'transparent', border: '2px solid #0E0E12' }} />)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, borderTop: '1.5px solid #0E0E12', paddingTop: 10 }}>
          <span style={{ ...mono, fontSize: 11 }}>{stepTxt}</span>
          {isOwn && <span style={{ display: 'flex', gap: 6 }}>
            <button type="button" className="bg-step" aria-label={`Diminuir progresso de ${it.title}`} onClick={(e) => { e.stopPropagation(); void step(it, -1); }} style={{ width: 40, height: 40, borderRadius: 11, background: 'transparent', border: '2px solid #0E0E12', color: '#0E0E12', fontFamily: 'inherit', fontSize: 18, fontWeight: 600, cursor: 'pointer' }}>−</button>
            <button type="button" className="bg-step" aria-label={`Aumentar progresso de ${it.title}`} onClick={(e) => { e.stopPropagation(); void step(it, 1); }} style={{ width: 40, height: 40, borderRadius: 11, background: '#0E0E12', border: '2px solid #0E0E12', color: '#F5A9D6', fontFamily: 'inherit', fontSize: 18, fontWeight: 600, cursor: 'pointer' }}>+</button>
          </span>}
        </div>
      </>
    );
  };

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <OpenDeckBanner bg="#F5A9D6" icon={<BannerBrain />} avatar={{ ...DEFAULT_AVATAR_CFG, ...(person.avatar ?? {}) }} avatarBg="#D987B8" avatarCrown avatarHref={`/p/${projectId}/pessoas/${person.id}`} back={{ href: `/p/${projectId}/pessoas/${person.id}`, label: `← ${isOwn ? 'Meu perfil' : person.name}` }}
          title="Brain gym" desc={isOwn ? 'Livros, cursos e vídeos ligados às skills que você quer subir. Avance em blocos.' : `O que ${fn} está estudando, com o progresso de cada conteúdo.`} cta={isOwn ? { label: '+ Conteúdo', onClick: () => setSheet({ k: 'pick' }) } : null} />
        {warn && <div role="alert" style={{ borderRadius: 14, border: '1.5px solid #FF8A5B', padding: '10px 14px', fontSize: 14 }}>{warn}</div>}
        <div role="tablist" aria-label="Filtrar conteúdos" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FILTERS.map(([f, text]) => { const on = filter === f; return <button key={f} type="button" role="tab" aria-selected={on} onClick={() => pick(f)} style={{ fontFamily: 'inherit', fontWeight: on ? 600 : 400, fontSize: 14, color: on ? '#0E0E12' : '#F5F2EC', background: on ? '#F5F2EC' : 'transparent', border: on ? 0 : '1px solid #4A4858', borderRadius: 999, minHeight: 44, padding: '0 16px', cursor: 'pointer' }}>{text} · {count(f)}</button>; })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {shown.map((it) => {
            const pct = Math.round((it.progress / it.total) * 100), st = state(it);
            return (
              <article key={it.id} className="coops-card" style={{ borderRadius: 24, background: st === 'concluido' ? '#A3A1AD' : '#F5A9D6', color: '#0E0E12', border: '2px solid #0E0E12', padding: 18, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 340, boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <span className="bgi-wrap" style={{ flex: 'none', width: 56, height: 56, lineHeight: 0 }}><span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>{STUDY_META[it.type].label}</span><StudyTypeIcon type={it.type} /></span>
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 38, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' }}>{pct}%</span><span style={{ ...mono, fontSize: 10 }}>{STATE_LABEL[st]}</span></span>
                </div>
                <button type="button" onClick={(e) => { setNotes(it.notes); setSheet({ k: 'detail', id: it.id, rect: (e.currentTarget.closest('.coops-card') ?? e.currentTarget).getBoundingClientRect() }); }} aria-label={`Abrir ${it.title}`} style={{ fontFamily: 'inherit', textAlign: 'left', background: 'transparent', border: 0, color: '#0E0E12', padding: 0, display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer', marginTop: 'auto' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 21, fontWeight: 700, lineHeight: 1.15 }}>{it.title}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg></span>
                  <span style={{ fontSize: 13, lineHeight: 1.45, opacity: 0.85 }}>{STUDY_META[it.type].label}{it.skillName ? ` · ${it.skillName}` : ''}</span>
                </button>
                <Controls it={it} onCard />
              </article>
            );
          })}
          {isOwn && <button type="button" onClick={() => setSheet({ k: 'pick' })} className="tw-add" style={{ fontFamily: 'inherit', height: 340, boxSizing: 'border-box', borderRadius: 22, background: 'transparent', border: '1.5px dashed #4A4858', color: '#F5F2EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', padding: 20 }}>
            <span style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #4A4858', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></span>
            <span style={{ fontSize: 17, fontWeight: 600 }}>{items.length ? 'Novo conteúdo' : 'Adicionar o primeiro conteúdo'}</span><span style={{ fontSize: 13, color: '#A3A1AD', textAlign: 'center' }}>Livro, curso, vídeo, artigo, podcast ou link</span>
          </button>}
        </div>
        {!isOwn && items.length === 0 && <p style={{ margin: 0, color: '#A3A1AD' }}>{fn} ainda não adicionou conteúdos ao Brain gym.</p>}
        {items.length > 0 && <p style={{ margin: 0, color: '#A3A1AD', fontSize: 14 }}>{items.length} {plural(items.length, 'conteúdo', 'conteúdos')} no deck.</p>}
      </div>

      {sheet?.k === 'pick' && <TypePicker onPick={(type) => setSheet({ k: 'new', type })} onClose={() => setSheet(null)} />}
      {sheet?.k === 'new' && <StudyDeck personId={person.id} type={sheet.type} skills={skills} draft={draft} onDraftChange={setDraft} onChangeType={() => setSheet({ k: 'pick' })} onClose={() => setSheet(null)} onSaved={() => { setSheet(null); refresh(); }} />}
      {sheet?.k === 'detail' && cur && (
        <FocusCard origin={sheet.rect} bg="#F5A9D6" ariaLabel={cur.title} onClose={() => setSheet(null)}>
          <div className="coops-fx-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ ...mono, fontSize: 12, color: 'rgba(14,14,18,0.68)' }}>BRAIN GYM › {STUDY_META[cur.type].label.toUpperCase()}</span>
                <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 }}>{cur.title}</h2>
              </div>
              <FocusClose onClick={() => setSheet(null)} />
            </div>
            <div style={{ borderRadius: 16, background: 'rgba(245,242,236,0.55)', border: '1.5px solid #0E0E12', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', ...mono, fontSize: 11 }}><span>PROGRESSO</span><span>{Math.round((cur.progress / cur.total) * 100)}%</span></div>
              <Controls it={cur} />
            </div>
            <span style={{ fontSize: 14 }}><b>Skill </b>{cur.skillName || 'nenhuma'}{cur.url && <> · <a href={/^https?:\/\//i.test(cur.url) ? cur.url : `https://${cur.url}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0E0E12', fontWeight: 600 }}>abrir conteúdo ↗</a></>}</span>
            <label htmlFor="bg-notas" style={{ ...mono, fontSize: 11, color: 'rgba(14,14,18,0.68)' }}>ANOTAÇÕES</label>
            <textarea id="bg-notas" rows={4} readOnly={!isOwn} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ fontFamily: 'inherit', fontSize: 16, lineHeight: 1.5, color: '#0E0E12', background: 'rgba(245,242,236,0.65)', border: '1.5px solid rgba(14,14,18,0.3)', borderRadius: 12, padding: '12px 14px', resize: 'vertical', boxSizing: 'border-box', width: '100%' }} />
            {isOwn && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
              <button type="button" onClick={remove} style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#0E0E12', background: 'transparent', border: '1.5px solid #0E0E12', borderRadius: 12, minHeight: 48, padding: '0 16px', cursor: 'pointer' }}>Remover do deck</button>
              <button type="button" onClick={saveNotes} style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 15, color: '#F5F2EC', background: '#0E0E12', border: 0, borderRadius: 14, minHeight: 48, padding: '0 22px', cursor: 'pointer' }}>Salvar</button>
            </div>}
          </div>
        </FocusCard>
      )}
    </div>
  );
}
