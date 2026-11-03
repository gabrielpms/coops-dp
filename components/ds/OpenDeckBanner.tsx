'use client';
import type { ReactNode } from 'react';
import { Avatar, type AvatarConfig } from '../avatar/Avatar';
import { CoopsLink } from '../nav/useCoopsRouter';

/** Banner de deck aberto (`coops-mban`): caixa de ícone, "← voltar", H1, tile de avatar e ação. */
export function OpenDeckBanner({ bg, icon, title, desc, back, avatar, cta }: {
  bg: string; icon: ReactNode; title: string; desc: string; back: { href: string; label: string }; avatar?: AvatarConfig | null; cta?: { label: string; onClick: () => void } | null;
}) {
  return (
    <section className="coops-mban ad-hv" aria-labelledby="ob-title" style={{ position: 'relative', borderRadius: 28, border: '2px solid #0E0E12', background: bg, color: '#0E0E12', padding: '26px 30px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px 28px', overflow: 'hidden', boxShadow: '0 18px 40px rgba(0,0,0,0.45)' }}>
      <span aria-hidden="true" className="coops-mban-ring" style={{ position: 'absolute', right: -70, bottom: -110, width: 320, height: 320, borderRadius: '50%', border: '2px solid rgba(14,14,18,0.18)', boxShadow: '0 0 0 44px rgba(14,14,18,0.04)', pointerEvents: 'none' }} />
      <div aria-hidden="true" className="coops-mban-ic" style={{ position: 'relative', flex: 'none', width: 116, height: 116, boxSizing: 'border-box', borderRadius: 24, border: '2px solid #0E0E12', background: 'rgba(245,242,236,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div style={{ position: 'relative', flex: '1 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <CoopsLink href={back.href} className="coops-mban-back ad-back" style={{ alignSelf: 'flex-start', fontSize: 14, color: 'rgba(14,14,18,0.72)', textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{back.label}</CoopsLink>
        <h1 id="ob-title" style={{ margin: 0, fontSize: 'clamp(34px, 6vw, 52px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1 }}>{title}</h1>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.45, maxWidth: 640 }}>{desc}</p>
      </div>
      <div style={{ position: 'relative', flex: '0 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
        {avatar && <span className="coops-mban-me" style={{ width: 112, height: 84, boxSizing: 'border-box', borderRadius: 18, background: '#F5F2EC', border: '2px solid #0E0E12', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden', lineHeight: 0 }}><Avatar {...avatar} crown={false} bg="#F5F2EC" size={82} label="" /></span>}
        {cta && <button type="button" onClick={cta.onClick} className="coops-mban-btn" style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#F5F2EC', background: '#0E0E12', border: '2px solid #0E0E12', borderRadius: 12, minHeight: 48, padding: '0 18px', cursor: 'pointer' }}>{cta.label}</button>}
      </div>
    </section>
  );
}
