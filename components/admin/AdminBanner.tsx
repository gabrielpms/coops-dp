'use client';
import type { ReactNode } from 'react';
import { Avatar, type AvatarConfig } from '../avatar/Avatar';
import { CoopsLink } from '../nav/useCoopsRouter';
import { BannerIcon } from './Icons';

export type BannerView = 'admin' | 'me' | 'lid' | 'hab' | 'dados';
export const BANNER_BG: Record<BannerView, string> = { admin: '#B7A6FF', me: '#8FE3C8', lid: '#F3D36B', hab: '#F5A9D6', dados: '#A9D8F5' };

/** Banner de deck aberto (`coops-mban`): caixa de ícone, link "← voltar", H1, avatar do usuário e ação. */
export function AdminBanner({ view, title, desc, back, meAvatar, onMe, cta }: {
  view: BannerView; title: string; desc: string; back: { href: string; label: string }; meAvatar: AvatarConfig; onMe?: () => void;
  cta?: { label: string; onClick: () => void } | null;
}) {
  const bg = BANNER_BG[view];
  const linkStyle = { alignSelf: 'flex-start', fontSize: 14, color: 'rgba(14,14,18,0.72)', textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' } as const;
  return (
    <section className="coops-mban ad-hv" aria-labelledby="ad-title" style={{ position: 'relative', borderRadius: 28, border: '2px solid #0E0E12', background: bg, color: '#0E0E12', padding: '26px 30px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px 28px', overflow: 'hidden', boxShadow: '0 18px 40px rgba(0,0,0,0.45)' }}>
      <span aria-hidden="true" className="coops-mban-ring" style={{ position: 'absolute', right: -70, bottom: -110, width: 320, height: 320, borderRadius: '50%', border: '2px solid rgba(14,14,18,0.18)', boxShadow: '0 0 0 44px rgba(14,14,18,0.04)', pointerEvents: 'none' }} />
      <div aria-hidden="true" className="coops-mban-ic" style={{ position: 'relative', flex: 'none', width: 116, height: 116, boxSizing: 'border-box', borderRadius: 24, border: '2px solid #0E0E12', background: 'rgba(245,242,236,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BannerIcon kind={view} bg={bg} /></div>
      <div style={{ position: 'relative', flex: '1 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <CoopsLink href={back.href} className="coops-mban-back ad-back" style={linkStyle}>{back.label}</CoopsLink>
        <h1 id="ad-title" style={{ margin: 0, fontSize: 'clamp(34px, 6vw, 52px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1 }}>{title}</h1>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.45, maxWidth: 640 }}>{desc}</p>
      </div>
      <div style={{ position: 'relative', flex: '0 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
        <button type="button" onClick={onMe} disabled={!onMe} aria-label="Ver os seus dados" className="coops-mban-me" style={{ flex: 'none', width: 112, height: 84, boxSizing: 'border-box', borderRadius: 18, background: bg === '#8FE3C8' ? '#F5F2EC' : '#F5F2EC', border: '2px solid #0E0E12', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden', padding: 0, cursor: onMe ? 'pointer' : 'default', lineHeight: 0 }}>
          <Avatar {...meAvatar} crown={false} bg="#F5F2EC" size={82} label="Seu avatar" />
        </button>
        {cta && <button type="button" onClick={cta.onClick} className="coops-mban-btn" style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#F5F2EC', background: '#0E0E12', border: '2px solid #0E0E12', borderRadius: 12, minHeight: 48, padding: '0 18px', cursor: 'pointer' }}>{cta.label}</button>}
      </div>
    </section>
  );
}

/** Carta do deck aberto (340 px): ícone, número grande, rótulo mono, kicker, título e rodapé. */
export function AdminCard({ bg, icon, big, bigLabel, tag, kicker, title, foot, onClick, aria }: {
  bg: string; icon: ReactNode; big: string; bigLabel: string; tag?: string; kicker: string; title: string; foot: string; onClick: () => void; aria: string;
}) {
  return (
    <button type="button" onClick={onClick} aria-label={aria} className="coops-card ad-hv" style={{ fontFamily: 'inherit', textAlign: 'left', height: 340, boxSizing: 'border-box', borderRadius: 22, background: bg, color: '#0E0E12', border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', boxShadow: '0 16px 36px rgba(0,0,0,0.45)' }}>
      <span style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {icon}
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' }}>{big}</span><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, marginTop: 6 }}>{bigLabel}</span></span>
      </span>
      <span style={{ marginTop: 'auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
        {tag && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.06em', border: '1.5px dashed #0E0E12', borderRadius: 999, padding: '2px 8px' }}>{tag}</span>}
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.08em' }}>{kicker}</span>
      </span>
      <span style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.2 }}>{title}</span>
      <span style={{ width: '100%', boxSizing: 'border-box', fontSize: 13, lineHeight: 1.4, borderTop: '1.5px solid #0E0E12', paddingTop: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{foot}</span>
    </button>
  );
}

/** Carta tracejada "adicionar" no fim do deck. */
export function AddCard({ title, sub, onClick }: { title: string; sub: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="tw-add" style={{ fontFamily: 'inherit', height: 340, boxSizing: 'border-box', borderRadius: 22, background: 'transparent', border: '1.5px dashed #4A4858', color: '#F5F2EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', padding: 20 }}>
      <span style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #4A4858', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></span>
      <span style={{ fontSize: 17, fontWeight: 600 }}>{title}</span><span style={{ fontSize: 13, color: '#A3A1AD', textAlign: 'center' }}>{sub}</span>
    </button>
  );
}
