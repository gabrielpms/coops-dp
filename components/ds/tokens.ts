import type { CSSProperties } from 'react';

export const mono: CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };
export const label = (size = 11, ls = '0.06em'): CSSProperties => ({ ...mono, fontSize: size, letterSpacing: ls });

/** Campo sobre carta clara (deck de perguntas) */
export const cardInput: CSSProperties = {
  fontFamily: 'inherit', fontSize: 17, lineHeight: 1.5, color: '#0E0E12', background: 'rgba(245,242,236,0.65)',
  border: '1.5px solid rgba(14,14,18,0.3)', borderRadius: 12, padding: '12px 14px', boxSizing: 'border-box', width: '100%', minHeight: 52,
};
/** Campo sobre a mesa (formulários escuros) */
export const deskInput = (focus = false): CSSProperties => ({
  fontFamily: 'inherit', fontSize: 16, color: '#F5F2EC', background: '#17171D', borderRadius: 10, minHeight: 52, padding: '0 14px',
  border: `1.5px solid ${focus ? '#B7A6FF' : '#2C2C36'}`, boxShadow: focus ? '0 0 0 4px rgba(183,166,255,0.18)' : 'none', boxSizing: 'border-box', width: '100%',
});
export const darkBtn: CSSProperties = {
  flex: 'none', fontFamily: 'inherit', fontWeight: 600, fontSize: 15, color: '#F5F2EC', background: '#0E0E12', border: 0, borderRadius: 12, minHeight: 52, padding: '0 18px', cursor: 'pointer',
};
export const chipStyle = (on: boolean): CSSProperties => ({
  fontFamily: 'inherit', fontWeight: 600, fontSize: 13, textAlign: 'left', color: on ? '#F5F2EC' : '#0E0E12', background: on ? '#0E0E12' : 'transparent',
  border: '1.5px solid #0E0E12', borderRadius: 12, minHeight: 38, padding: '6px 12px', cursor: 'pointer',
});
export const removableChip: CSSProperties = {
  fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#F5F2EC', background: '#0E0E12', border: '1.5px solid #0E0E12', borderRadius: 999,
  minHeight: 40, padding: '6px 10px 6px 14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
};

export const SEGMENT_ICON: Record<string, string> = {
  Healthtech: 'M32 54S10 40 10 24a11 11 0 0 1 22-3 11 11 0 0 1 22 3c0 16-22 30-22 30zM18 30h8l3-6 5 12 3-6h9',
};
export const BUILDING_ICON = 'M12 20h40v36H12zM24 20v-8h16v8M12 34h40M28 34v6h8v-6';
export const segmentIcon = (seg: string) => SEGMENT_ICON[seg] ?? BUILDING_ICON;
