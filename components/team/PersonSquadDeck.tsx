'use client';
import { useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { QuestionDeck, type DeckCard } from '../wizard/QuestionDeck';
import { Help, SummaryRow, Title } from '../wizard/parts';
import { SquadChoice, type SquadOpt } from './SquadChoice';

const TAG = 'PESSOA · SQUAD';

/** Manager coloca a pessoa em um squad (ou a tira de todos): uma pergunta e a confirmação, no mesmo fluxo dos outros decks. */
export function PersonSquadDeck({ projectId, person, squads, currentSquadId, onClose, onSaved }: {
  projectId: string; person: { id: string; name: string }; squads: SquadOpt[]; currentSquadId: string | null; onClose: () => void; onSaved: () => void;
}) {
  const [squadId, setSquadId] = useState<string | null>(currentSquadId);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const first = person.name.split(' ')[0];
  const chosen = squads.find((q) => q.id === squadId);

  const submit = async () => {
    setBusy(true); setError(null);
    try {
      const r = await fetch(`/api/projects/${projectId}/people/${person.id}/squad`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ squadId }) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { setError(data.error ?? 'Não deu para salvar. Tente de novo.'); return; }
      onSaved();
    } catch { setError('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };
  const go = (k: number) => { const to = Math.max(0, k); if (to > 1) { void submit(); return; } setStep(to); };

  const cards: DeckCard[] = [
    { id: 'squad', bg: '#8FE3C8', node: (<>
      <Title>Em qual squad {first} fica?</Title>
      <Help>{squads.length ? 'A pessoa senta à mesa do squad escolhido. Quem já estava em outro squad muda para este.' : 'Ainda não há squads neste projeto. Crie um na tela Time.'}</Help>
      <SquadChoice squads={squads} value={squadId} onChange={setSquadId} />
    </>) },
    { id: 'resumo', bg: '#B7A6FF', summary: true, node: (<>
      <Title>Confere?</Title><Help>{squadId ? `${person.name} passa a sentar à mesa de ${chosen?.name ?? 'este squad'}.` : `${person.name} fica sem squad.`}</Help>
      <SummaryRow k="PESSOA" v={person.name} /><SummaryRow k="SQUAD" v={chosen?.name ?? 'Sem squad'} />
    </>) },
  ];
  return (
    <BottomSheet tag={TAG} title={`Squad de ${person.name}`} sub="Uma pergunta por carta." onClose={onClose}>
      <QuestionDeck tag={TAG} cards={cards} step={step} onGo={go} busy={busy} busyLabel="Salvando…" error={error} nextLabel={step === 1 ? 'Salvar squad' : 'Próxima'} />
    </BottomSheet>
  );
}
