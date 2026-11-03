'use client';
import { useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { QuestionDeck, type DeckCard } from '../wizard/QuestionDeck';
import { useDeckDraft, type Draft } from '../wizard/useDeckDraft';
import { Err, Help, SummaryRow, Title } from '../wizard/parts';
import { cardInput, chipStyle, label } from '../ds/tokens';

export type JourneyKind = 'OBJETIVO' | 'FOCO';
export type JourneyForm = { title: string; why: string; signal: string; measure: string; levelFrom: number; levelTo: number; practice: string };
export type JourneyDraft = Draft<JourneyForm>;
export type JourneyView = { id: string; kind: JourneyKind; cycle: string; title: string; why: string; signal: string; measure: string; levelFrom: number; levelTo: number; practice: string; progress: number };
const empty: JourneyForm = { title: '', why: '', signal: '', measure: '', levelFrom: 0, levelTo: 0, practice: '' };
const LAST = 3;

export function JourneyDeck({ personId, personName, kind, skills, cycleName, draft, onDraftChange, onChangeType, onClose, onSaved }: {
  personId: string; personName: string; kind: JourneyKind; skills: string[]; cycleName: string; draft: JourneyDraft | null; onDraftChange: (d: JourneyDraft | null) => void; onChangeType: () => void; onClose: () => void; onSaved: () => void;
}) {
  const d = useDeckDraft<JourneyForm>({ scope: `journey:${kind}`, entityId: personId, empty, draft, last: LAST, onDraftChange });
  const { form, set } = d;
  const [errs, setErrs] = useState<{ title?: boolean; level?: boolean; signal?: boolean }>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isGoal = kind === 'OBJETIVO';
  const label0 = isGoal ? 'OBJETIVO' : 'FOCO DE DESENVOLVIMENTO';
  const TAG = `JORNADA · NOVA CARTA`;

  const validate = (to: number) => {
    if (to > 0 && !form.title.trim()) return { at: 0, flags: { title: true } };
    if (!isGoal && to > 1 && !(form.levelFrom > 0 && form.levelTo > form.levelFrom)) return { at: 1, flags: { level: true } };
    if (isGoal && to > 2 && !form.signal.trim()) return { at: 2, flags: { signal: true } };
    return null;
  };
  const submit = async () => {
    setBusy(true); setServerError(null);
    try {
      const r = await fetch(`/api/people/${personId}/journey`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind, title: form.title.trim(), why: form.why.trim(), signal: form.signal.trim(), measure: form.measure.trim(), practice: form.practice.trim(), ...(isGoal ? {} : { levelFrom: form.levelFrom, levelTo: form.levelTo }) }) });
      const data = await r.json();
      if (!r.ok) { setServerError(data.error ?? 'Não deu para salvar. Tente de novo.'); return; }
      d.done(); onSaved();
    } catch { setServerError('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };
  const go = (k: number) => {
    const to = Math.max(0, k);
    const e = validate(to > LAST ? 99 : to);
    if (e) { setErrs(e.flags); d.goTo(e.at); return; }
    setErrs({});
    if (to > LAST) { void submit(); return; }
    d.goTo(to);
  };
  const scale = (key: 'levelFrom' | 'levelTo', aria: string) => (
    <div role="radiogroup" aria-label={aria} style={{ display: 'flex', gap: 6 }}>{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={form[key] === n} onClick={() => { set({ [key]: n } as Partial<JourneyForm>); setErrs({}); }} style={{ ...chipStyle(form[key] === n), minWidth: 52, minHeight: 44, textAlign: 'center' }}>{n}</button>)}</div>
  );
  const kk = `${label0} · ${cycleName}`;
  void kk;

  const cards: DeckCard[] = [
    { id: 'q1', bg: '#FF8A5B', node: isGoal ? (<>
      <Title>Qual é o objetivo?</Title><Help>Vira o título da carta. Escreva como um resultado que {personName} quer alcançar.</Help>
      <textarea aria-label="Objetivo" value={form.title} onChange={(e) => { set({ title: e.target.value }); setErrs({}); }} style={{ ...cardInput, minHeight: 130, resize: 'vertical' }} />
      <Err show={errs.title}>Escreva o objetivo para seguir.</Err>
    </>) : (<>
      <Title>Qual skill {personName} vai treinar?</Title><Help>Escolha uma das skills do time ou escreva outra.</Help>
      <input type="text" aria-label="Skill" value={form.title} onChange={(e) => { set({ title: e.target.value }); setErrs({}); }} style={cardInput} />
      <div role="group" aria-label="Skills do projeto" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{skills.map((s) => <button key={s} type="button" aria-pressed={form.title === s} className="tw-chip" onClick={() => { set({ title: s }); setErrs({}); }} style={chipStyle(form.title === s)}>{s}</button>)}</div>
      <Err show={errs.title}>Escolha ou escreva uma skill para seguir.</Err>
    </>) },
    { id: 'q2', bg: '#F5F2EC', optional: isGoal, node: isGoal ? (<>
      <Title>Por que esse objetivo agora?</Title><Help>Opcional. O contexto ajuda a lembrar o combinado no fim do ciclo.</Help>
      <textarea aria-label="Por quê" value={form.why} onChange={(e) => set({ why: e.target.value })} style={{ ...cardInput, minHeight: 130, resize: 'vertical' }} />
    </>) : (<>
      <Title>Onde está e aonde quer chegar?</Title><Help>O nível de hoje e a meta para o fim do ciclo, na mesma escala das skills.</Help>
      <span style={label()}>NÍVEL HOJE</span>{scale('levelFrom', 'Nível hoje')}
      <span style={label()}>META NO FIM DO CICLO</span>{scale('levelTo', 'Meta no fim do ciclo')}
      <Err show={errs.level}>A meta precisa ser maior que o nível de hoje.</Err>
    </>) },
    { id: 'q3', bg: '#F3D36B', optional: !isGoal, node: isGoal ? (<>
      <Title>Qual sinal vamos acompanhar?</Title><Help>O que precisa acontecer para a gente saber que o objetivo foi atingido.</Help>
      <textarea aria-label="Sinal" value={form.signal} onChange={(e) => { set({ signal: e.target.value }); setErrs({}); }} style={{ ...cardInput, minHeight: 100, resize: 'vertical' }} />
      <Err show={errs.signal}>Escreva o sinal para seguir.</Err>
      <label htmlFor="jw-medida" style={label()}>PRAZO OU MEDIDA · OPCIONAL</label>
      <input id="jw-medida" type="text" value={form.measure} onChange={(e) => set({ measure: e.target.value })} style={cardInput} />
    </>) : (<>
      <Title>Como vai praticar?</Title><Help>Situações reais do dia a dia em que a skill vai ser treinada.</Help>
      <label htmlFor="jw-pratica" style={label()}>PRÓXIMOS PASSOS · OPCIONAL</label>
      <textarea id="jw-pratica" value={form.practice} onChange={(e) => set({ practice: e.target.value })} style={{ ...cardInput, minHeight: 150, resize: 'vertical' }} />
    </>) },
    { id: 'resumo', bg: '#B7A6FF', summary: true, node: (<>
      <Title>Confere a carta?</Title><Help>Ela entra na jornada do ciclo {cycleName}.</Help>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SummaryRow k={label0} v={form.title || '—'} />
        {isGoal ? <><SummaryRow k="SINAL" v={form.signal || '—'} /><SummaryRow k="PRAZO OU MEDIDA" v={form.measure || 'Sem prazo'} /></> : <><SummaryRow k="NÍVEL" v={form.levelFrom && form.levelTo ? `de ${form.levelFrom} para ${form.levelTo}` : '—'} /><SummaryRow k="PRÁTICA" v={form.practice || 'Sem passos ainda'} /></>}
      </div>
    </>) },
  ];
  return (
    <BottomSheet tag={TAG} title={isGoal ? 'Novo objetivo' : 'Novo foco de desenvolvimento'} onClose={onClose}>
      <button type="button" onClick={onChangeType} style={{ alignSelf: 'flex-start', fontFamily: 'inherit', fontSize: 14, color: '#B7A6FF', background: 'none', border: 0, minHeight: 44, cursor: 'pointer', padding: 0 }}>Trocar o tipo</button>
      <QuestionDeck tag={`${TAG} · ${cycleName}`} cards={cards} step={d.step} onGo={go} busy={busy} busyLabel="Criando carta…" error={serverError} nextLabel={d.step === LAST ? 'Criar carta' : 'Próxima'} />
    </BottomSheet>
  );
}
