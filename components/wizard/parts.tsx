import type { ReactNode } from 'react';

/** Peças de texto comuns às cartas dos decks de perguntas. */
export const Title = ({ children }: { children: ReactNode }) => <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{children}</span>;
export const Help = ({ children }: { children: ReactNode }) => <span style={{ fontSize: 14, lineHeight: 1.45 }}>{children}</span>;
export const Err = ({ show, children }: { show?: boolean; children: ReactNode }) => (show ? <span role="alert" style={{ fontSize: 14, fontWeight: 600 }}>{children}</span> : null);
export const SummaryRow = ({ k, v }: { k: string; v: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 12, background: 'rgba(245,242,236,0.6)', border: '1.5px solid #0E0E12', padding: '10px 12px' }}>
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.06em' }}>{k}</span><span style={{ fontSize: 14, lineHeight: 1.4 }}>{v}</span>
  </div>
);

import { cardInput, darkBtn, removableChip } from '../ds/tokens';

/** Campo + botão "Adicionar" (Enter também adiciona). Definido fora do deck para não perder o foco a cada tecla. */
export function AddRow({ value, onChange, onAdd, placeholder, aria }: { value: string; onChange: (v: string) => void; onAdd: () => void; placeholder: string; aria: string }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onAdd(); }} style={{ display: 'flex', gap: 8 }}>
      <input type="text" aria-label={aria} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} style={{ ...cardInput, flex: '1 1 auto' }} />
      <button type="submit" style={darkBtn}>Adicionar</button>
    </form>
  );
}
export function ChipList({ items, onRemove }: { items: string[]; onRemove: (i: number) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map((it, i) => (
        <button key={it} type="button" onClick={() => onRemove(i)} aria-label={`Remover ${it}`} className="tw-chip" style={removableChip}>
          {it}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      ))}
    </div>
  );
}
