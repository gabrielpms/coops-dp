/** Ícones animados da Administração: o gesto roda no hover/foco do card (classes `ad-*` em styles/motion.css). */
const base = { width: 56, height: 56, viewBox: '0 0 64 64', fill: 'none', stroke: '#0E0E12', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, style: { overflow: 'visible' } } as const;

export const IconBrief = ({ bg }: { bg: string }) => (
  <svg className="ad-ic" {...base}><path className="ad-bh" d="M24 20v-6h16v6" /><rect x="12" y="20" width="40" height="34" rx="3" fill={bg} /><path d="M12 34h40M28 34v6h8v-6" /></svg>
);
export const IconDeck = ({ bg }: { bg: string }) => (
  <svg className="ad-ic" {...base}><g className="ad-f1"><rect x="20" y="12" width="24" height="34" rx="4" fill={bg} /></g><g className="ad-f2"><rect x="20" y="12" width="24" height="34" rx="4" fill={bg} /></g><g className="ad-f3"><rect x="20" y="12" width="24" height="34" rx="4" fill={bg} /><path d="M26 22h12M26 28h8" /></g><path d="M14 54h36" /></svg>
);
export const IconBuild = () => (
  <svg className="ad-ic" {...base}><path d="M16 54V12h22v42M38 26h12v28M10 54h44" />{[['21', '18', ''], ['29', '18', 'ad-w2'], ['21', '27', 'ad-w3'], ['29', '27', 'ad-w4'], ['21', '36', 'ad-w5'], ['29', '36', 'ad-w6']].map(([x, y, c]) => <rect key={x + y} className={`ad-w ${c}`} x={x} y={y} width="4" height="4" />)}<path d="M24 54v-8h6v8M42 32h4M42 40h4" /></svg>
);
export const IconBars = () => (
  <svg className="ad-ic" {...base}><path d="M10 54h44" /><rect className="ad-bar" x="14" y="38" width="8" height="16" rx="1.5" /><rect className="ad-bar ad-bar2" x="28" y="30" width="8" height="24" rx="1.5" /><rect className="ad-bar ad-bar3" x="42" y="22" width="8" height="32" rx="1.5" /><path className="ad-tr" d="M12 26l12-8 8 5 18-13" /><path className="ad-tr" d="M42 10h8v8" /></svg>
);

/** Ícone grande do banner. */
export function BannerIcon({ kind, bg }: { kind: 'admin' | 'me' | 'lid' | 'hab' | 'dados'; bg: string }) {
  const p = { width: 84, height: 84, viewBox: '0 0 64 64', fill: 'none', stroke: '#0E0E12', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
  if (kind === 'admin') return <svg {...p}><path d="M10 18h44M10 32h44M10 46h44" /><g className="ad-k1"><circle cx="20" cy="18" r="5" fill={bg} /></g><g className="ad-k2"><circle cx="42" cy="32" r="5" fill={bg} /></g><g className="ad-k3"><circle cx="26" cy="46" r="5" fill={bg} /></g></svg>;
  if (kind === 'me') return <svg {...p}><rect x="10" y="14" width="44" height="36" rx="5" fill={bg} /><path d="M26 14v-4h12v4" /><circle cx="23" cy="28" r="5" /><path d="M15 42c1.5-4 4.5-6 8-6s6.5 2 8 6" /><path className="ad-id" d="M36 26h12" /><path className="ad-id ad-id2" d="M36 34h8" /></svg>;
  if (kind === 'lid') return <svg {...p}><g className="ad-cr"><path d="M12 46l-2-26 12 11 10-17 10 17 12-11-2 26z" fill={bg} /><path d="M14 52h36" /><circle cx="32" cy="38" r="3" /><path className="ad-gem" d="M50 8v6M47 11h6" /></g></svg>;
  if (kind === 'hab') return <svg {...p}><g className="ad-f1"><rect x="20" y="12" width="24" height="34" rx="4" fill={bg} /></g><g className="ad-f2"><rect x="20" y="12" width="24" height="34" rx="4" fill={bg} /></g><g className="ad-f3"><rect x="20" y="12" width="24" height="34" rx="4" fill={bg} /><path d="M26 22h12M26 28h8" /></g><path d="M14 54h36" /></svg>;
  return <svg {...p}><path d="M16 54V12h22v42M38 26h12v28M10 54h44" /><rect className="ad-w" x="21" y="18" width="4" height="4" /><rect className="ad-w ad-w2" x="29" y="18" width="4" height="4" /><rect className="ad-w ad-w3" x="21" y="27" width="4" height="4" /><rect className="ad-w ad-w4" x="29" y="27" width="4" height="4" /><path d="M24 54v-8h6v8M42 32h4M42 40h4" /></svg>;
}

export const IconBino = ({ bg }: { bg: string }) => (
  <svg className="ad-ic" {...base}><g className="ad-bino"><path d="M14 34l5-16h8l2 16M50 34l-5-16h-8l-2 16" /><path d="M29 28h6" /><circle cx="20" cy="42" r="10" fill={bg} /><circle cx="44" cy="42" r="10" fill={bg} /><path className="ad-gl" d="M15 39a6 6 0 0 1 5-4M39 39a6 6 0 0 1 5-4" /></g></svg>
);
export const AvatarIcon = ({ children, bg }: { children: React.ReactNode; bg: string }) => (
  <span className="ad-av" style={{ display: 'block', width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: '2px solid #0E0E12', boxSizing: 'border-box', lineHeight: 0, background: bg }}>{children}</span>
);
