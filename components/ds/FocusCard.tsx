'use client';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * Carta em foco: abre a partir da posição da carta clicada (`coopsFocusIn`/`coopsFocusOut` com --fdx, --fdy, --fs)
 * e volta para ela ao fechar. Esc e clique fora fecham.
 */
export function FocusCard({ origin, bg, ariaLabel, onClose, children }: { origin: DOMRect | null; bg: string; ariaLabel: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vars, setVars] = useState<CSSProperties>({});
  const [leaving, setLeaving] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current; if (!el || !origin) return;
    const r = el.getBoundingClientRect();
    const dx = origin.left + origin.width / 2 - (r.left + r.width / 2);
    const dy = origin.top + origin.height / 2 - (r.top + r.height / 2);
    setVars({ ['--fdx' as string]: `${Math.round(dx)}px`, ['--fdy' as string]: `${Math.round(dy)}px`, ['--fs' as string]: String(Math.min(1, origin.width / r.width).toFixed(3)) } as CSSProperties);
  }, [origin]);

  const close = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !origin) { onClose(); return; }
    setLeaving(true); window.setTimeout(onClose, 260);
  };
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const ov = document.body.style.overflow; document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = ov; window.removeEventListener('keydown', esc); prev?.focus?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <button type="button" aria-label="Fechar" onClick={close} className="coops-overlay" style={{ position: 'fixed', inset: 0, zIndex: 90, border: 0, padding: 0, background: 'rgba(14,14,18,0.78)', backdropFilter: 'blur(3px)', cursor: 'pointer' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
        <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={ariaLabel}
          style={{ ...vars, pointerEvents: 'auto', width: 'min(560px, 100%)', maxHeight: 'calc(100vh - 32px)', overflowY: 'auto', boxSizing: 'border-box', borderRadius: 26, background: bg, color: '#0E0E12', border: '2px solid #0E0E12', padding: 28, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 30px 80px rgba(0,0,0,0.6)', outline: 'none',
            animation: leaving ? 'coopsFocusOut 260ms cubic-bezier(.65,0,.25,1) both' : origin ? 'coopsFocusIn 420ms cubic-bezier(.22,1,.36,1) both' : 'coopsRise 320ms ease both' }}>
          {children}
        </div>
      </div>
    </>
  );
}
