'use client';
import { useState, type ReactNode } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { QuestionDeck, type DeckCard } from '../wizard/QuestionDeck';
import { useDeckDraft, type Draft } from '../wizard/useDeckDraft';
import { Avatar, type AvatarConfig } from '../avatar/Avatar';
import { cardInput, label } from '../ds/tokens';
import { SQUAD_COLORS } from '@/lib/validation';

export type SquadForm = { name: string; color: string; members: { personId: string; crown: boolean }[] };
export type SquadDraft = Draft<SquadForm>;
export type PersonOption = { id: string; name: string; title: string; avatar: AvatarConfig | null };
const empty = (): SquadForm => ({ name: '', color: SQUAD_COLORS[0], members: [] });
const LAST = 3;
const TAG = 'TIME · NOVO SQUAD';

const Title = ({ children }: { children: ReactNode }) => <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{children}</span>;
const Help = ({ children }: { children: ReactNode }) => <span style={{ fontSize: 14, lineHeight: 1.45 }}>{children}</span>;

export function SquadDeck({ projectId, persons, draft, onDraftChange, onClose, onSaved }: {
  projectId: string; persons: PersonOption[]; draft: SquadDraft | null; onDraftChange: (d: SquadDraft | null) => void; onClose: () => void; onSaved: () => void;
}) {
  const d = useDeckDraft<SquadForm>({ scope: 'squad', entityId: projectId, empty: empty(), draft, last: LAST, onDraftChange });
  const { form, set } = d;
  const [errName, setErrName] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // rascunho pode citar alguém que já saiu do time
  const members = form.members.filter((m) => persons.some((p) => p.id === m.personId));

  const submit = async () => {
    setBusy(true); setServerError(null);
    try {
      const r = await fetch(`/api/projects/${projectId}/squads`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: form.name.trim(), color: form.color, members }) });
      const data = await r.json();
      if (!r.ok) { setServerError(data.error ?? 'Não deu para salvar. Tente de novo.'); return; }
      d.done(); onSaved();
    } catch { setServerError('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };
  const go = (k: number) => {
    const to = Math.max(0, k);
    if (to > 0 && !form.name.trim()) { setErrName(true); d.goTo(0); return; }
    setErrName(false);
    if (to > LAST) { void submit(); return; }
    d.goTo(to);
  };
  const isIn = (id: string) => members.some((m) => m.personId === id);
  const toggleMember = (id: string) => set({ members: isIn(id) ? members.filter((m) => m.personId !== id) : [...members, { personId: id, crown: false }] });
  const toggleCrown = (id: string) => set({ members: members.map((m) => (m.personId === id ? { ...m, crown: !m.crown } : m)) });

  const cards: DeckCard[] = [
    { id: 'nome', bg: '#F5A9D6', node: (<>
      <Title>Como o squad se chama?</Title><Help>O nome vira filtro e aparece na mesa do squad.</Help>
      <input type="text" aria-label="Nome do squad" placeholder="Ex.: Onboarding" value={form.name} onChange={(e) => { set({ name: e.target.value }); setErrName(false); }} style={cardInput} />
      {errName && <span role="alert" style={{ fontSize: 14, fontWeight: 600 }}>Escreva o nome do squad para seguir.</span>}
    </>) },
    { id: 'cor', bg: '#F3D36B', optional: true, node: (<>
      <Title>Qual a cor do squad?</Title><Help>Identifica o squad nos filtros e na mesa do time.</Help>
      <div role="group" aria-label="Cor do squad" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {SQUAD_COLORS.map((c) => <button key={c} type="button" aria-label={`Cor ${c}`} aria-pressed={form.color === c} className="tw-sw" onClick={() => set({ color: c })} style={{ width: 48, height: 48, borderRadius: '50%', background: c, border: '2px solid #0E0E12', cursor: 'pointer', padding: 0, boxShadow: form.color === c ? '0 0 0 3px #F5F2EC, 0 0 0 5px #0E0E12' : 'none' }} />)}
      </div>
    </>) },
    { id: 'membros', bg: '#8FE3C8', optional: true, node: (<>
      <Title>Quem faz parte do squad?</Title><Help>Toque para incluir. A coroa marca quem é referência no squad.</Help>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {persons.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 14, border: '1.5px solid #0E0E12', background: isIn(p.id) ? '#F5F2EC' : 'rgba(245,242,236,0.45)', padding: '6px 8px' }}>
            <button type="button" aria-pressed={isIn(p.id)} onClick={() => toggleMember(p.id)} style={{ flex: 1, minWidth: 0, minHeight: 44, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', background: 'transparent', border: 0, cursor: 'pointer', fontFamily: 'inherit', color: '#0E0E12' }}>
              <span style={{ lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12' }}><Avatar {...(p.avatar ?? {})} size={40} label="" /></span>
              <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}><span style={{ fontSize: 15, fontWeight: 700 }}>{p.name}</span>{p.title && <span style={{ fontSize: 12 }}>{p.title}</span>}</span>
              <span style={{ marginLeft: 'auto', ...label(10), border: '1.5px solid #0E0E12', borderRadius: 999, padding: '3px 8px', background: isIn(p.id) ? '#0E0E12' : 'transparent', color: isIn(p.id) ? '#F5F2EC' : '#0E0E12' }}>{isIn(p.id) ? 'NO SQUAD' : 'INCLUIR'}</span>
            </button>
            {isIn(p.id) && <button type="button" aria-pressed={members.find((m) => m.personId === p.id)?.crown} aria-label={`Coroa para ${p.name}`} className="tw-crown" onClick={() => toggleCrown(p.id)}
              style={{ width: 44, height: 44, borderRadius: 12, border: '1.5px solid #0E0E12', background: members.find((m) => m.personId === p.id)?.crown ? '#F3D36B' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="3" strokeLinejoin="round" aria-hidden="true"><path d="M8 50 12 18l14 14 6-18 6 18 14-14 4 32z" /></svg></button>}
          </div>
        ))}
      </div>
    </>) },
    { id: 'resumo', bg: '#B7A6FF', summary: true, node: (<>
      <Title>Confere o squad?</Title><Help>{members.length ? `${members.length} ${members.length === 1 ? 'pessoa' : 'pessoas'} no squad.` : 'Dá para incluir pessoas depois.'}</Help>
      <div aria-hidden="true" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 18, background: '#F5F2EC', border: '2px solid #0E0E12', padding: '14px 18px' }}>
        <span style={{ width: 16, height: 16, borderRadius: '50%', background: form.color, border: '2px solid #0E0E12' }} />
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{form.name || 'Nome do squad'}</span>
      </div>
    </>) },
  ];
  return (
    <BottomSheet tag={TAG} title="Novo squad" onClose={onClose}>
      <QuestionDeck tag={TAG} cards={cards} step={d.step} onGo={go} busy={busy} busyLabel="Criando squad…" error={serverError} nextLabel={d.step === LAST ? 'Criar squad' : 'Próxima'} />
    </BottomSheet>
  );
}
