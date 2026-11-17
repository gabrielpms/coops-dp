import type { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { CoopsLink } from '../nav/useCoopsRouter';
import { OpenDeckBanner } from './OpenDeckBanner';
import { label, mono } from './tokens';
import { cycleLabel } from '@/lib/format';
import { cycleSpan } from '@/lib/cycles';
import type { AvatarConfig } from '../avatar/Avatar';

export type HistItem = { title: string; meta?: string; foot?: string; big?: string; bigLabel?: string };
export type HistSection = { id: string; title: string; kicker: string; bg: string; empty: string; items: HistItem[]; href?: string };

const Icon = () => <svg aria-hidden="true" width="84" height="84" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}><rect x="10" y="14" width="44" height="40" rx="4" /><path d="M10 26h44M22 8v10M42 8v10" /><path className="ic-ecg" d="M32 34a8 8 0 1 0 8 8M40 36v6h-6" /></svg>;

/** Histórico de ciclos (somente leitura): abas por ciclo e as informações daquele ciclo em seções de cartas. */
export function CycleHistory({ user, title, desc, back, cycles, current, selected, hrefFor, sections, note, avatar, accent = '#8FE3C8' }: {
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; title: string; desc: string; back: { href: string; label: string };
  cycles: string[]; current: string; selected: string; hrefFor: (cycle: string) => string; sections: HistSection[]; note?: ReactNode; avatar?: AvatarConfig | null; accent?: string;
}) {
  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <OpenDeckBanner bg={accent} icon={<Icon />} back={back} title={title} desc={desc} avatar={avatar ?? undefined} avatarBg="#5FC4A6" avatarCrown />
        <div role="tablist" aria-label="Ciclos" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {cycles.map((c) => { const on = c === selected; return (
            <CoopsLink key={c} href={hrefFor(c)} role="tab" aria-selected={on} style={{ fontFamily: 'inherit', fontWeight: on ? 600 : 400, fontSize: 14, color: on ? '#0E0E12' : '#F5F2EC', background: on ? '#F5F2EC' : 'transparent', border: on ? 0 : '1px solid #4A4858', borderRadius: 999, minHeight: 44, padding: '0 16px', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              {cycleLabel(c)}{c === current && <span style={{ ...mono, fontSize: 10, border: '1.5px solid currentColor', borderRadius: 999, padding: '1px 6px' }}>EM ANDAMENTO</span>}
            </CoopsLink>); })}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em' }}>{cycleLabel(selected)}</h2>
          <span style={{ color: '#A3A1AD', fontSize: 15 }}>{cycleSpan(selected)}{selected === current ? ' · ainda em andamento' : ' · ciclo encerrado'}</span>
        </div>
        {note}
        {sections.map((s) => (
          <section key={s.id} aria-label={s.title} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{s.title}</h3><span style={{ ...label(11), color: '#A3A1AD' }}>{s.items.length} {s.items.length === 1 ? 'REGISTRO' : 'REGISTROS'}</span>
              {s.href && <CoopsLink href={s.href} style={{ fontSize: 14, marginLeft: 'auto', color: '#B7A6FF' }}>Abrir o deck →</CoopsLink>}
            </div>
            {s.items.length === 0 ? <div style={{ borderRadius: 18, border: '1.5px dashed #4A4858', padding: '16px 18px', color: '#A3A1AD', fontSize: 15 }}>{s.empty}</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {s.items.map((i, k) => (
                  <article key={k} className="coops-card" style={{ boxSizing: 'border-box', minHeight: 170, borderRadius: 20, background: s.bg, color: '#0E0E12', border: '2px solid #0E0E12', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8, ...label(10, '0.08em') }}><span>{s.kicker}</span>{i.big && <span style={{ textAlign: 'right' }}><b style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, display: 'block' }}>{i.big}</b>{i.bigLabel}</span>}</span>
                    <span style={{ marginTop: 'auto', fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>{i.title}</span>
                    {i.meta && <span style={{ fontSize: 13, lineHeight: 1.4 }}>{i.meta}</span>}
                    {i.foot && <span style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 8, fontSize: 12.5, lineHeight: 1.35 }}>{i.foot}</span>}
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
