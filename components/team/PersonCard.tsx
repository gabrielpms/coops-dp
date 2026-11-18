'use client';
import type { ReactNode } from 'react';
import { Avatar, type AvatarConfig } from '../avatar/Avatar';
import { DEFAULT_AVATAR_CFG } from '../avatar/AvatarEditor';
import { CoopsLink } from '../nav/useCoopsRouter';
import { label } from '../ds/tokens';

export type PersonCardData = { id: string; name: string; title: string; avatar: AvatarConfig | null; mainSkill: string; invited?: boolean };

/** Carta de pessoa do Time (Coops05): faixa colorida com o avatar, nome, cargo e skill. Vira link ou botão de escolha. */
export function PersonCard({ person, top, topRight, href, onSelect, selected, ariaLabel }: {
  person: PersonCardData; top: string; topRight: string; href?: string; onSelect?: () => void; selected?: boolean; ariaLabel: string;
}) {
  const cfg = { ...DEFAULT_AVATAR_CFG, ...(person.avatar ?? {}) };
  const style = { color: '#F5F2EC', textDecoration: 'none', fontFamily: 'inherit', textAlign: 'inherit', padding: 0, borderRadius: 24, background: '#17171D', border: selected ? '2px solid #B7A6FF' : '1.5px solid #2C2C36', boxShadow: selected ? '6px 6px 0 #4B36B0' : undefined, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 360, cursor: 'pointer', width: '100%' } as const;
  const body: ReactNode = (<>
    <div style={{ background: cfg.bg, padding: '16px 16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, borderBottom: '1.5px solid #0E0E12' }}>
      <span style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'space-between', gap: 8, ...label(11, '0'), color: '#0E0E12' }}><span>{top}</span><span>{topRight}</span></span>
      <span className="coops-av"><Avatar {...cfg} size={150} label={person.name} /></span>
    </div>
    <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 4 }}>
      <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.15 }}>{person.name}</span>
      <span style={{ fontSize: 14, color: '#A3A1AD' }}>{person.title || 'Sem cargo ainda'}</span>
      {person.mainSkill && <span style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: '#0E0E12', background: '#F3D36B', borderRadius: 999, padding: '5px 10px' }}>{person.mainSkill}</span>}
      {person.invited && <span style={{ marginTop: 8, ...label(10, '0.06em'), color: '#FFC2A6', border: '1.5px dashed #FFC2A6', borderRadius: 999, padding: '4px 8px' }}>CONVITE ENVIADO</span>}
      <span role="img" aria-label="4 decks" style={{ marginTop: 'auto', paddingTop: 14, display: 'flex', gap: 4 }}>{['#B7A6FF', '#F3D36B', '#F5A9D6', '#FF8A5B'].map((c) => <span key={c} style={{ width: 10, height: 14, borderRadius: 3, background: c }} />)}</span>
    </div>
  </>);
  if (href) return <CoopsLink className="coops-m" href={href} aria-label={ariaLabel} style={style}>{body}</CoopsLink>;
  return <button type="button" className="coops-m" onClick={onSelect} aria-pressed={!!selected} aria-label={ariaLabel} style={style}>{body}</button>;
}
