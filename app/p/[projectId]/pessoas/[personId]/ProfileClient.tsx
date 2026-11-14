'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import { Avatar, type AvatarConfig } from '@/components/avatar/Avatar';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { CoopsLink, useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { PowerUpDeck, type PowerUpDraft } from '@/components/person/PowerUpDeck';
import { PiBrain, PiEntregas, PiEventos, PiJornada, PiSaude, PiSkills } from '@/components/person/ProfileIcons';
import { label } from '@/components/ds/tokens';
import { firstName, plural, tenureLong } from '@/lib/format';

type PU = { id: string; type: string; name: string; skill: string; frequency: string; progress: number };
const TYPE_LABEL: Record<string, string> = { MENTORIA: 'MENTORIA', CURSO: 'CURSO', PROJETO: 'PROJETO PARALELO' };
const STUDY_LABEL: Record<string, string> = { CURSO: 'CURSO', LIVRO: 'LIVRO', VIDEO: 'VÍDEO', ARTIGO: 'ARTIGO', PODCAST: 'PODCAST', LINK: 'LINK' };

export function ProfileClient({ user, project, person, isOwn, isManager, powerUps, skillsSummary, studySummary, deliverySummary, journeySummary, healthSummary, eventSummary, draft: d0 }: {
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; project: { id: string; name: string; skills: string[] };
  person: { id: string; name: string; title: string; avatar: AvatarConfig | null; mainSkill: string; joinedAt: string | null; squads: { id: string; name: string; color: string }[] };
  isOwn: boolean; isManager: boolean; powerUps: PU[];
  skillsSummary: { total: number; top: { name: string; self: number }[]; avg: number; rated: number };
  studySummary: { total: number; active: number; latest: { title: string; type: string; pct: number } | null };
  deliverySummary: { total: number; delivered: number; paused: number; latest: { title: string } | null };
  journeySummary: { total: number; goals: number; avg: number; first: string | null }; healthSummary: { avg: number; cycle: string } | null;
  eventSummary: { total: number; last: { title: string; type: string } | null };
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

  // Barra fixa: aparece quando a seção de decks passa de 140 px do topo (PRD M6, Coops06/07)
  useEffect(() => {
    const on = () => { const top = decksRef.current?.getBoundingClientRect().top ?? 999; setSticky(top < 140); };
    on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on);
  }, []);

  const removePU = async (id: string) => { if (!window.confirm('Remover este power up?')) return; await fetch(`/api/people/${person.id}/powerups/${id}`, { method: 'DELETE' }); refresh(); };
  const mono = (size: number, ls = '0.08em') => ({ fontFamily: "'JetBrains Mono', monospace", fontSize: size, letterSpacing: ls }) as const;
  const frontBase = { position: 'absolute', left: 0, top: 24, right: 22, height: 340, boxSizing: 'border-box', borderRadius: 22, color: '#0E0E12', textDecoration: 'none', border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 16px 36px rgba(0,0,0,0.45)' } as const;
  const layer = (bg: string, left: number, top: number, right: number, rot: number, cls: string) => <div className={cls} aria-hidden="true" style={{ position: 'absolute', left, top, right, height: 340, borderRadius: 22, background: bg, border: '2px solid #0E0E12', transform: `rotate(${rot}deg)` }} />;
  /** Pilha de cartas do protótipo: carta da frente + até duas camadas atrás. */
  const pile = (href: string, aria: string, bg: string, layers: { b2?: string; b1?: string }, icon: ReactNode, big: string, bigLabel: string, kids: ReactNode) => (
    <div className="coops-pile" style={{ position: 'relative', height: 380 }}>
      {layers.b2 && layer(layers.b2, 22, 0, 0, 5, 'coops-b2')}
      {layers.b1 && layer(layers.b1, 12, 10, 10, layers.b2 ? 2.5 : 3, 'coops-b1')}
      <CoopsLink href={href} className="coops-front" aria-label={aria} style={{ ...frontBase, background: bg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>{icon}<span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}>{big}</span><span style={mono(11, '0')}>{bigLabel}</span></span></div>
        {kids}
      </CoopsLink>
    </div>
  );
  const kicker = (t: string) => <span style={{ ...mono(11), marginTop: 'auto' }}>{t}</span>;
  const title = (t: string) => <span style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.2 }}>{t}</span>;
  const rule = (t: string) => <span style={{ fontSize: 13, borderTop: '1.5px solid #0E0E12', paddingTop: 10 }}>{t}</span>;
  const dec = (n: number) => n.toFixed(1).replace('.', ',');
  const squadLine = person.squads.length ? person.squads.map((q) => q.name.toUpperCase()).join(' · ') : project.name.toUpperCase();
  const chips = [['-156px', '-12px', '-16deg', '0ms', '#A9D8F5', '0ms'], ['-128px', '48px', '-6deg', '50ms', '#F3D36B', '180ms'], ['-118px', '-72px', '-24deg', '100ms', '#8FE3C8', '360ms'], ['128px', '-52px', '12deg', '150ms', '#F5A9D6', '540ms'], ['126px', '62px', '20deg', '200ms', '#FF8A5B', '720ms'], ['172px', '22px', '8deg', '250ms', '#D9CFFF', '900ms']];
  const pillTenure = person.joinedAt ? tenureLong(person.joinedAt) : null;
  const pillMain = person.mainSkill ? `Skill principal · ${person.mainSkill}` : null;
  const back = isManager && !isOwn ? { href: `/p/${project.id}/time`, text: '← Time' } : { href: '/hub', text: '← Hub de projetos' };
  const barCta = isOwn ? { href: `${base}/saude`, text: 'Fazer check-in' } : { href: `${base}/eventos`, text: '+ Check-in' };

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 56px' }}>
      <div id="mb-bar" className={sticky ? 'on' : undefined} role="region" aria-label={`Resumo do perfil de ${person.name}`} aria-hidden={!sticky}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#B7A6FF', color: '#0E0E12', borderBottom: '2px solid #0E0E12', padding: '10px max(16px, calc((100% - 1216px) / 2))', boxShadow: '0 14px 34px rgba(0,0,0,0.45)' }}>
          <span className="mb-av" style={{ flex: 'none', width: 48, height: 48, borderRadius: '50%', border: '2px solid #0E0E12', background: '#F5F2EC', overflow: 'hidden', lineHeight: 0, boxSizing: 'border-box' }}><Avatar {...cfg} bg="#F5F2EC" size={44} label="" /></span>
          <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}><span style={mono(10)}>{isOwn ? 'MEU PERFIL' : `SQUAD ${squadLine}`}</span><span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{person.name}</span><span style={{ fontSize: 12 }}>{person.title || 'Sem cargo'}</span></span>
          <span className="mb-hide" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginLeft: 6 }}>
            {pillMain && <span style={{ fontSize: 12, fontWeight: 600, background: '#F3D36B', border: '1.5px solid #0E0E12', borderRadius: 999, padding: '5px 10px' }}>{pillMain}</span>}
            {pillTenure && <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F2EC', background: '#0E0E12', borderRadius: 999, padding: '5px 10px' }}>{pillTenure}</span>}
          </span>
          <span aria-hidden="true" style={{ flex: '1 1 auto' }} />
          <CoopsLink href={barCta.href} className="coops-card mb-btn" style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', fontWeight: 600, fontSize: 14, color: '#F5F2EC', background: '#0E0E12', borderRadius: 12, minHeight: 44, boxSizing: 'border-box', padding: '0 16px', textDecoration: 'none' }}>{barCta.text}</CoopsLink>
        </div>
      </div>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <CoopsLink href={back.href} style={{ fontSize: 14, color: '#A3A1AD', textDecoration: 'none', alignSelf: 'flex-start', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{back.text}</CoopsLink>

        <section className="h06" aria-label={`Perfil de ${person.name}`} style={{ position: 'relative', overflow: 'hidden', borderRadius: 36, background: '#B7A6FF', color: '#0E0E12', border: '2px solid #0E0E12', padding: '44px 28px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
          <div className="h06-ring" aria-hidden="true" style={{ position: 'absolute', left: -60, top: -60, width: 220, height: 220, borderRadius: '50%', border: '1.5px solid rgba(14,14,18,0.25)' }} />
          <div className="h06-ring h06-ring2" aria-hidden="true" style={{ position: 'absolute', right: -80, bottom: -90, width: 280, height: 280, borderRadius: '50%', border: '1.5px solid rgba(14,14,18,0.25)' }} />
          <span style={{ position: 'relative', ...mono(12, '0.1em') }}>{isOwn ? `MEU PERFIL · ${person.squads.length ? `SQUAD ${squadLine}` : squadLine}` : person.squads.length ? `SQUAD ${squadLine}` : squadLine}</span>
          <div className="h06-stage" style={{ position: 'relative' }}>
            {chips.map(([x, y, r, d, c, ad], i) => <span key={i} className="h06-chip" aria-hidden="true" style={{ '--x': x, '--y': y, '--r': r, '--d': d } as React.CSSProperties}><span className="h06-chipin" style={{ background: c, animationDelay: ad }} /></span>)}
            <div className="h06-av" style={{ position: 'relative', zIndex: 1, borderRadius: '50%', border: '2px solid #0E0E12', boxShadow: '8px 8px 0 #0E0E12', lineHeight: 0 }}><Avatar {...cfg} bg="#F5F2EC" size={168} label={person.name} /></div>
          </div>
          <h1 style={{ position: 'relative', margin: '10px 0 0', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>{person.name}</h1>
          <span style={{ position: 'relative', fontSize: 18 }}>{person.title || 'Sem cargo ainda'}</span>
          <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 4 }}>
            {pillMain && <span className="h06-pill" style={{ fontSize: 14, fontWeight: 600, color: '#0E0E12', background: '#F3D36B', border: '1.5px solid #0E0E12', borderRadius: 999, padding: '7px 14px' }}>{pillMain}</span>}
            {pillTenure && <span className="h06-pill h06-pill2" style={{ fontSize: 14, fontWeight: 600, color: '#F5F2EC', background: '#0E0E12', borderRadius: 999, padding: '8px 14px' }}>{pillTenure}</span>}
          </div>
        </section>

        <section aria-label="Power ups" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}><h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Power ups</h2><span style={{ fontSize: 14, color: '#A3A1AD' }}>Mentorias, cursos e projetos paralelos</span></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {powerUps.map((u) => (
              <div key={u.id} className="coops-pu" tabIndex={0} style={{ flex: '1 1 260px', borderRadius: 18, background: '#17171D', border: '1px solid #2C2C36', padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
                <span className="pu-tile" aria-hidden="true" style={{ flex: '0 0 44px', height: 44, borderRadius: 12, background: '#8FE3C8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path className="pu-spk" d="M3.5 5.5 6 7" /><path className="pu-spk pu-spk2" d="M20.5 3.5 18.5 6" /><path className="pu-spk pu-spk3" d="M21 17.5 18.5 16.5" /><path className="pu-spk pu-spk4" d="M3 18.5 5.5 17" /><path className="pu-bolt" d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>
                </span>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ ...mono(10), color: '#8FE3C8' }}>{TYPE_LABEL[u.type] ?? u.type}{u.skill ? ` · ${u.skill.toUpperCase()}` : ''}</span>
                  <span style={{ fontWeight: 600 }}>{u.name}</span>
                  {u.type === 'MENTORIA' ? <span style={{ fontSize: 13, color: '#A3A1AD' }}>{u.frequency || 'Sem frequência'}</span> : <div aria-hidden="true" style={{ height: 6, borderRadius: 3, background: '#2C2C36' }}><div style={{ width: `${u.progress}%`, height: 6, borderRadius: 3, background: '#8FE3C8' }} /></div>}
                </div>
                {u.type !== 'MENTORIA' && <span style={{ ...mono(12, '0') }}>{u.progress}%</span>}
                <button type="button" aria-label={`Remover ${u.name}`} onClick={() => removePU(u.id)} style={{ width: 44, height: 44, margin: '-8px -8px -8px 0', border: 0, background: 'transparent', cursor: 'pointer', color: '#A3A1AD', flex: 'none' }}>✕</button>
              </div>
            ))}
            {powerUps.length === 0 && (
              <div style={{ flex: '1 1 260px', display: 'flex', gap: 12, alignItems: 'center', borderRadius: 18, border: '1.5px dashed #4A4858', padding: '16px 18px' }}>
                <span aria-hidden="true" style={{ flex: '0 0 40px', height: 40, borderRadius: 12, border: '1.5px dashed #8FE3C8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8FE3C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg></span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontWeight: 600 }}>Nenhum power up ainda</span><span style={{ fontSize: 14, color: '#A3A1AD' }}>Cursos e mentorias em andamento aparecem aqui.</span></span>
              </div>
            )}
            <button type="button" onClick={() => setDeck(true)} style={{ fontFamily: 'inherit', flex: '0 1 200px', minHeight: 76, borderRadius: 18, background: 'transparent', border: '1.5px dashed #4A4858', color: '#F5F2EC', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>+ Power up</button>
          </div>
        </section>

        <section id="mb-decks" ref={decksRef} aria-label={`Decks de ${fn}`} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}><h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{isOwn ? 'Meus decks' : `Decks da ${fn}`}</h2><span style={{ fontSize: 14, color: '#A3A1AD' }}>Toque num deck para abrir as cartas</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 28 }}>
            {pile(`${base}/saude`, 'Abrir o deck de Saúde', '#A9D8F5', { b2: '#4F8DB3', b1: '#7FB8DD' }, <PiSaude />, healthSummary ? dec(healthSummary.avg) : '—', 'MÉDIA / 5', <>
              {kicker('SAÚDE · CHECK-IN')}{title(healthSummary ? 'Último check-in' : 'Sem check-in ainda')}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, lineHeight: 1.45 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>Só a pessoa e o manager veem</span>
              {rule(healthSummary ? `Ciclo ${healthSummary.cycle}` : 'Quatro perguntas, uma por dimensão')}
            </>)}
            {pile(`${base}/eventos`, 'Abrir o deck de Eventos', '#B7A6FF', { b2: '#4B36B0', b1: '#8B74F2' }, <PiEventos />, String(eventSummary.total), plural(eventSummary.total, 'CARTA', 'CARTAS'), <>
              {kicker(eventSummary.last ? `EVENTOS · ${eventSummary.last.type.replace('_', ' ')}` : 'EVENTOS')}{title(eventSummary.last?.title ?? 'Nenhum evento ainda')}
              {rule('Check-ins, feedbacks, promoções e méritos')}
            </>)}
            {pile(`${base}/skills`, 'Abrir o deck de Skills', '#F3D36B', { b2: '#B8962F', b1: '#D9B84B' }, <PiSkills />, skillsSummary.rated ? dec(skillsSummary.avg) : '—', 'MÉDIA / 5', <>
              {kicker('SKILLS')}
              {skillsSummary.top.length > 0 && <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>{skillsSummary.top.map((sk) => <span key={sk.name} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{sk.name}</span><span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{'●'.repeat(sk.self)}{'○'.repeat(5 - sk.self)}</span></span>)}</div>}
              {rule(`${skillsSummary.total} ${plural(skillsSummary.total, 'skill do projeto', 'skills do projeto')} · ${isOwn ? 'autoavaliação' : 'ver notas'}`)}
            </>)}
            {pile(`${base}/brain-gym`, 'Abrir o deck de Brain gym', '#F5A9D6', { b1: '#D884B6' }, <PiBrain />, String(studySummary.active), 'ESTUDANDO', <>
              {kicker(studySummary.latest ? `BRAIN GYM · ${STUDY_LABEL[studySummary.latest.type] ?? ''}` : 'BRAIN GYM')}{title(studySummary.latest?.title ?? 'Nada no deck ainda')}
              {studySummary.latest && <div aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 3 }}>{Array.from({ length: 10 }, (_, i) => <span key={i} style={{ height: 14, borderRadius: 4, border: '1.5px solid #0E0E12', ...(i < Math.round(studySummary.latest!.pct / 10) ? { background: '#0E0E12' } : {}) }} />)}</div>}
              {rule(studySummary.latest ? `${studySummary.latest.pct}% · ${studySummary.total} ${plural(studySummary.total, 'conteúdo', 'conteúdos')}` : 'Livros, cursos e vídeos ligados às suas skills')}
            </>)}
            {pile(`${base}/jornada`, 'Abrir o deck de Jornada', '#FF8A5B', {}, <PiJornada />, journeySummary.goals ? `${journeySummary.avg}%` : String(journeySummary.total), journeySummary.goals ? 'DO CICLO' : plural(journeySummary.total, 'CARTA', 'CARTAS'), <>
              {kicker('JORNADA · OBJETIVOS')}{title(journeySummary.first ?? 'Jornada do ciclo vazia')}
              {rule(`${journeySummary.total} ${plural(journeySummary.total, 'carta', 'cartas')} no ciclo`)}
            </>)}
            {pile(`${base}/entregas`, 'Abrir o deck de Entregas', '#8FE3C8', { b1: '#5FC4A6' }, <PiEntregas />, String(deliverySummary.delivered), plural(deliverySummary.delivered, 'ENTREGUE', 'ENTREGUES'), <>
              {kicker('ENTREGAS')}{title(deliverySummary.latest?.title ?? 'Nenhuma entrega ainda')}
              {rule(`${deliverySummary.total} ${plural(deliverySummary.total, 'entrega', 'entregas')}${deliverySummary.paused ? ` · ${deliverySummary.paused} ${plural(deliverySummary.paused, 'pausada', 'pausadas')}` : ''}`)}
            </>)}
          </div>
        </section>
      </div>
      {deck && <PowerUpDeck personId={person.id} personName={person.name} skills={project.skills} draft={draft} onDraftChange={setDraft} onClose={() => setDeck(false)} onSaved={() => { setDeck(false); refresh(); }} />}
    </div>
  );
}
