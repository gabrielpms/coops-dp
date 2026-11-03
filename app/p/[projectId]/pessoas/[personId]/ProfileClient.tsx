'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import { Avatar, type AvatarConfig } from '@/components/avatar/Avatar';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { CoopsLink, useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { PowerUpDeck, type PowerUpDraft } from '@/components/person/PowerUpDeck';
import { DiBook, DiFlag, DiHeart, DiPeople, DiRocket, DiStar } from '@/components/person/DeckIcons';
import { label } from '@/components/ds/tokens';
import { firstName, plural, tenureLong } from '@/lib/format';

type PU = { id: string; type: string; name: string; skill: string; frequency: string; progress: number };
const TYPE_LABEL: Record<string, string> = { MENTORIA: 'MENTORIA', CURSO: 'CURSO', PROJETO: 'PROJETO PARALELO' };
const STUDY_LABEL: Record<string, string> = { CURSO: 'CURSO', LIVRO: 'LIVRO', VIDEO: 'VÍDEO', ARTIGO: 'ARTIGO', PODCAST: 'PODCAST', LINK: 'LINK' };

export function ProfileClient({ user, project, person, isOwn, isManager, powerUps, skillsSummary, studySummary, deliverySummary, journeySummary, healthSummary, draft: d0 }: {
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; project: { id: string; name: string; skills: string[] };
  person: { id: string; name: string; title: string; avatar: AvatarConfig | null; mainSkill: string; joinedAt: string | null; squads: { id: string; name: string; color: string }[] };
  isOwn: boolean; isManager: boolean; powerUps: PU[];
  skillsSummary: { total: number; top: { name: string; self: number }[]; avg: number; rated: number };
  studySummary: { total: number; active: number; latest: { title: string; type: string; pct: number } | null };
  deliverySummary: { total: number; delivered: number; paused: number; latest: { title: string } | null };
  journeySummary: { total: number; goals: number; avg: number; first: string | null }; healthSummary: { avg: number; cycle: string } | null;
  draft: PowerUpDraft | null;
}) {
  const { refresh } = useCoopsRouter();
  const [deck, setDeck] = useState(false);
  const [draft, setDraft] = useState(d0);
  const [sticky, setSticky] = useState(false);
  const decksRef = useRef<HTMLElement>(null);
  const fn = firstName(person.name);
  const cfg = { ...DEFAULT_AVATAR_CFG, ...(person.avatar ?? {}) };
  const base = `/p/${project.id}/pessoas/${person.id}`;

  // Barra fixa: aparece quando a seção de decks passa de 140 px do topo (PRD M6)
  useEffect(() => {
    const on = () => { const top = decksRef.current?.getBoundingClientRect().top ?? 999; setSticky(top < 140); };
    on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on);
  }, []);

  const removePU = async (id: string) => { if (!window.confirm('Remover este power up?')) return; await fetch(`/api/people/${person.id}/powerups/${id}`, { method: 'DELETE' }); refresh(); };
  const cardBase = { color: '#0E0E12', textDecoration: 'none', borderRadius: 22, border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, height: 340, boxSizing: 'border-box', boxShadow: '0 16px 36px rgba(0,0,0,0.45)' } as const;
  const head = (icon: ReactNode, big: string, bigLabel: string) => (
    <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>{icon}<span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' }}>{big}</span><span style={label(11, '0')}>{bigLabel}</span></span></span>
  );
  const foot = (kicker: string, title: string, sub: string) => (<>
    <span style={{ marginTop: 'auto', ...label(11, '0.08em') }}>{kicker}</span>
    <span style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.2 }}>{title}</span>
    <span style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 10, fontSize: 13, lineHeight: 1.4 }}>{sub}</span>
  </>);

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      {sticky && (
        <div role="region" aria-label={`Resumo de ${person.name}`} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, background: 'rgba(14,14,18,0.94)', backdropFilter: 'blur(8px)', borderBottom: '1.5px solid #2C2C36' }}>
          <div style={{ maxWidth: 1216, margin: '0 auto', padding: '8px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12' }}><Avatar {...cfg} size={40} label="" /></span>
            <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}><span style={{ fontSize: 16, fontWeight: 700 }}>{person.name}</span><span style={{ fontSize: 12, color: '#A3A1AD' }}>{person.title || 'Sem cargo'}{person.mainSkill ? ` · ${person.mainSkill}` : ''}</span></span>
            {person.squads[0] && <span style={{ marginLeft: 'auto', ...label(11, '0.06em'), color: '#0E0E12', background: person.squads[0].color, borderRadius: 999, padding: '6px 10px' }}>{person.squads[0].name.toUpperCase()}</span>}
          </div>
        </div>
      )}
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />

        <section aria-label={`Perfil de ${person.name}`} style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', borderRadius: 32, background: '#17171D', border: '1px solid #2C2C36', padding: 'clamp(20px, 4vw, 40px)' }}>
          <div style={{ flex: '0 0 auto', margin: '0 auto', lineHeight: 0, borderRadius: '50%', border: '3px solid #0E0E12', boxShadow: '0 0 0 4px #B7A6FF' }}><Avatar {...cfg} size={200} label={person.name} /></div>
          <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
            {isManager && !isOwn ? <CoopsLink href={`/p/${project.id}/time`} style={{ fontSize: 14, minHeight: 44, display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start' }}>← Time</CoopsLink> : <CoopsLink href="/hub" style={{ fontSize: 14, minHeight: 44, display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start' }}>← Hub de projetos</CoopsLink>}
            <span style={{ ...label(12, '0.1em'), color: '#B7A6FF' }}>{person.squads.length ? person.squads.map((s) => `SQUAD ${s.name.toUpperCase()}`).join(' · ') : project.name.toUpperCase()}</span>
            <h1 style={{ margin: 0, fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1 }}>{person.name}</h1>
            <p style={{ margin: 0, fontSize: 18, color: '#A3A1AD' }}>{person.title || 'Sem cargo ainda'}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {person.mainSkill && <span style={{ fontSize: 13, fontWeight: 600, color: '#0E0E12', background: '#F3D36B', borderRadius: 999, padding: '6px 12px' }}>Skill principal · {person.mainSkill}</span>}
              {person.joinedAt && <span style={{ fontSize: 13, border: '1px solid #4A4858', borderRadius: 999, padding: '6px 12px' }}>{tenureLong(person.joinedAt)}</span>}
            </div>
          </div>
        </section>

        <section aria-label="Power ups" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
            <div><h2 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Power ups</h2><p style={{ margin: '4px 0 0', color: '#A3A1AD', fontSize: 15 }}>Mentorias, cursos e projetos paralelos</p></div>
            <button type="button" onClick={() => setDeck(true)} style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#0E0E12', background: '#8FE3C8', border: 0, borderRadius: 14, minHeight: 48, padding: '0 18px', cursor: 'pointer' }}>+ Power up</button>
          </div>
          {powerUps.length === 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', borderRadius: 18, border: '1.5px dashed #4A4858', padding: '16px 18px' }}>
              <span aria-hidden="true" style={{ flex: '0 0 40px', height: 40, borderRadius: 12, border: '1.5px dashed #8FE3C8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8FE3C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg></span>
              <span style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontWeight: 600 }}>Nenhum power up ainda</span><span style={{ fontSize: 14, color: '#A3A1AD' }}>Cursos e mentorias em andamento aparecem aqui.</span></span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
              {powerUps.map((u) => (
                <article key={u.id} style={{ borderRadius: 18, background: '#8FE3C8', color: '#0E0E12', border: '2px solid #0E0E12', padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8, ...label(10) }}><span>{TYPE_LABEL[u.type] ?? u.type}</span><button type="button" aria-label={`Remover ${u.name}`} onClick={() => removePU(u.id)} style={{ width: 44, height: 44, margin: '-12px -12px 0 0', border: 0, background: 'transparent', cursor: 'pointer', color: '#0E0E12' }}>✕</button></span>
                  <span style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.2 }}>{u.name}</span>
                  {u.type === 'MENTORIA' ? <span style={{ fontSize: 13 }}>{u.frequency || 'Sem frequência'}</span> : <><span style={{ fontSize: 13 }}>{u.progress}% concluído</span><span aria-hidden="true" style={{ display: 'block', height: 8, borderRadius: 4, background: 'rgba(14,14,18,0.18)' }}><span style={{ display: 'block', width: `${u.progress}%`, height: 8, borderRadius: 4, background: '#0E0E12' }} /></span></>}
                  {u.skill && <span style={{ fontSize: 12, fontWeight: 600, background: '#F3D36B', border: '1.5px solid #0E0E12', borderRadius: 999, padding: '3px 9px', alignSelf: 'flex-start' }}>{u.skill}</span>}
                </article>
              ))}
            </div>
          )}
        </section>

        <section ref={decksRef} aria-label={`Decks de ${fn}`} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Decks {isOwn ? 'do seu perfil' : `da ${fn}`}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            <CoopsLink href={`${base}/skills`} className="coops-card" aria-label="Abrir o deck de Skills" style={{ ...cardBase, background: '#F3D36B' }}>
              {head(<DiStar />, skillsSummary.rated ? skillsSummary.avg.toFixed(1).replace('.', ',') : '—', 'MÉDIA / 5')}
              {skillsSummary.top.length > 0 && <span aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>{skillsSummary.top.map((s) => <span key={s.name} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{s.name}</span><span>{'●'.repeat(s.self)}{'○'.repeat(5 - s.self)}</span></span>)}</span>}
              {foot('SKILLS', 'Autoavaliação', `${skillsSummary.total} ${plural(skillsSummary.total, 'skill do projeto', 'skills do projeto')} · ${isOwn ? 'avaliar' : 'ver notas'}`)}
            </CoopsLink>
            <CoopsLink href={`${base}/brain-gym`} className="coops-card" aria-label="Abrir o deck de Brain gym" style={{ ...cardBase, background: '#F5A9D6' }}>
              {head(<DiBook />, String(studySummary.active), 'ESTUDANDO')}
              {foot(studySummary.latest ? `BRAIN GYM · ${STUDY_LABEL[studySummary.latest.type] ?? ''}` : 'BRAIN GYM', studySummary.latest?.title ?? 'Nada no deck ainda', studySummary.latest ? `${studySummary.latest.pct}% · ${studySummary.total} ${plural(studySummary.total, 'conteúdo', 'conteúdos')}` : 'Livros, cursos e vídeos ligados às suas skills')}
            </CoopsLink>
            <CoopsLink href={`${base}/entregas`} className="coops-card" aria-label="Abrir o deck de Entregas" style={{ ...cardBase, background: '#8FE3C8' }}>
              {head(<DiRocket />, String(deliverySummary.delivered), plural(deliverySummary.delivered, 'ENTREGUE', 'ENTREGUES'))}
              {foot('ENTREGAS', deliverySummary.latest?.title ?? 'Nenhuma entrega ainda', `${deliverySummary.total} ${plural(deliverySummary.total, 'entrega', 'entregas')}${deliverySummary.paused ? ` · ${deliverySummary.paused} ${plural(deliverySummary.paused, 'pausada', 'pausadas')}` : ''}`)}
            </CoopsLink>
            <CoopsLink href={`${base}/jornada`} className="coops-card" aria-label="Abrir o deck de Jornada" style={{ ...cardBase, background: '#FF8A5B' }}>
              {head(<DiFlag />, journeySummary.goals ? `${journeySummary.avg}%` : String(journeySummary.total), journeySummary.goals ? 'DO CICLO' : plural(journeySummary.total, 'CARTA', 'CARTAS'))}
              {foot('JORNADA', journeySummary.first ?? 'Jornada do ciclo vazia', `${journeySummary.total} ${plural(journeySummary.total, 'carta', 'cartas')} no ciclo`)}
            </CoopsLink>
            <CoopsLink href={`${base}/saude`} className="coops-card" aria-label="Abrir o deck de Saúde" style={{ ...cardBase, background: '#A9D8F5' }}>
              {head(<DiHeart />, healthSummary ? healthSummary.avg.toFixed(1).replace('.', ',') : '—', 'MÉDIA / 5')}
              {foot('SAÚDE · CHECK-IN', healthSummary ? 'Último check-in' : 'Sem check-in ainda', 'Só a pessoa e o manager veem')}
            </CoopsLink>
            <article aria-label="Eventos em breve" style={{ ...cardBase, background: 'transparent', color: '#F5F2EC', border: '2px dashed #B7A6FF', boxShadow: 'none', opacity: 0.85 }}>
              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', filter: 'invert(1)' }}><DiPeople /></span>
              <span style={{ marginTop: 'auto', ...label(11, '0.08em'), color: '#B7A6FF' }}>EVENTOS · EM BREVE</span>
              <span style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.2 }}>Check-ins, feedbacks, promoções e méritos</span>
            </article>
          </div>
        </section>
      </div>
      {deck && <PowerUpDeck personId={person.id} personName={person.name} skills={project.skills} draft={draft} onDraftChange={setDraft} onClose={() => setDeck(false)} onSaved={() => { setDeck(false); refresh(); }} />}
    </div>
  );
}
