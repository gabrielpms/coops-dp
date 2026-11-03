'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { label } from '../ds/tokens';

/** Um sheet por vez: o componente é montado por quem o controla; este contador garante o aviso em dev. */
let openSheets = 0;

export function BottomSheet({ tag, title, onClose, children }: { tag: string; title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    openSheets++;
    if (process.env.NODE_ENV !== 'production' && openSheets > 1) console.error('[coops] dois bottom sheets abertos ao mesmo tempo');
    const prev = document.activeElement as HTMLElement | null;
    const body = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => { openSheets--; document.body.style.overflow = body; window.removeEventListener('keydown', esc); prev?.focus?.(); };
  }, [onClose]);
  return (
    <>
      <button type="button" aria-label="Fechar" onClick={onClose} className="coops-overlay"
        style={{ position: 'fixed', inset: 0, zIndex: 90, border: 0, padding: 0, background: 'rgba(14,14,18,0.72)', backdropFilter: 'blur(3px)', cursor: 'pointer' }} />
      <section ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className="coops-sheet"
        style={{ animation: 'coopsSheetIn 560ms cubic-bezier(.22,1,.36,1) both', position: 'fixed', left: 0, right: 0, bottom: 0, maxHeight: 'calc(100% - 64px)', zIndex: 100, background: '#0E0E12',
          borderRadius: '32px 32px 0 0', borderTop: '3px solid #B7A6FF', boxShadow: '0 -30px 80px rgba(0,0,0,0.6)', overflowY: 'auto', overflowX: 'hidden', padding: '12px 32px 40px', boxSizing: 'border-box', outline: 'none' }}>
        <div aria-hidden="true" style={{ width: 56, height: 5, borderRadius: 3, background: '#4A4858', margin: '0 auto 14px' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ ...label(12, '0'), color: '#B7A6FF' }}>{tag}</span>
              <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em' }}>{title}</h2>
              <span style={{ fontSize: 13, color: '#A3A1AD' }}>Uma pergunta por carta.</span>
            </div>
            <button type="button" aria-label="Fechar" onClick={onClose}
              style={{ flex: '0 0 44px', height: 44, borderRadius: 14, background: '#212129', border: '1.5px solid #3A3846', color: '#F5F2EC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>
          {children}
        </div>
      </section>
    </>
  );
}
