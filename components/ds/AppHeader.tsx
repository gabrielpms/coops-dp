'use client';
import { useEffect, useRef, useState } from 'react';
import { Avatar, type AvatarConfig } from '../avatar/Avatar';
import { usePathname } from 'next/navigation';
import { CoopsLink, useCoopsRouter } from '../nav/useCoopsRouter';
import { useProject } from './ProjectContext';
import { label } from './tokens';

export const DEFAULT_AVATAR: AvatarConfig = { skin: '#E0B08A', hairStyle: 'longo', shirtStyle: 'blazer', bg: '#F3D36B' };

export function AppHeader({ name, email, role, avatar }: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar?: AvatarConfig | null }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const { go } = useCoopsRouter();
  const project = useProject();
  const path = usePathname() ?? '';
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <CoopsLink href="/hub" aria-label="Ir para o hub de projetos" style={{ color: '#F5F2EC', textDecoration: 'none', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>coops<span style={{ color: '#B7A6FF' }}>.</span></CoopsLink>
        {project && (() => {
          const base = `/p/${project.id}`;
          const items: { key: string; label: string; href: string; on: boolean }[] = role === 'MANAGER'
            ? [{ key: 'time', label: 'Gestão de time', href: `${base}/time`, on: /^\/p\/[^/]+\/(time|squads|pessoas)(\/|$)/.test(path) }, { key: 'ini', label: 'Iniciativas', href: `${base}/iniciativas`, on: /^\/p\/[^/]+\/iniciativas(\/|$)/.test(path) }]
            : [...(project.mePersonId ? [{ key: 'me', label: 'Meu perfil', href: `${base}/pessoas/${project.mePersonId}`, on: /^\/p\/[^/]+\/pessoas(\/|$)/.test(path) }] : []), { key: 'ini', label: 'Iniciativas', href: `${base}/iniciativas`, on: /^\/p\/[^/]+\/iniciativas(\/|$)/.test(path) }];
          return (<>
            <span style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: '2px 10px', fontSize: 14, color: '#A3A1AD', border: '1px solid #2C2C36', borderRadius: 18, padding: '6px 14px' }}>
              <span style={{ display: 'inline-flex', flexDirection: 'column' }}><span style={{ ...label(10, '0.08em'), color: '#A3A1AD' }}>PROJETO</span><span style={{ color: '#F5F2EC', fontWeight: 600 }}>{project.name}</span></span>
              {project.manager && <><span aria-hidden="true" style={{ width: 1, alignSelf: 'stretch', background: '#2C2C36' }} /><span style={{ display: 'inline-flex', flexDirection: 'column' }}><span style={{ ...label(10, '0.08em'), color: '#A3A1AD' }}>MANAGER</span><span style={{ color: '#F5F2EC', fontWeight: 600 }}>{project.manager.isMe ? `${project.manager.name} (você)` : project.manager.name}</span></span></>}
            </span>
            <nav aria-label="Produtos" style={{ display: 'flex', gap: 4, background: '#17171D', border: '1px solid #2C2C36', borderRadius: 14, padding: 4 }}>
              {items.map((i) => <CoopsLink key={i.key} href={i.href} aria-current={i.on ? 'page' : undefined} style={{ color: i.on ? '#0E0E12' : '#A3A1AD', background: i.on ? '#B7A6FF' : 'transparent', textDecoration: 'none', fontWeight: i.on ? 600 : 400, fontSize: 14, borderRadius: 10, padding: '10px 16px', minHeight: 20 }}>{i.label}</CoopsLink>)}
            </nav>
          </>);
        })()}
      </div>
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
              <a role="menuitem" className="hb-item" href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#F5F2EC', textDecoration: 'none', borderRadius: 14, padding: '10px 12px', minHeight: 48, boxSizing: 'border-box' }}>
                <span style={{ flex: 'none', width: 36, height: 36, borderRadius: 10, background: '#B7A6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg>
                </span>
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{role === 'MANAGER' ? 'Administração' : 'Meus dados'}</span>
                  <span style={{ fontSize: 12, color: '#A3A1AD' }}>{role === 'MANAGER' ? 'Projetos, lideranças, skills e seus dados' : 'Edite o seu avatar'}</span>
                </span>
              </a>
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
