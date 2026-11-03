'use client';
import type { ReactNode } from 'react';
import { label } from '../ds/tokens';
import { Spinner } from '../ds/ScreenLoader';

export type DeckCard = { id: string; bg: string; optional?: boolean; summary?: boolean; node: ReactNode };

/** Deck de perguntas: uma carta por vez, as próximas aparecem atrás, as respondidas saem pela esquerda. */
export function QuestionDeck({ tag, cards, step, onGo, nextLabel, busy, busyLabel = 'Salvando…', error }: {
  tag: string; cards: DeckCard[]; step: number; onGo: (k: number) => void; nextLabel: string; busy?: boolean; busyLabel?: string; error?: string | null;
}) {
  const last = cards.length - 1;
  const m = cards.length - 1; // total de perguntas (o resumo não conta)
  return (
    <>
      <div style={{ position: 'relative', height: 480, margin: '16px 28px 0 0' }}>
        {cards.map((c, i) => {
          const g = i - step;
          const t = g < 0 ? 'translate(-118%, 24px) rotate(-12deg)' : `translate(${g * 16}px, ${-g * 12}px) rotate(${g * 3}deg) scale(${1 - g * 0.03})`;
          const active = g === 0;
          return (
            <div key={c.id} className="coops-wz-card" aria-hidden={!active} inert={!active}
              style={{ position: 'absolute', inset: 0, boxSizing: 'border-box', borderRadius: 26, background: c.bg, color: '#0E0E12', border: '2px solid #0E0E12', padding: 26, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto',
                transform: t, opacity: g < 0 ? 0 : g > 2 ? 0 : 1, zIndex: g < 0 ? 20 : 10 - g, pointerEvents: active ? 'auto' : 'none', boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
                transition: 'transform 520ms cubic-bezier(.65,0,.25,1), opacity 400ms ease' }}>
              <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8, ...label(11, '0.08em') }}>
                <span>{i === last ? 'RESUMO' : `PERGUNTA ${i + 1} DE ${m}${c.optional ? ' · OPCIONAL' : ''}`}</span><span>{tag}</span>
              </span>
              {c.node}
            </div>
          );
        })}
      </div>
      {busy && <span role="status" aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{busyLabel}</span>}
      {error && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{error}</span>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
        <button type="button" onClick={() => step > 0 && onGo(step - 1)} style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 15, color: '#F5F2EC', background: 'transparent', border: '1.5px solid #4A4858', borderRadius: 14, minHeight: 48, padding: '0 18px', cursor: 'pointer', opacity: step === 0 ? 0.4 : 1 }}>Voltar</button>
        <div style={{ display: 'flex', gap: 2 }}>
          {cards.map((c, k) => (
            <button key={c.id} type="button" aria-label={`Ir para a pergunta ${k + 1}`} onClick={() => onGo(k)} style={{ width: 28, height: 44, padding: 0, border: 0, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 22, height: 6, borderRadius: 3, background: k <= step ? '#B7A6FF' : '#2C2C36' }} />
            </button>
          ))}
        </div>
        <button type="button" disabled={busy} onClick={() => onGo(step + 1)} style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 15, color: '#0E0E12', background: '#B7A6FF', border: '2px solid #0E0E12', borderRadius: 14, minHeight: 48, padding: '0 20px', cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', gap: 10 }}>{busy && <Spinner />}{busy ? busyLabel : nextLabel}</button>
      </div>
    </>
  );
}
