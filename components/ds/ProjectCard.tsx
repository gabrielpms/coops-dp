import { CoopsLink } from '../nav/useCoopsRouter';
import { label, segmentIcon } from './tokens';

export type ProjectView = { id: string; name: string; segment: string; tagline: string; counts: { squads: number; people: number; initiatives: number } };

/** Carta de projeto: com 2+ projetos empilha camadas (depth) */
export function ProjectCard({ p, depth = 2, badge, tone = 'default' }: { p: ProjectView; depth?: 0 | 1 | 2; badge?: string; tone?: 'default' }) {
  const c = p.counts;
  const btn = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 48, textDecoration: 'none', fontWeight: 600, fontSize: 14, borderRadius: 12 } as const;
  return (
    <div style={{ flex: '0 1 360px', position: 'relative', padding: '14px 18px 0 0' }}>
      {depth === 2 && <div aria-hidden="true" style={{ position: 'absolute', left: 18, top: 0, right: 0, bottom: 18, borderRadius: 26, background: '#4B36B0', border: '2px solid #0E0E12', transform: 'rotate(3deg)' }} />}
      {depth >= 1 && <div aria-hidden="true" style={{ position: 'absolute', left: 9, top: 7, right: 9, bottom: 9, borderRadius: 26, background: '#8B74F2', border: '2px solid #0E0E12', transform: depth === 2 ? 'rotate(1.5deg)' : 'rotate(2deg)' }} />}
      <article style={{ position: 'relative', borderRadius: 26, background: '#B7A6FF', color: '#0E0E12', border: '2px solid #0E0E12', padding: 24, display: 'flex', flexDirection: 'column', gap: 18, boxShadow: depth === 2 ? '0 20px 40px rgba(0,0,0,0.45)' : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <svg width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={segmentIcon(p.segment)} /></svg>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <span style={label(11, '0')}>{p.segment.toUpperCase()}</span>
            {badge && <span style={{ ...label(10, '0'), border: '1.5px dashed #0E0E12', borderRadius: 999, padding: '2px 8px' }}>{badge}</span>}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em' }}>{p.name}</h2>
          <span style={{ fontSize: 14 }}>{p.tagline || 'Projeto novo'}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, borderTop: '1.5px solid #0E0E12', paddingTop: 14 }}>
          {[[c.squads, c.squads === 1 ? 'squad' : 'squads'], [c.people, c.people === 1 ? 'pessoa' : 'pessoas'], [c.initiatives, c.initiatives === 1 ? 'iniciativa' : 'iniciativas']].map(([v, l]) => (
            <span key={String(l)} style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 26, fontWeight: 600 }}>{v}</span><span style={{ fontSize: 12 }}>{l}</span></span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          <CoopsLink href={`/p/${p.id}/time`} style={{ ...btn, color: '#F5F2EC', background: '#0E0E12' }}>Gestão de time</CoopsLink>
          <CoopsLink href={`/p/${p.id}/iniciativas`} style={{ ...btn, color: '#0E0E12', border: '1.5px solid #0E0E12' }}>Iniciativas</CoopsLink>
        </div>
      </article>
    </div>
  );
}
