'use client';
import { AppHeader } from '@/components/ds/AppHeader';
import { OpenDeckBanner } from '@/components/ds/OpenDeckBanner';
import { DiHeart } from '@/components/person/DeckIcons';
import { label } from '@/components/ds/tokens';
import { HEALTH_DIMS } from '@/lib/validation';
import type { AvatarConfig } from '@/components/avatar/Avatar';

export function SaudeTimeClient({ user, projectId, squad, total, answers, enough, min, avgs }: {
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; projectId: string; squad: { id: string; name: string }; total: number; answers: number; enough: boolean; min: number; avgs: Record<'saude' | 'design' | 'produto' | 'negocio', number>;
}) {
  const f = (n: number) => n.toFixed(1).replace('.', ',');
  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <OpenDeckBanner bg="#A9D8F5" icon={<DiHeart />} back={{ href: `/p/${projectId}/squads/${squad.id}`, label: `← ${squad.name}` }} title="Saúde do time" desc="O agregado dos check-ins de saúde das pessoas do squad. Ninguém aparece individualmente." />
        <p style={{ margin: 0, color: '#A3A1AD', fontSize: 16 }}>{answers} de {total} {total === 1 ? 'pessoa respondeu' : 'pessoas responderam'} ao check-in mais recente.</p>
        {!enough ? (
          <div style={{ borderRadius: 22, border: '1.5px dashed #4A4858', padding: 28, maxWidth: 560 }}><b style={{ fontSize: 20 }}>Ainda poucas respostas</b><p style={{ margin: '8px 0 0', color: '#A3A1AD', lineHeight: 1.5 }}>Mostramos o agregado a partir de {min} respostas, para não identificar quem respondeu.</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {HEALTH_DIMS.map((d) => (
              <article key={d.id} aria-label={d.title} style={{ minHeight: 260, boxSizing: 'border-box', borderRadius: 22, background: '#A9D8F5', color: '#0E0E12', border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 16px 36px rgba(0,0,0,0.45)' }}>
                <span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}>{f(avgs[d.id])}</span><span style={label(11, '0')}>MÉDIA / 5</span>
                <span style={{ marginTop: 'auto', fontSize: 21, fontWeight: 600, lineHeight: 1.2 }}>{d.title}</span>
                <span aria-hidden="true" style={{ display: 'block', height: 10, borderRadius: 5, background: 'rgba(14,14,18,0.18)' }}><span style={{ display: 'block', width: `${(avgs[d.id] / 5) * 100}%`, height: 10, borderRadius: 5, background: '#0E0E12' }} /></span>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
