import type { CSSProperties } from 'react';

// Gerado a partir de docs/referencia/Coops09-Agente: ícones animados das cartas do agente.
export type AgentKind = 'prod' | 'prob' | 'nec' | 'ask' | 'ctx';
export function AgentCardIcon({ kind }: { kind: AgentKind }) {
  switch (kind) {
    case 'prod': return (<svg width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ overflow: 'visible' } as CSSProperties}><rect x="20" y="6" width="24" height="50" rx="5" /><path d="M29 11h6" /><path className="ag-ln" d="M25 22h14" /><path className="ag-ln ag-ln2" d="M25 29h10" /><path className="ag-ln ag-ln3" d="M25 36h12" /><circle cx="32" cy="49" r="2" /></svg>);
    case 'prob': return (<svg width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ overflow: 'visible' } as CSSProperties}><g className="ag-wb"><path d="M32 10L56 52H8z" /><path d="M32 26v12" /><circle cx="32" cy="45" r="1.4" fill="#0E0E12" /></g></svg>);
    case 'nec': return (<svg width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ overflow: 'visible' } as CSSProperties}><circle cx="32" cy="30" r="7" /><path d="M18 56c2-9 7-13 14-13s12 4 14 13" /><g className="ag-hb"><path d="M32 18s-8-5-8-10a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 5-8 10-8 10z" /></g></svg>);
    case 'ask': return (<svg width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ overflow: 'visible' } as CSSProperties}><g className="ag-bb"><path d="M10 14h44v28H30l-10 9v-9H10z" /><circle className="ag-d" cx="24" cy="28" r="2" fill="#0E0E12" /><circle className="ag-d ag-d2" cx="32" cy="28" r="2" fill="#0E0E12" /><circle className="ag-d ag-d3" cx="40" cy="28" r="2" fill="#0E0E12" /></g></svg>);
    case 'ctx': return (<svg width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ overflow: 'visible' } as CSSProperties}><g className="ag-bulb"><path d="M24 40c-5-3-8-8-8-14a16 16 0 0 1 32 0c0 6-3 11-8 14v5H24z" /><path d="M25 50h14M27 55h10" /><path d="M28 32l4 4 4-4" /></g><path className="ag-ray" d="M32 3v4M9 10l3 3M55 10l-3 3M5 26h4M55 26h4" /></svg>);
    default: return null;
  }
}

export const BannerAgent = () => (
  <svg width="84" height="84" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ overflow: 'visible' } as CSSProperties}><g className="ag-st"><path d="M32 10c2 12 6 16 18 18-12 2-16 6-18 18-2-12-6-16-18-18 12-2 16-6 18-18z" fill="#8FE3C8" /></g><path className="ag-tw" d="M51 8v7M47.5 11.5h7" /><path className="ag-tw ag-tw2" d="M14 46v6M11 49h6" /></svg>
);
