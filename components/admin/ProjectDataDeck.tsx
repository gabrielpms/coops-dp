'use client';
import { useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { QuestionDeck, type DeckCard } from '../wizard/QuestionDeck';
import { useDeckDraft, type Draft } from '../wizard/useDeckDraft';
import { AddRow, ChipList, Err, Help, SummaryRow, Title } from '../wizard/parts';
import { cardInput, chipStyle, label } from '../ds/tokens';
import { INDICATOR_SUGGESTIONS, SEGMENTS } from '@/lib/validation';

export type ProjectDataForm = { name: string; segment: string; indicators: string[]; competitors: string[] };
export type ProjectDataDraft = Draft<ProjectDataForm>;
const LAST = 3;
const TAG = 'PROJETO · DADOS';

export function ProjectDataDeck({ projectId, initial, draft, onDraftChange, onClose, onSaved }: { projectId: string; initial: ProjectDataForm; draft: ProjectDataDraft | null; onDraftChange: (d: ProjectDataDraft | null) => void; onClose: () => void; onSaved: () => void }) {
  const d = useDeckDraft<ProjectDataForm>({ scope: 'pdata', entityId: projectId, empty: initial, draft, last: LAST, onDraftChange });
  const { form, set } = d;
  const [errs, setErrs] = useState<{ name?: boolean; segment?: boolean }>({});
  const [typed, setTyped] = useState({ ind: '', con: '' });
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (to: number) => {
    if (to > 0 && !form.name.trim()) return { at: 0, flags: { name: true } };
    if (to > 0 && !form.segment.trim()) return { at: 0, flags: { segment: true } };
    return null;
  };
  const submit = async () => {
    setBusy(true); setServerError(null);
    try {
      const r = await fetch(`/api/projects/${projectId}/data`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: form.name.trim(), segment: form.segment.trim(), indicators: form.indicators, competitors: form.competitors }) });
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
  const add = (key: 'ind' | 'con', field: 'indicators' | 'competitors') => { const v = typed[key].trim(); if (!v) return; if (!form[field].includes(v)) set({ [field]: [...form[field], v] } as Partial<ProjectDataForm>); setTyped((t) => ({ ...t, [key]: '' })); };
  const rm = (field: 'indicators' | 'competitors', i: number) => set({ [field]: form[field].filter((_, j) => j !== i) } as Partial<ProjectDataForm>);

  const cards: DeckCard[] = [
    { id: 'empresa', bg: '#A9D8F5', node: (<>
      <Title>Qual é a empresa e o segmento?</Title><Help>O nome aparece no hub e o segmento na carta do projeto.</Help>
      <input type="text" aria-label="Nome da empresa" value={form.name} onChange={(e) => { set({ name: e.target.value }); setErrs((x) => ({ ...x, name: false })); }} style={cardInput} />
      <Err show={errs.name}>Escreva o nome da empresa para seguir.</Err>
      <label htmlFor="pd-seg" style={label()}>SEGMENTO · ESCOLHA UM OU ESCREVA O SEU</label>
      <input id="pd-seg" type="text" maxLength={60} placeholder="Ex.: Seguros, Games, Setor público…" value={form.segment} onChange={(e) => { set({ segment: e.target.value }); setErrs((x) => ({ ...x, segment: false })); }} style={cardInput} />
      <div role="group" aria-label="Atalhos de segmento" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{SEGMENTS.map((s) => { const on = form.segment.trim().toLowerCase() === s.toLowerCase(); return <button key={s} type="button" aria-pressed={on} className="tw-chip" onClick={() => { set({ segment: s }); setErrs((x) => ({ ...x, segment: false })); }} style={chipStyle(on)}>{s}</button>; })}</div>
      <Err show={errs.segment}>Escolha ou escreva o segmento para seguir.</Err>
    </>) },
    { id: 'indicadores', bg: '#F3D36B', optional: true, node: (<>
      <Title>Quais são os indicadores-chave?</Title><Help>Os números que mostram se o produto vai bem. Eles orientam iniciativas e entregas.</Help>
      <AddRow value={typed.ind} onChange={(v) => setTyped((t) => ({ ...t, ind: v }))} onAdd={() => add('ind', 'indicators')} placeholder="Ex.: Retenção em 30 dias" aria="Novo indicador" />
      <ChipList items={form.indicators} onRemove={(i) => rm('indicators', i)} />
      <span style={label()}>SUGESTÕES</span>
      <div role="group" aria-label="Sugestões de indicador" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{INDICATOR_SUGGESTIONS.filter((s) => !form.indicators.includes(s)).map((s) => <button key={s} type="button" className="tw-chip" onClick={() => set({ indicators: [...form.indicators, s] })} style={chipStyle(false)}>+ {s}</button>)}</div>
    </>) },
    { id: 'concorrentes', bg: '#F5A9D6', optional: true, node: (<>
      <Title>Quem são os concorrentes?</Title><Help>Ficam no deck da empresa e ajudam o agente a comparar soluções nas iniciativas.</Help>
      <AddRow value={typed.con} onChange={(v) => setTyped((t) => ({ ...t, con: v }))} onAdd={() => add('con', 'competitors')} placeholder="Ex.: Lume Bank" aria="Novo concorrente" />
      <ChipList items={form.competitors} onRemove={(i) => rm('competitors', i)} />
    </>) },
    { id: 'resumo', bg: '#B7A6FF', summary: true, node: (<>
      <Title>Confere os dados?</Title><Help>Tudo isso alimenta o deck da empresa no projeto.</Help>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SummaryRow k="EMPRESA" v={`${form.name || '—'} · ${form.segment || 'sem segmento'}`} />
        <SummaryRow k="INDICADORES-CHAVE" v={form.indicators.length ? form.indicators.join(', ') : 'Nenhum ainda'} />
        <SummaryRow k="CONCORRENTES" v={form.competitors.length ? form.competitors.join(', ') : 'Nenhum ainda'} />
      </div>
    </>) },
  ];
  return (
    <BottomSheet tag={TAG} title="Dados do projeto" onClose={onClose}>
      <QuestionDeck tag={TAG} cards={cards} step={d.step} onGo={go} busy={busy} busyLabel="Salvando…" error={serverError} nextLabel={d.step === LAST ? 'Salvar dados' : 'Próxima'} />
    </BottomSheet>
  );
}
