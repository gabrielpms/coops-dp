'use client';
import { useState } from 'react';
import { AppHeader, DEFAULT_AVATAR } from '@/components/ds/AppHeader';
import { Avatar, type AvatarConfig } from '@/components/avatar/Avatar';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { CoopsLink, useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { MemberDeck, type MemberDraft } from '@/components/team/MemberDeck';
import { SquadDeck, type SquadDraft } from '@/components/team/SquadDeck';
import { label } from '@/components/ds/tokens';
import { SquadTableCard } from '@/components/team/SquadTableCard';
import { PersonCard } from '@/components/team/PersonCard';

export type TimePerson = { id: string; name: string; title: string; avatar: AvatarConfig | null; mainSkill: string; joinedAt: string | null; isMe: boolean; invited: boolean; squadIds: string[] };
export type TimeSquad = { id: string; name: string; color: string; description?: string; members: { personId: string; crown: boolean }[] };

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
    <div key={key} className="ep" style={{ flex: '1 1 420px', borderRadius: 30, background: '#17171D', border: '1px solid #2C2C36', padding: 32, display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
      <div aria-hidden="true" className="ep-visual" style={{ flex: '0 0 auto' }}>{visual}</div>
      <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ ...label(11, '0.06em'), color: '#B7A6FF' }}>{tag}</span>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{title}</h2>
        <p style={{ margin: 0, fontSize: 15, color: '#A3A1AD', lineHeight: 1.5 }}>{text}</p>
        <button type="button" onClick={onClick} style={{ ...btnPrimary, alignSelf: 'flex-start', fontSize: 15 }}>{cta}</button>
      </div>
    </div>
  );
  const dashedCard = (children: React.ReactNode, dash = '#4A4858') => <div className="ep-dash" style={{ position: 'relative', width: 130, height: 180, borderRadius: 20, border: `2px dashed ${dash}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>;

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
            {!hasOthers && emptyPanel('p', 'GESTÃO DE TIME · SEM PESSOAS', 'Seu time ainda não tem cartas', 'Adicione pessoas, monte o avatar delas e crie o acesso (e-mail e senha). Cada pessoa ganha os próprios decks.', '+ Adicionar primeira pessoa', () => setDeck('member'),
              <div style={{ position: 'relative', width: 170, height: 210 }}>
                <div style={{ position: 'absolute', left: 30, top: 0, width: 130, height: 180, borderRadius: 20, border: '2px dashed #4A4858', transform: 'rotate(8deg)' }} className="ep-c3" />
                <div style={{ position: 'absolute', left: 14, top: 10, width: 130, height: 180, borderRadius: 20, border: '2px dashed #6E6C7A', transform: 'rotate(3deg)' }} className="ep-c2" />
                <div className="ep-c1" style={{ position: 'absolute', left: 0, top: 24, width: 130, height: 180, borderRadius: 20, background: '#0E0E12', border: '2px dashed #B7A6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="ep-av" style={{ lineHeight: 0 }}><Avatar skin="#FFFFFF" hairStyle="careca" bg="#2C2C36" size={84} label="Avatar vazio" /></span></div>
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
          {squads.filter((s) => s.id === filter).map((s) => (
            <SquadTableCard key={s.id} href={`/p/${project.id}/squads/${s.id}`} squad={s}
              seats={[...s.members].sort((x, y) => Number(y.crown) - Number(x.crown)).map((m) => ({ avatar: persons.find((p) => p.id === m.personId)?.avatar ?? null, crown: m.crown }))} />
          ))}
          {shown.map((p) => (
            <PersonCard key={p.id} href={`/p/${project.id}/pessoas/${p.id}`} ariaLabel={`Abrir ${p.name}`}
              person={{ id: p.id, name: p.name, title: p.title, mainSkill: p.mainSkill, invited: p.invited, avatar: p.isMe ? { ...DEFAULT_AVATAR_CFG, ...(user.avatar ?? DEFAULT_AVATAR) } : p.avatar }} // o dono usa o mesmo avatar do cabeçalho
              top={(p.squadIds[0] ? squadName(p.squadIds[0]) : 'SEM SQUAD').toUpperCase()} topRight={p.isMe ? 'VOCÊ' : tenure(p.joinedAt)} />
          ))}
          <button type="button" onClick={() => setDeck('member')} className="tw-add" style={{ fontFamily: 'inherit', minHeight: 360, borderRadius: 24, background: 'transparent', border: '1.5px dashed #4A4858', color: '#F5F2EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer' }}>
            <span style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #4A4858', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></span>
            <span style={{ fontSize: 17, fontWeight: 600 }}>Adicionar membro</span>
            <span style={{ fontSize: 13, color: '#A3A1AD' }}>Monte o avatar e envie o convite</span>
          </button>
        </div>
      </div>
      {deck === 'member' && <MemberDeck projectId={project.id} skills={project.skills} squads={squads.map((q) => ({ id: q.id, name: q.name, color: q.color }))} defaultSquadId={filter !== 'todos' ? filter : null} draft={memberDraft} onDraftChange={setMemberDraft} onClose={() => setDeck(null)} onSaved={closeAndRefresh} />}
      {deck === 'squad' && <SquadDeck projectId={project.id} persons={persons.map((p) => ({ id: p.id, name: p.name, title: p.title, avatar: p.avatar }))} draft={squadDraft} onDraftChange={setSquadDraft} onClose={() => setDeck(null)} onSaved={closeAndRefresh} />}
    </div>
  );
}
