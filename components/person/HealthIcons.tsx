const svgP = { width: 56, height: 56, viewBox: '0 0 64 64', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: 'shi', style: { overflow: 'visible' } } as const;

export function DimIcon({ id, ink, bg }: { id: 'saude' | 'design' | 'produto' | 'negocio'; ink: string; bg: string }) {
  if (id === 'saude') return <svg {...svgP} stroke={ink}><path d="M6 58h52" /><g className="zs-b"><ellipse cx="32" cy="51" rx="18" ry="6" fill={bg} /><g className="zs-m"><ellipse cx="32" cy="39" rx="13" ry="5" fill={bg} /><g className="zs-t"><ellipse cx="32" cy="29" rx="8" ry="4" fill={bg} /></g></g></g><path className="zs-sp" d="M48 22l2-2M16 22l-2-2M32 18v-4" /></svg>;
  if (id === 'design') return <svg {...svgP} stroke={ink}><circle cx="32" cy="32" r="24" fill={bg} /><path d="M32 8v5M32 51v5M8 32h5M51 32h5" /><g className="sh-ndl"><path d="M32 16l5 16h-10z" fill={ink} /><path d="M27 32h10l-5 16z" fill={bg} /></g><circle cx="32" cy="32" r="2" fill={bg} /></svg>;
  if (id === 'produto') return <svg {...svgP} stroke={ink}><path className="sh-route" d="M10 52c10 0 12-16 22-16s10-16 20-16" /><circle className="sh-m sh-m1" cx="10" cy="52" r="4" fill={bg} /><circle className="sh-m sh-m2" cx="32" cy="36" r="4" fill={bg} /><path d="M52 20V4" /><path className="sh-flag" d="M52 5h10l-3 5 3 5H52z" fill={ink} /></svg>;
  return <svg {...svgP} stroke={ink}><g className="sh-pz1"><path d="M6 20h22v8a4 4 0 0 1 0 8v8H6z" fill={bg} /></g><g className="sh-pz2"><path d="M36 20h22v24H36v-8a4 4 0 0 0 0-8z" fill={bg} /></g><path className="sh-sp" d="M32 10v-5M24 13l-3-4M40 13l3-4M32 54v5" /></svg>;
}

export const BannerHeart = () => <svg width="84" height="84" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ overflow: 'visible' }}><path className="ic-heart" d="M32 54S8 40 8 24a12 12 0 0 1 24-4 12 12 0 0 1 24 4c0 16-24 30-24 30z" /><path className="ic-ecg" d="M14 30h10l4-8 6 16 4-8h12" /></svg>;

