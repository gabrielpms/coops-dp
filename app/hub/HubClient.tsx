'use client';
import { useState } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import { ProjectCard } from '@/components/ds/ProjectCard';
import { ProjectDeck } from '@/components/wizard/ProjectDeck';
import { useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { label } from '@/components/ds/tokens';

export function HubClient({ user, projects }: { user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: any }; projects: any[] }) {
  const [deck, setDeck] = useState(false);
  const { refresh } = useCoopsRouter();
  const first = user.name.split(' ')[0];
  const isManager = user.role === 'MANAGER';
  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 56px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
        <AppHeader {...user} />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ ...label(12, '0.1em'), color: '#B7A6FF' }}>HUB DE PROJETOS</span>
            <h1 style={{ margin: 0, fontSize: 48, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1 }}>Olá, {first}.</h1>
            <p style={{ margin: 0, fontSize: 17, color: '#A3A1AD' }}>Cada projeto conecta a gestão de time e as iniciativas da mesma empresa.</p>
          </div>
          {isManager && <button type="button" className="hb-new" onClick={() => setDeck(true)} style={{ color: '#0E0E12', background: '#B7A6FF', border: 0, fontWeight: 600, fontSize: 15, borderRadius: 14, padding: '14px 20px', minHeight: 48, cursor: 'pointer' }}>+ Novo projeto</button>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
          {projects.map((p, i) => <ProjectCard key={p.id} p={p} depth={i === 0 ? 2 : 1} />)}
          {isManager && (
            <button type="button" className="hb-add" onClick={() => setDeck(true)} style={{ cursor: 'pointer', background: 'transparent', flex: '0 1 342px', minHeight: 380, marginTop: 14, boxSizing: 'border-box', borderRadius: 26, border: '1.5px dashed #4A4858', color: '#F5F2EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 }}>
              <span style={{ width: 56, height: 56, borderRadius: 16, border: '1.5px solid #4A4858', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              </span>
              <span style={{ fontSize: 20, fontWeight: 700 }}>Novo projeto</span>
              <span style={{ fontSize: 14, color: '#A3A1AD', textAlign: 'center', maxWidth: 220 }}>Empresa, estratégia, skills e mercado em um só deck</span>
            </button>
          )}
          {!isManager && !projects.length && <p style={{ color: '#A3A1AD', fontSize: 17, maxWidth: 520 }}>Você ainda não está em nenhum projeto. Quando um manager aceitar seu convite, o projeto aparece aqui.</p>}
        </div>
      </div>
      {deck && <ProjectDeck mode="create" onClose={() => setDeck(false)} onSaved={() => { setDeck(false); refresh(); }} />}
    </div>
  );
}
