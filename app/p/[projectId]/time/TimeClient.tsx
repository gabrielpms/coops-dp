'use client';
import { useState } from 'react';
import { AppHeader, DEFAULT_AVATAR } from '@/components/ds/AppHeader';
import { Avatar, type AvatarConfig } from '@/components/avatar/Avatar';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { CoopsLink, useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { MemberDeck, type MemberDraft } from '@/components/team/MemberDeck';
import { SquadDeck, type SquadDraft } from '@/components/team/SquadDeck';
import { label } from '@/components/ds/tokens';

export type TimePerson = { id: string; name: string; title: string; avatar: AvatarConfig | null; mainSkill: string; joinedAt: string | null; isMe: boolean; invited: boolean; squadIds: string[] };
export type TimeSquad = { id: string; name: string; color: string; members: { personId: string; crown: boolean }[] };

/** Tempo de casa: "3m" até 11 meses, "2a" depois. */
function tenure(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso), now = new Date();
  const m = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
  return m < 1 ? '<1m' : m < 12 ? `${m}m` : `${Math.floor(m / 12)}a`;
}

export function TimeClient({ user, project, persons, squads, memberDraft: md0, squadDraft: sd0 }: {
  user: { id: string; name: string; email: string; role: 'IC' | 'MANAGER'; avatar: any }; project: { id: string; name: string; skills: string[] };
  persons: TimePerson[]; squads: TimeSquad[]; memberDraft: MemberDraft | null; squadDraft: SquadDraft | null;
}) {
  const { refresh } = useCoopsRouter();
  const [filter, setFilter] = useState<string>('todos');
  const [deck, setDeck] = useState<'member' | 'squad' | null>(null);
  const [memberDraft, setMemberDraft] = useState(md0);
  const [squadDraft, setSquadDraft] = useState(sd0);

  const hasOthers = persons.some((p) => !p.isMe);
  const noSquads = squads.length === 0;
  const shown = filter === 'todos' ? persons : persons.filter((p) => p.squadIds.includes(filter));
  const squadName = (id: string) => squads.find((s) => s.id === id)?.name ?? '';
  const closeAndRefresh = () => { setDeck(null); refresh(); };
  const btnPrimary = { fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#0E0E12', background: '#B7A6FF', border: 0, borderRadius: 14, minHeight: 48, padding: '0 18px', cursor: 'pointer' } as const;

  const emptyPanel = (key: string, tag: string, title: string, text: string, cta: string, onClick: () => void, visual: React.ReactNode) => (
    <div key={key} style={{ flex: '1 1 420px', borderRadius: 30, background: '#17171D', border: '1px solid #2C2C36', padding: 32, display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
      <div aria-hidden="true" style={{ flex: '0 0 auto' }}>{visual}</div>
      <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ ...label(11, '0.06em'), color: '#B7A6FF' }}>{tag}</span>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{title}</h2>
        <p style={{ margin: 0, fontSize: 15, color: '#A3A1AD', lineHeight: 1.5 }}>{text}</p>
        <button type="button" onClick={onClick} style={{ ...btnPrimary, alignSelf: 'flex-start', fontSize: 15 }}>{cta}</button>
      </div>
    </div>
  );
  const dashedCard = (children: React.ReactNode, dash = '#4A4858') => <div style={{ position: 'relative', width: 130, height: 180, borderRadius: 20, border: `2px dashed ${dash}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>;

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <CoopsLink href="/hub" style={{ fontSize: 14, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>← Todos os projetos</CoopsLink>
            <span style={{ ...label(12, '0.1em'), color: '#B7A6FF' }}>GESTÃO DE TIME · {project.name.toUpperCase()}</span>
            <h1 style={{ margin: 0, fontSize: 'clamp(36px, 6vw, 48px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1 }}>Seu time, em cartas</h1>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setDeck('squad')} style={{ ...btnPrimary, color: '#F5F2EC', background: 'transparent', border: '1.5px solid #4A4858' }}>+ Squad</button>
            <button type="button" onClick={() => setDeck('member')} style={btnPrimary}>+ Membro</button>
          </div>
        </div>

        {(!hasOthers || noSquads) && (
          <section aria-label="Primeiros passos do time" style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {!hasOthers && emptyPanel('p', 'GESTÃO DE TIME · SEM CONVIDADOS', 'Seu time ainda não tem cartas', 'Adicione pessoas, monte o avatar delas e envie o convite por e-mail. Cada pessoa ganha os próprios decks.', '+ Convidar primeira pessoa', () => setDeck('member'),
              <div style={{ position: 'relative', width: 170, height: 210 }}>
                <div style={{ position: 'absolute', left: 30, top: 0, width: 130, height: 180, borderRadius: 20, border: '2px dashed #4A4858', transform: 'rotate(8deg)' }} />
                <div style={{ position: 'absolute', left: 14, top: 10, width: 130, height: 180, borderRadius: 20, border: '2px dashed #6E6C7A', transform: 'rotate(3deg)' }} />
                <div style={{ position: 'absolute', left: 0, top: 24, width: 130, height: 180, borderRadius: 20, background: '#0E0E12', border: '2px dashed #B7A6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Avatar skin="#FFFFFF" hairStyle="careca" bg="#2C2C36" size={84} label="Avatar vazio" /></div>
              </div>)}
            {noSquads && emptyPanel('s', 'SQUADS · NENHUM', 'Nenhum squad ainda', 'Squads reúnem quem trabalha junto na mesma frente. Crie o primeiro, escolha uma cor e coloque as pessoas nele.', '+ Criar primeiro squad', () => setDeck('squad'),
              dashedCard(<svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#B7A6FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3"><circle cx="22" cy="20" r="7" /><circle cx="44" cy="22" r="6" /><path d="M8 50c1-10 7-15 14-15s13 5 14 15M34 50c1-8 5-12 10-12s9 4 10 12" /></svg>, '#B7A6FF'))}
          </section>
        )}

        <div role="tablist" aria-label="Squads" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[{ id: 'todos', name: 'Todos', color: '', n: persons.length }, ...squads.map((s) => ({ id: s.id, name: s.name, color: s.color, n: s.members.length }))].map((t) => {
            const on = filter === t.id;
            return (
              <button key={t.id} type="button" role="tab" aria-selected={on} onClick={() => setFilter(t.id)} style={{ fontFamily: 'inherit', fontWeight: on ? 600 : 400, fontSize: 14, color: on ? '#0E0E12' : '#F5F2EC', background: on ? '#F5F2EC' : 'transparent', border: on ? 0 : '1px solid #4A4858', borderRadius: 999, minHeight: 44, padding: '0 16px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {t.color && <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, border: '1.5px solid #0E0E12' }} />}{t.name} · {t.n}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(196px, 1fr))', gap: 20 }}>
          {filter === 'todos' && squads.map((s) => {
            const ppl = s.members.map((m) => persons.find((p) => p.id === m.personId)).filter(Boolean) as TimePerson[];
            return (
              <CoopsLink key={s.id} className="coops-m" href={`/p/${project.id}/squads/${s.id}`} aria-label={`Abrir a mesa do time ${s.name}`} style={{ color: '#0E0E12', textDecoration: 'none', borderRadius: 24, background: '#B7A6FF', border: '2px solid #0E0E12', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 360, boxShadow: '6px 6px 0 #4B36B0' }}>
                <div style={{ padding: '14px 16px 0', display: 'flex', justifyContent: 'space-between', ...label(11, '0.06em') }}><span>MESA DO TIME</span><span>{ppl.length} {ppl.length === 1 ? 'PESSOA' : 'PESSOAS'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: 170 }} aria-hidden="true">
                  {ppl.length === 0 ? <span style={{ width: 120, height: 120, borderRadius: '50%', border: '2px dashed #0E0E12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, textAlign: 'center', padding: 12 }}>Sem pessoas ainda</span>
                    : ppl.slice(0, 4).map((p, i) => <span key={p.id} style={{ lineHeight: 0, marginLeft: i ? -22 : 0, borderRadius: '50%', border: '2px solid #0E0E12', boxShadow: '0 3px 0 #4B36B0', position: 'relative', zIndex: 4 - i }}><Avatar {...(p.avatar ?? DEFAULT_AVATAR_CFG)} size={64} label="" /></span>)}
                </div>
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 4 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, display: 'inline-flex', alignItems: 'center', gap: 8 }}><span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, border: '2px solid #0E0E12' }} />{s.name}</span>
                  <span style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#F5F2EC', background: '#0E0E12', borderRadius: 999, padding: '7px 12px' }}>Sentar à mesa →</span>
                </div>
              </CoopsLink>
            );
          })}
          {shown.map((p) => {
            const cfg = p.isMe ? { ...DEFAULT_AVATAR_CFG, ...(user.avatar ?? DEFAULT_AVATAR) } : { ...DEFAULT_AVATAR_CFG, ...(p.avatar ?? {}) }; // o dono usa o mesmo avatar do cabeçalho
            return (
              <CoopsLink key={p.id} className="coops-m" href={`/p/${project.id}/pessoas/${p.id}`} aria-label={`Abrir ${p.name}`} style={{ color: '#F5F2EC', textDecoration: 'none', borderRadius: 24, background: '#17171D', border: '1.5px solid #2C2C36', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 360 }}>
                <div style={{ background: cfg.bg, padding: '16px 16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, borderBottom: '1.5px solid #0E0E12' }}>
                  <span style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'space-between', gap: 8, ...label(11, '0'), color: '#0E0E12' }}>
                    <span>{(p.squadIds[0] ? squadName(p.squadIds[0]) : 'SEM SQUAD').toUpperCase()}</span><span>{p.isMe ? 'VOCÊ' : tenure(p.joinedAt)}</span>
                  </span>
                  <span className="coops-av"><Avatar {...cfg} size={150} label={p.name} /></span>
                </div>
                <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 4 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.15 }}>{p.name}</span>
                  <span style={{ fontSize: 14, color: '#A3A1AD' }}>{p.title || 'Sem cargo ainda'}</span>
                  {p.mainSkill && <span style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: '#0E0E12', background: '#F3D36B', borderRadius: 999, padding: '5px 10px' }}>{p.mainSkill}</span>}
                  {p.invited && <span style={{ marginTop: 8, ...label(10, '0.06em'), color: '#FFC2A6', border: '1.5px dashed #FFC2A6', borderRadius: 999, padding: '4px 8px' }}>CONVITE ENVIADO</span>}
                  <span role="img" aria-label="4 decks" style={{ marginTop: 'auto', paddingTop: 14, display: 'flex', gap: 4 }}>{['#B7A6FF', '#F3D36B', '#F5A9D6', '#FF8A5B'].map((c) => <span key={c} style={{ width: 10, height: 14, borderRadius: 3, background: c }} />)}</span>
                </div>
              </CoopsLink>
            );
          })}
          <button type="button" onClick={() => setDeck('member')} className="tw-add" style={{ fontFamily: 'inherit', minHeight: 360, borderRadius: 24, background: 'transparent', border: '1.5px dashed #4A4858', color: '#F5F2EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer' }}>
            <span style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #4A4858', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></span>
            <span style={{ fontSize: 17, fontWeight: 600 }}>Adicionar membro</span>
            <span style={{ fontSize: 13, color: '#A3A1AD' }}>Monte o avatar e envie o convite</span>
          </button>
        </div>
      </div>
      {deck === 'member' && <MemberDeck projectId={project.id} skills={project.skills} draft={memberDraft} onDraftChange={setMemberDraft} onClose={() => setDeck(null)} onSaved={closeAndRefresh} />}
      {deck === 'squad' && <SquadDeck projectId={project.id} persons={persons.map((p) => ({ id: p.id, name: p.name, title: p.title, avatar: p.avatar }))} draft={squadDraft} onDraftChange={setSquadDraft} onClose={() => setDeck(null)} onSaved={closeAndRefresh} />}
    </div>
  );
}
