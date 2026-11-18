'use client';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import { Avatar, type AvatarConfig } from '@/components/avatar/Avatar';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { CoopsLink, useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { AddToSquadSheet, type Candidate } from '@/components/team/AddToSquadSheet';
import { MemberDeck, type MemberDraft } from '@/components/team/MemberDeck';
import { DECK_META, type SquadDeckId } from '@/components/squad/types';
import { mono } from '@/components/ds/tokens';
import { plural } from '@/lib/format';

import { COL, ICP, SUB, type DeckDef, type Part } from '@/components/squad/deckIcons';
const ORDER: SquadDeckId[] = ['DESAFIO', 'FRENTE', 'ESTRATEGIA', 'INDICADOR', 'ALAVANCA'];
const STAGE_AV: { left: number; top: number; size: number; cls: string }[] = [{ left: 10, top: 78, size: 95, cls: 'h17-av h17-av1' }, { left: 135, top: -2, size: 110, cls: 'h17-av h17-av2' }, { left: 275, top: 78, size: 95, cls: 'h17-av h17-av3' }];
const CARDS = [['#FF8A5B', 72, -16, -20, 0], ['#F5A9D6', 118, -8, -10, 40], ['#B7A6FF', 164, 0, 0, 80], ['#F3D36B', 210, 8, 10, 120], ['#C9F0B8', 256, 16, 20, 160]] as const;

export function SquadHomeClient({ user, projectId, squad, isManager, people, counts, cycle, healthAvg, healthN, candidates, skills, memberDraft: md0 }: {
  /** pessoas do projeto que ainda não estão neste squad (só o manager recebe) */ candidates: Candidate[]; skills: string[]; memberDraft: MemberDraft | null;
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; projectId: string; squad: { id: string; name: string; color: string; description?: string }; isManager: boolean;
  people: { id: string; name: string; title: string; avatar: AvatarConfig | null; crown: boolean }[]; counts: Record<SquadDeckId, number>; cycle: string; healthAvg: number | null; healthN: number;
}) {
  const { refresh } = useCoopsRouter();
  const [add, setAdd] = useState<null | 'choice' | 'member'>(null);
  const [memberDraft, setMemberDraft] = useState(md0);
  const base = `/p/${projectId}/squads/${squad.id}`;
  const decks: (DeckDef & { count: string; label: string; foot: string })[] = [
    ...ORDER.map((d) => { const m = DECK_META[d]; const [b1, b2] = COL[m.slug]; return { key: m.slug, href: `${base}/${m.slug}`, title: m.title, sub: SUB[m.slug], bg: m.color, b1, b2, parts: ICP[m.slug], kicker: m.title.toUpperCase(), count: String(counts[d]).padStart(2, '0'), label: plural(counts[d], 'CARTA', 'CARTAS'), foot: counts[d] ? `${counts[d]} ${plural(counts[d], 'aberto', 'abertos')}` : m.empty }; }),
    { key: 'saude', href: `${base}/saude`, title: 'Saúde do time', sub: SUB.saude, bg: '#A9D8F5', b1: COL.saude[0], b2: COL.saude[1], parts: ICP.saude, kicker: 'SAÚDE DO TIME', count: healthAvg !== null ? healthAvg.toFixed(1).replace('.', ',') : '—', label: 'MÉDIA DO TIME', foot: healthAvg !== null ? `Média de ${healthN} pessoas · 4 perguntas` : 'A média aparece a partir de 3 respostas' },
  ];
  const stage = [...people].sort((a, b) => Number(b.crown) - Number(a.crown));
  // o champion/coroa fica no centro da vitrine
  const top3 = stage.length >= 3 ? [stage[1], stage[0], stage[2]] : stage.length === 2 ? [stage[1], stage[0]] : stage;
  const mgr = people.filter((p) => p.crown).length;
  const layer = (bg: string, left: number, top: number, right: number, rot: number, cls: string) => <div className={cls} aria-hidden="true" style={{ position: 'absolute', left, top, right, height: 340, borderRadius: 22, background: bg, border: '2px solid #0E0E12', transform: `rotate(${rot}deg)` }} />;
  const front: CSSProperties = { position: 'absolute', left: 0, top: 24, right: 22, height: 340, boxSizing: 'border-box', borderRadius: 22, color: '#0E0E12', textDecoration: 'none', border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 16px 36px rgba(0,0,0,0.45)' };
  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <CoopsLink href={isManager ? `/p/${projectId}/time` : '/hub'} style={{ fontSize: 14, color: '#A3A1AD', textDecoration: 'none', alignSelf: 'flex-start', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{isManager ? '← Seu time' : '← Hub de projetos'}</CoopsLink>
        <section className="h17" aria-label={squad.name} style={{ position: 'relative', overflow: 'hidden', borderRadius: 36, background: '#B7A6FF', color: '#0E0E12', border: '2px solid #0E0E12', padding: '44px 28px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
          <div className="h17-ring" aria-hidden="true" style={{ position: 'absolute', left: -60, top: -60, width: 220, height: 220, borderRadius: '50%', border: '1.5px solid rgba(14,14,18,0.25)' }} />
          <div className="h17-ring h17-ring2" aria-hidden="true" style={{ position: 'absolute', right: -80, bottom: -90, width: 280, height: 280, borderRadius: '50%', border: '1.5px solid rgba(14,14,18,0.25)' }} />
          <span style={{ position: 'relative', ...mono, fontSize: 12, letterSpacing: '0.1em' }}>MESA DO TIME · SQUAD</span>
          <div style={{ position: 'relative', marginTop: 8 }}>
            <div aria-hidden="true" style={{ position: 'relative', width: 380, maxWidth: '100%', height: 372, flex: 'none' }}>
              <span style={{ position: 'absolute', left: 48, top: 82, width: 285, height: 285, boxSizing: 'border-box', borderRadius: '50%', background: '#8B74F2', border: '2px solid #0E0E12' }} />
              <span className="h17-top" style={{ position: 'absolute', left: 48, top: 68, width: 285, height: 285, boxSizing: 'border-box', borderRadius: '50%', background: '#F5F2EC', border: '2px solid #0E0E12' }} />
              {top3.map((p, i) => { const a = STAGE_AV[(top3.length >= 3 ? [0, 1, 2] : top3.length === 2 ? [0, 2] : [1])[i]]; return (
                <div key={p.id} className={a.cls} style={{ position: 'absolute', left: a.left, top: a.top, zIndex: 2, lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12', boxShadow: '0 8px 0 #4B36B0' }}><Avatar {...DEFAULT_AVATAR_CFG} {...(p.avatar ?? {})} crown={p.crown} size={a.size} label="" /></div>); })}
              {CARDS.map(([bg, left, r, x, d]) => <span key={left} className="h17-card" style={{ ['--r' as string]: `${r}deg`, ['--x' as string]: `${x}px`, ['--d' as string]: `${d}ms`, position: 'absolute', left, top: 218, zIndex: 1, width: 49, height: 65, boxSizing: 'border-box', borderRadius: 10, background: bg, border: '2px solid #0E0E12', transform: 'rotate(var(--r))' } as CSSProperties} />)}
            </div>
          </div>
          <h1 style={{ position: 'relative', margin: '10px 0 0', fontSize: 'clamp(36px, 7vw, 56px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>{squad.name}</h1>
          {squad.description && <span style={{ position: 'relative', fontSize: 18, maxWidth: 560 }}>{squad.description}</span>}
          <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#F5F2EC', background: '#0E0E12', borderRadius: 999, padding: '8px 14px' }}>{people.length} {plural(people.length, 'pessoa', 'pessoas')}{mgr ? ` · ${mgr} champion` : ''}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0E0E12', background: '#F5F2EC', border: '1.5px solid #0E0E12', borderRadius: 999, padding: '7px 14px' }}>Ciclo {cycle.split('-')[1]} {cycle.split('-')[0]}</span>
            {isManager && <button type="button" onClick={() => setAdd('choice')} className="coops-card" style={{ fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#0E0E12', background: 'transparent', border: '1.5px dashed #0E0E12', borderRadius: 999, minHeight: 44, padding: '0 16px', cursor: 'pointer' }}>+ Adicionar pessoa</button>}
            <span style={{ fontSize: 14, color: 'rgba(14,14,18,0.78)', padding: '8px 4px' }}>{isManager ? 'você edita os decks do squad' : 'você vê como time; só o manager edita'}</span>
          </div>
        </section>
        <section aria-label="Decks do squad" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}><h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Decks do squad</h2><span style={{ fontSize: 14, color: '#A3A1AD', display: 'inline-flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>Escolha um deck para ver as cartas<CoopsLink href={`${base}/ciclos`} style={{ fontWeight: 600, color: '#B7A6FF', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Histórico de ciclos →</CoopsLink></span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 28 }}>
            {decks.map((d) => (
              <div key={d.key} className="coops-pile" style={{ position: 'relative', height: 380 }}>
                {layer(d.b2, 22, 0, 0, 5, 'coops-b2')}{layer(d.b1, 12, 10, 10, 2.5, 'coops-b1')}
                <CoopsLink href={d.href} className="coops-front" aria-label={`Abrir ${d.title}`} style={{ ...front, background: d.bg }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ overflow: 'visible' }}>{d.parts.map(([c, dd], i) => <path key={i} className={c || undefined} d={dd} />)}</svg>
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}>{d.count}</span><span style={{ ...mono, fontSize: 11 }}>{d.label}</span></span>
                  </div>
                  <span style={{ marginTop: 'auto', ...mono, fontSize: 11, letterSpacing: '0.08em' }}>{d.kicker}</span>
                  <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>{d.sub}</span>
                  <span style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 10, fontSize: 13, lineHeight: 1.4 }}>{d.foot}</span>
                </CoopsLink>
              </div>
            ))}
          </div>
        </section>
      </div>
      {add === 'choice' && <AddToSquadSheet projectId={projectId} squad={squad} candidates={candidates} onNew={() => setAdd('member')} onClose={() => setAdd(null)} onSaved={() => { setAdd(null); refresh(); }} />}
      {add === 'member' && <MemberDeck projectId={projectId} skills={skills} lockedSquad={{ id: squad.id, name: squad.name }} draft={memberDraft} onDraftChange={setMemberDraft} onClose={() => setAdd(null)} onSaved={() => { setAdd(null); refresh(); }} />}
    </div>
  );
}
