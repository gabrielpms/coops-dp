'use client';
import { useState } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import type { AvatarConfig } from '@/components/avatar/Avatar';
import { CoopsLink, useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { InitiativeDeck, type InitiativeDraft } from '@/components/initiative/InitiativeDeck';
import { label } from '@/components/ds/tokens';
import { plural } from '@/lib/format';

export type InitiativeItem = { id: string; product: string; problem: string; status: 'ABERTA' | 'ENCERRADA'; moment: number | null; createdAt: string };
const MOMENTS = ['', 'Entendimento do desafio', 'Soft prepare', 'Explore the solutions', 'Risk mitigation', 'Articulando decisões'];

export function IniciativasClient({ user, project, items, draft: d0 }: {
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; project: { id: string; name: string }; items: InitiativeItem[]; draft: InitiativeDraft | null;
}) {
  const { refresh } = useCoopsRouter();
  const [tab, setTab] = useState<'ABERTA' | 'ENCERRADA'>('ABERTA');
  const [deck, setDeck] = useState(false);
  const [draft, setDraft] = useState(d0);
  const isManager = user.role === 'MANAGER';
  const shown = items.filter((i) => i.status === tab);
  const count = (s: 'ABERTA' | 'ENCERRADA') => items.filter((i) => i.status === s).length;
  const card = { color: '#0E0E12', borderRadius: 22, border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, height: 260, boxSizing: 'border-box', boxShadow: '0 16px 36px rgba(0,0,0,0.45)', textDecoration: 'none' } as const;
  const pill = (on: boolean) => ({ fontFamily: 'inherit', fontWeight: 600, fontSize: 14, minHeight: 44, padding: '0 16px', borderRadius: 999, cursor: 'pointer', color: on ? '#0E0E12' : '#F5F2EC', background: on ? '#B7A6FF' : 'transparent', border: on ? '2px solid #0E0E12' : '1.5px solid #4A4858' }) as const;

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8, borderRadius: 32, background: '#17171D', border: '1px solid #2C2C36', padding: 'clamp(20px, 4vw, 36px)' }}>
          <CoopsLink href="/hub" style={{ fontSize: 14, minHeight: 44, display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start' }}>← Hub de projetos</CoopsLink>
          <span style={{ ...label(12, '0.1em'), color: '#B7A6FF' }}>{project.name.toUpperCase()}</span>
          <h1 style={{ margin: 0, fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1 }}>Iniciativas</h1>
          <div role="tablist" aria-label="Filtrar iniciativas" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <button type="button" role="tab" aria-selected={tab === 'ABERTA'} onClick={() => setTab('ABERTA')} style={pill(tab === 'ABERTA')}>Em andamento · {count('ABERTA')}</button>
            <button type="button" role="tab" aria-selected={tab === 'ENCERRADA'} onClick={() => setTab('ENCERRADA')} style={pill(tab === 'ENCERRADA')}>Encerradas · {count('ENCERRADA')}</button>
          </div>
        </section>
        <section aria-label="Lista de iniciativas" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {isManager && tab === 'ABERTA' && (
            <button type="button" onClick={() => setDeck(true)} className="coops-card" aria-label="Nova iniciativa" style={{ ...card, background: 'transparent', color: '#F5F2EC', border: '2px dashed #4A4858', boxShadow: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'inherit' }}>
              <span aria-hidden="true" style={{ fontSize: 40, lineHeight: 1 }}>+</span><span style={{ fontSize: 20, fontWeight: 700 }}>Nova iniciativa</span>
              {draft && <span style={{ ...label(11, '0.06em'), color: '#B7A6FF' }}>RASCUNHO SALVO</span>}
            </button>
          )}
          {shown.map((i) => (
            <div key={i.id} style={{ ...card, background: i.status === 'ENCERRADA' ? '#CFCDD6' : '#B7A6FF' }}>
              <span style={label(11, '0.08em')}>{i.moment ? `MOMENTO ${i.moment} · ${MOMENTS[i.moment].toUpperCase()}` : 'MOMENTO · A IDENTIFICAR'}</span>
              <span style={{ marginTop: 'auto', fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{i.product}</span>
              <span style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 10, fontSize: 13, lineHeight: 1.4 }}>{i.problem || 'Problema ainda não informado.'}</span>
            </div>
          ))}
          {shown.length === 0 && !(isManager && tab === 'ABERTA') && <p style={{ margin: 0, color: '#A3A1AD', fontSize: 16 }}>Nenhuma iniciativa {tab === 'ABERTA' ? 'em andamento' : 'encerrada'} ainda.</p>}
        </section>
        <p style={{ margin: 0, color: '#A3A1AD', fontSize: 14 }}>{items.length} {plural(items.length, 'iniciativa', 'iniciativas')} no projeto. A conferência do agente e a mesa entram nos próximos passos do Marco 4.</p>
      </div>
      {deck && <InitiativeDeck projectId={project.id} draft={draft} onDraftChange={setDraft} onClose={() => setDeck(false)} onSaved={() => { setDeck(false); refresh(); }} />}
    </div>
  );
}
