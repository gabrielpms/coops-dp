'use client';
import { useEffect, useRef, useState } from 'react';
import { Avatar, type AvatarConfig } from '../avatar/Avatar';
import { useCoopsRouter } from '../nav/useCoopsRouter';
import { label } from './tokens';

export const DEFAULT_AVATAR: AvatarConfig = { skin: '#E0B08A', hairStyle: 'longo', shirtStyle: 'blazer', bg: '#F3D36B' };

export function AppHeader({ name, email, role, avatar }: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar?: AvatarConfig | null }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const { go } = useCoopsRouter();
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [open]);

  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); go('/', { replace: true }); };

  return (
    <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>coops<span style={{ color: '#B7A6FF' }}>.</span></span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ ...label(12, '0'), color: '#0E0E12', background: '#B7A6FF', borderRadius: 999, padding: '6px 10px' }}>{role}</span>
        <div ref={box} style={{ position: 'relative' }}>
          <button type="button" className="hb-av" onClick={() => setOpen((o) => !o)} aria-haspopup="true" aria-expanded={open} aria-label="Abrir o menu da sua conta"
            style={{ display: 'block', padding: 0, border: 0, background: 'transparent', borderRadius: '50%', cursor: 'pointer', lineHeight: 0, boxShadow: open ? '0 0 0 2px #0E0E12, 0 0 0 4px #B7A6FF' : 'none' }}>
            <Avatar {...(avatar ?? DEFAULT_AVATAR)} crown={role === 'MANAGER' ? true : avatar?.crown} size={44} label="Seu avatar" />
          </button>
          {open && (
            <div role="menu" aria-label="Sua conta" style={{ animation: 'hbPop 260ms cubic-bezier(.34,1.4,.64,1) both', transformOrigin: 'top right', position: 'absolute', right: 0, top: 56, zIndex: 20, width: 280, maxWidth: 'calc(100vw - 32px)', boxSizing: 'border-box', borderRadius: 22, background: '#17171D', border: '1.5px solid #2C2C36', boxShadow: '0 24px 50px rgba(0,0,0,0.55)', padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 12px 12px', borderBottom: '1px solid #2C2C36', marginBottom: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{name}</span><span style={{ fontSize: 13, color: '#A3A1AD' }}>{email}</span>
              </div>
              <button type="button" role="menuitem" className="hb-item" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit', color: '#A3A1AD', background: 'transparent', border: 0, textAlign: 'left', borderRadius: 14, padding: '10px 12px', minHeight: 48, cursor: 'pointer' }}>
                <span style={{ flex: 'none', width: 36, height: 36, borderRadius: 10, border: '1.5px solid #3A3846', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11" /></svg>
                </span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
