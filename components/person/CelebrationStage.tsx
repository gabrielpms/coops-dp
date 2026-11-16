import type { CSSProperties } from 'react';
import { Avatar, type AvatarConfig } from '../avatar/Avatar';

// Gerado a partir de docs/referencia/Coops12-Deck-Eventos: palco de celebração (promoção e mérito).
export function CelebrationStage({ kind, person, other }: { kind: 'PROMOCAO' | 'MERITO'; person: AvatarConfig; other: AvatarConfig }) {
  return (
    <div className="cel-stage" aria-hidden="true" style={{ position: 'relative', height: 176, borderRadius: 20, border: '1.5px solid #0E0E12', background: 'rgba(245,242,236,0.45)', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 6, paddingTop: 18 }}>
        <svg className="cel-cf" aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" style={{ left: '8%', '--d': '0ms', '--r': '140deg' } as CSSProperties} fill="none" stroke="#0E0E12" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3l8 8" /></svg>
        <svg className="cel-cf" aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" style={{ left: '20%', '--d': '500ms', '--r': '-120deg' } as CSSProperties} fill="none" stroke="#0E0E12" strokeWidth="1.8" strokeLinecap="round"><path d="M7 2v10" /></svg>
        <svg className="cel-cf" aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" style={{ left: '34%', '--d': '1100ms', '--r': '200deg' } as CSSProperties} fill="none" stroke="#0E0E12" strokeWidth="1.8" strokeLinecap="round"><path d="M2 7c2-3 4 3 6 0s4 3 4 0" /></svg>
        <svg className="cel-cf" aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" style={{ left: '62%', '--d': '300ms', '--r': '-160deg' } as CSSProperties} fill="none" stroke="#0E0E12" strokeWidth="1.8" strokeLinecap="round"><path d="M3 11L11 3" /></svg>
        <svg className="cel-cf" aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" style={{ left: '76%', '--d': '800ms', '--r': '120deg' } as CSSProperties} fill="none" stroke="#0E0E12" strokeWidth="1.8" strokeLinecap="round"><path d="M7 2v10M2 7h10" /></svg>
        <svg className="cel-cf" aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" style={{ left: '90%', '--d': '1400ms', '--r': '-200deg' } as CSSProperties} fill="none" stroke="#0E0E12" strokeWidth="1.8" strokeLinecap="round"><path d="M2 7c2-3 4 3 6 0s4 3 4 0" /></svg>
        <svg className="cel-cf" aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" style={{ left: '48%', '--d': '1700ms', '--r': '90deg' } as CSSProperties} fill="none" stroke="#0E0E12" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3l8 8" /></svg>
      <div className="cel-a cel-a1" style={{ lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12', boxShadow: '4px 4px 0 #0E0E12', marginBottom: 14 }}><Avatar {...person} crown bg="#F5F2EC" size={104} label="" /></div>
      <div style={{ alignSelf: 'center', marginBottom: 0 }}>
        {kind === 'PROMOCAO' ? (<svg className="cel-obj" width="84" height="84" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><g className="cel-fl1"><path d="M14 10h12l-2 16a4 4 0 0 1-8 0z" fill="#E8C46A" /><path d="M20 30v18M14 48h12" /><path d="M15.5 18h9" /></g><g className="cel-fl2"><path d="M38 10h12l-2 16a4 4 0 0 1-8 0z" fill="#E8C46A" /><path d="M44 30v18M38 48h12" /><path d="M39.5 18h9" /></g><g className="cel-clk"><path d="M32 2v5M26 4l2 4M38 4l-2 4" /></g></svg>) : (<svg className="cel-obj" width="84" height="84" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><g className="cel-md"><path d="M22 4h8l6 16h-8z" fill="#F5A9D6" /><path d="M42 4h-8l-6 16h8z" fill="#F5A9D6" /><circle cx="32" cy="36" r="14" fill="#F5A9D6" /><circle cx="32" cy="36" r="9" /><path d="M32 30l1.8 3.8 4 .4-3 2.8.9 4-3.7-2.1-3.7 2.1.9-4-3-2.8 4-.4z" /></g><g className="cel-clk"><path d="M52 18v6M49 21h6" /><path d="M10 44v4M8 46h4" /></g></svg>)}
      </div>
      <div className="cel-a cel-a2" style={{ lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12', boxShadow: '4px 4px 0 #0E0E12', marginBottom: 14 }}><Avatar {...other} bg="#F3D36B" size={104} label="" /></div>
    </div>
  );
}
