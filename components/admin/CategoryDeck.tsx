'use client';
import { useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { QuestionDeck, type DeckCard } from '../wizard/QuestionDeck';
import { useDeckDraft, type Draft } from '../wizard/useDeckDraft';
import { AddRow, ChipList, Err, Help, SummaryRow, Title } from '../wizard/parts';
import { cardInput, chipStyle, label } from '../ds/tokens';
import { CATEGORY_SUGGESTIONS } from '@/lib/validation';

export type CategoryForm = { name: string; skills: string[] };
export type CategoryDraft = Draft<CategoryForm>;
export type CategoryView = { id: string; name: string; skills: string[] };
const LAST = 2;

/** Categoria de skill: criar (com rascunho) ou editar/remover (sem rascunho: o valor de partida é o registro). */
export function CategoryDeck({ projectId, editing, loose, draft, onDraftChange, onClose, onSaved }: {
  projectId: string; editing: CategoryView | null; loose: string[]; draft: CategoryDraft | null; onDraftChange: (d: CategoryDraft | null) => void; onClose: () => void; onSaved: () => void;
}) {
  const d = useDeckDraft<CategoryForm>({ scope: 'category', entityId: projectId, empty: editing ? { name: editing.name, skills: editing.skills } : { name: '', skills: [] }, draft: editing ? null : draft, last: LAST, onDraftChange, persist: !editing });
  const { form, set } = d;
  const [errs, setErrs] = useState<{ name?: boolean; skills?: boolean }>({});
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const TAG = editing ? 'SKILLS · EDITAR CATEGORIA' : 'SKILLS · NOVA CATEGORIA';

  const validate = (to: number) => {
    if (to > 0 && !form.name.trim()) return { at: 0, flags: { name: true } };
    if (to > 1 && !form.skills.length) return { at: 1, flags: { skills: true } };
    return null;
  };
  const call = async (method: 'POST' | 'PATCH' | 'DELETE') => {
    setBusy(true); setServerError(null);
    try {
      const url = editing ? `/api/projects/${projectId}/categories/${editing.id}` : `/api/projects/${projectId}/categories`;
      const r = await fetch(url, { method, headers: { 'content-type': 'application/json' }, ...(method === 'DELETE' ? {} : { body: JSON.stringify({ name: form.name.trim(), skills: form.skills }) }) });
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
    if (to > LAST) { void call(editing ? 'PATCH' : 'POST'); return; }
    d.goTo(to);
  };
  const addSkill = () => { const v = typed.trim(); if (!v) return; if (!form.skills.some((s) => s.toLowerCase() === v.toLowerCase())) set({ skills: [...form.skills, v] }); setTyped(''); setErrs((x) => ({ ...x, skills: false })); };

  const cards: DeckCard[] = [
    { id: 'nome', bg: '#F5A9D6', node: (<>
      <Title>Como a categoria se chama?</Title><Help>Ela agrupa as skills no deck de Skills de cada pessoa.</Help>
      <input type="text" aria-label="Nome da categoria" placeholder="Ex.: Pesquisa e descoberta" value={form.name} onChange={(e) => { set({ name: e.target.value }); setErrs((x) => ({ ...x, name: false })); }} style={cardInput} />
      <Err show={errs.name}>Escreva o nome da categoria para seguir.</Err>
      <span style={label()}>SUGESTÕES</span>
      <div role="group" aria-label="Sugestões de categoria" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{CATEGORY_SUGGESTIONS.map((s) => <button key={s} type="button" aria-pressed={form.name === s} className="tw-chip" onClick={() => { set({ name: s }); setErrs((x) => ({ ...x, name: false })); }} style={chipStyle(form.name === s)}>{s}</button>)}</div>
    </>) },
    { id: 'skills', bg: '#F3D36B', node: (<>
      <Title>Quais skills entram nela?</Title><Help>Escreva e toque em Adicionar. Toque numa skill para tirar.</Help>
      <AddRow value={typed} onChange={setTyped} onAdd={addSkill} placeholder="Ex.: Entrevistas" aria="Nova skill" />
      <ChipList items={form.skills} onRemove={(i) => set({ skills: form.skills.filter((_, j) => j !== i) })} />
      {loose.filter((s) => !form.skills.includes(s)).length > 0 && <>
        <span style={label()}>SKILLS DO PROJETO SEM CATEGORIA</span>
        <div role="group" aria-label="Skills sem categoria" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{loose.filter((s) => !form.skills.includes(s)).map((s) => <button key={s} type="button" className="tw-chip" onClick={() => { set({ skills: [...form.skills, s] }); setErrs((x) => ({ ...x, skills: false })); }} style={chipStyle(false)}>+ {s}</button>)}</div></>}
      <Err show={errs.skills}>Adicione pelo menos uma skill para seguir.</Err>
    </>) },
    { id: 'resumo', bg: '#B7A6FF', summary: true, node: (<>
      <Title>Confere a categoria?</Title><Help>{editing ? 'As skills tiradas ficam sem categoria, mas continuam no projeto.' : 'As skills aparecem no deck de Skills de cada pessoa do projeto.'}</Help>
      <SummaryRow k={`CATEGORIA · ${form.skills.length} ${form.skills.length === 1 ? 'SKILL' : 'SKILLS'}`} v={`${form.name || 'Nome da categoria'}: ${form.skills.join(', ') || '—'}`} />
      {editing && <button type="button" disabled={busy} onClick={() => { if (window.confirm(`Remover a categoria "${editing.name}"? As skills continuam no projeto, sem categoria.`)) void call('DELETE'); }} style={{ alignSelf: 'flex-start', fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#0E0E12', background: 'transparent', border: '1.5px solid #0E0E12', borderRadius: 12, minHeight: 44, padding: '0 16px', cursor: 'pointer' }}>Remover esta categoria</button>}
    </>) },
  ];
  return (
    <BottomSheet tag={TAG} title={editing ? 'Editar categoria' : 'Nova categoria'} onClose={onClose}>
      <QuestionDeck tag={TAG} cards={cards} step={d.step} onGo={go} busy={busy} busyLabel="Salvando…" error={serverError} nextLabel={d.step === LAST ? (editing ? 'Salvar categoria' : 'Criar categoria') : 'Próxima'} />
    </BottomSheet>
  );
}
