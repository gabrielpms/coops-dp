'use client';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

/**
 * Ícone de "mais informação" do DS: botão redondo com "i" que abre um balão com o texto de apoio.
 * Abre ao clicar, tocar ou focar com o teclado (e ao passar o mouse); fecha com Esc, clique fora ou novo clique.
 * Use ao lado do título de uma área em vez de deixar texto explicativo solto na tela.
 */
export function InfoTip({ label, children, align = 'left' }: { label: string; children: ReactNode; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent | TouchEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away); document.addEventListener('touchstart', away); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('touchstart', away); document.removeEventListener('keydown', esc); };
  }, [open]);
  const shown = open || hover;
  return (
    <span ref={box} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <button type="button" className="coops-info" aria-label={label} aria-expanded={shown} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5" /><path d="M12 11v5.5" /><path d="M12 7.6v.01" /></svg>
      </button>
      {shown && (
        <span id={id} role="tooltip" className="coops-info-pop" style={{ position: 'absolute', top: 'calc(100% + 4px)', [align === 'left' ? 'left' : 'right']: 0, zIndex: 20, width: 300, maxWidth: 'calc(100vw - 48px)', boxSizing: 'border-box', borderRadius: 16, background: '#17171D', border: '1.5px solid #2C2C36', boxShadow: '0 24px 50px rgba(0,0,0,0.55)', padding: '12px 14px', fontSize: 14, fontWeight: 400, lineHeight: 1.45, color: '#F5F2EC', textAlign: 'left', letterSpacing: 0 }}>{children}</span>
      )}
    </span>
  );
}
