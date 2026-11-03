'use client';
import { AppHeader } from '@/components/ds/AppHeader';
import { Avatar, type AvatarConfig } from '@/components/avatar/Avatar';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { CoopsLink } from '@/components/nav/useCoopsRouter';
import { DECK_META, type SquadDeckId } from '@/components/squad/types';
import { label } from '@/components/ds/tokens';
import { plural } from '@/lib/format';

const ORDER: SquadDeckId[] = ['DESAFIO', 'FRENTE', 'ESTRATEGIA', 'INDICADOR', 'ALAVANCA'];

export function SquadHomeClient({ user, projectId, squad, isManager, people, counts }: {
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; projectId: string; squad: { id: string; name: string; color: string }; isManager: boolean;
  people: { id: string; name: string; title: string; avatar: AvatarConfig | null; crown: boolean }[]; counts: Record<SquadDeckId, number>;
}) {
  const base = `/p/${projectId}/squads/${squad.id}`;
  const card = { color: '#0E0E12', textDecoration: 'none', borderRadius: 22, border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, height: 300, boxSizing: 'border-box', boxShadow: '0 16px 36px rgba(0,0,0,0.45)' } as const;
  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <section style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', borderRadius: 32, background: '#17171D', border: '1px solid #2C2C36', padding: 'clamp(20px, 4vw, 36px)' }}>
          <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <CoopsLink href={isManager ? `/p/${projectId}/time` : '/hub'} style={{ fontSize: 14, minHeight: 44, display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start' }}>{isManager ? '← Time' : '← Hub de projetos'}</CoopsLink>
            <span style={{ ...label(12, '0.1em'), color: '#B7A6FF' }}>MESA DO TIME</span>
            <h1 style={{ margin: 0, fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1, display: 'flex', alignItems: 'center', gap: 12 }}><span aria-hidden="true" style={{ width: 18, height: 18, borderRadius: '50%', background: squad.color, border: '2px solid #0E0E12', flex: 'none' }} />{squad.name}</h1>
            <p style={{ margin: 0, color: '#A3A1AD', fontSize: 16 }}>{people.length} {plural(people.length, 'pessoa', 'pessoas')} · {isManager ? 'você edita os decks do squad' : 'você vê como time; só o manager edita'}</p>
          </div>
          <div aria-label="Pessoas do squad" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', maxWidth: 420 }}>
            {people.slice(0, 8).map((p) => <CoopsLink key={p.id} href={isManager ? `/p/${projectId}/pessoas/${p.id}` : '#'} aria-label={p.name} title={p.name} style={{ lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12' }}><Avatar {...DEFAULT_AVATAR_CFG} {...(p.avatar ?? {})} crown={p.crown} size={60} label={p.name} /></CoopsLink>)}
          </div>
        </section>
        <section aria-label="Decks do squad" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {ORDER.map((d) => { const m = DECK_META[d]; return (
            <CoopsLink key={d} href={`${base}/${m.slug}`} className="coops-card" aria-label={`Abrir ${m.title}`} style={{ ...card, background: m.color }}>
              <span style={{ display: 'flex', justifyContent: 'flex-end' }}><span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}>{counts[d]}</span><span style={label(11, '0')}>{plural(counts[d], 'ATIVA', 'ATIVAS')}</span></span></span>
              <span style={{ marginTop: 'auto', ...label(11, '0.08em') }}>{m.kicker}</span><span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>{m.title}</span><span style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 10, fontSize: 13, lineHeight: 1.4 }}>{m.desc}</span>
            </CoopsLink>); })}
          <CoopsLink href={`${base}/saude`} className="coops-card" aria-label="Abrir Saúde do time" style={{ ...card, background: '#A9D8F5' }}>
            <span style={{ marginTop: 'auto', ...label(11, '0.08em') }}>SAÚDE</span><span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>Saúde do time</span><span style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 10, fontSize: 13, lineHeight: 1.4 }}>O agregado dos check-ins de saúde das pessoas do squad.</span>
          </CoopsLink>
        </section>
      </div>
    </div>
  );
}
