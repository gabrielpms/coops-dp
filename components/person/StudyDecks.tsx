'use client';
import { useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { QuestionDeck, type DeckCard } from '../wizard/QuestionDeck';
import { useDeckDraft, type Draft } from '../wizard/useDeckDraft';
import { Err, Help, SummaryRow, Title } from '../wizard/parts';
import { cardInput, chipStyle, label } from '../ds/tokens';

export type StudyType = 'CURSO' | 'LIVRO' | 'VIDEO' | 'ARTIGO' | 'PODCAST' | 'LINK';
export const STUDY_META: Record<StudyType, { label: string; hint: string; q: string; unit: string }> = {
  LIVRO: { label: 'Livro', hint: 'Um livro que você está lendo, capítulo a capítulo.', q: 'Qual é o livro?', unit: 'capítulos' },
  VIDEO: { label: 'Vídeo', hint: 'Palestra, aula gravada ou vídeo de referência.', q: 'Qual é o vídeo?', unit: 'partes' },
  ARTIGO: { label: 'Artigo', hint: 'Um texto ou estudo para ler com calma.', q: 'Qual é o artigo?', unit: 'seções' },
  CURSO: { label: 'Curso', hint: 'Curso ou power up com módulos.', q: 'Qual é o curso?', unit: 'módulos' },
  PODCAST: { label: 'Podcast', hint: 'Episódios para ouvir no seu ritmo.', q: 'Qual é o podcast?', unit: 'episódios' },
  LINK: { label: 'Link', hint: 'Qualquer outro material que você quer guardar.', q: 'Qual é o material?', unit: 'blocos' },
};
export type StudyView = { id: string; type: StudyType; title: string; url: string; skillId: string; skillName: string; progress: number; total: number; notes: string };
export type StudyForm = { title: string; total: number; url: string; skillId: string };
export type StudyDraft = Draft<StudyForm>;
const SIZES = [5, 10, 20];
const LAST = 2;

export function TypePicker({ onPick, onClose }: { onPick: (t: StudyType) => void; onClose: () => void }) {
  return (
    <BottomSheet tag="BRAIN GYM · NOVO CONTEÚDO" title="O que você vai estudar?" onClose={onClose}>
      <p style={{ margin: 0, fontSize: 14, color: '#A3A1AD' }}>Escolha uma carta. Depois vêm as perguntas, uma por carta.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {(Object.keys(STUDY_META) as StudyType[]).map((t) => (
          <button key={t} type="button" onClick={() => onPick(t)} className="coops-card" style={{ fontFamily: 'inherit', textAlign: 'left', minHeight: 150, borderRadius: 18, background: '#F5A9D6', color: '#0E0E12', border: '2px solid #0E0E12', padding: 16, display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer' }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>{STUDY_META[t].label}</span><span style={{ fontSize: 13, lineHeight: 1.4 }}>{STUDY_META[t].hint}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

export function StudyDeck({ personId, type, skills, draft, onDraftChange, onChangeType, onClose, onSaved }: {
  personId: string; type: StudyType; skills: { id: string; name: string }[]; draft: StudyDraft | null; onDraftChange: (d: StudyDraft | null) => void; onChangeType: () => void; onClose: () => void; onSaved: () => void;
}) {
  const m = STUDY_META[type];
  const d = useDeckDraft<StudyForm>({ scope: 'study', entityId: personId, empty: { title: '', total: 10, url: '', skillId: '' }, draft, last: LAST, onDraftChange });
  const { form, set } = d;
  const [errTitle, setErrTitle] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const TAG = `BRAIN GYM · NOVO CONTEÚDO · ${m.label.toUpperCase()}`;

  const submit = async () => {
    setBusy(true); setServerError(null);
    try {
      const r = await fetch(`/api/people/${personId}/study`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type, title: form.title.trim(), total: form.total, url: form.url.trim(), skillId: form.skillId || null }) });
      const data = await r.json();
      if (!r.ok) { setServerError(data.error ?? 'Não deu para salvar. Tente de novo.'); return; }
      d.done(); onSaved();
    } catch { setServerError('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };
  const go = (k: number) => {
    const to = Math.max(0, k);
    if (to > 0 && !form.title.trim()) { setErrTitle(true); d.goTo(0); return; }
    setErrTitle(false);
    if (to > LAST) { void submit(); return; }
    d.goTo(to);
  };
  const cards: DeckCard[] = [
    { id: 'titulo', bg: '#F5A9D6', node: (<>
      <Title>{m.q}</Title><Help>Vira o título da carta no deck.</Help>
      <input type="text" aria-label="Título do conteúdo" value={form.title} onChange={(e) => { set({ title: e.target.value }); setErrTitle(false); }} style={cardInput} />
      <Err show={errTitle}>Dê um título ao conteúdo para seguir.</Err>
      <span style={label()}>TAMANHO · OPCIONAL</span>
      <div role="radiogroup" aria-label="Tamanho" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{SIZES.map((n) => <button key={n} type="button" role="radio" aria-checked={form.total === n} className="tw-chip" onClick={() => set({ total: n })} style={chipStyle(form.total === n)}>{n} blocos</button>)}</div>
    </>) },
    { id: 'extra', bg: '#F3D36B', optional: true, node: (<>
      <Title>Quer completar a carta?</Title><Help>Tudo aqui é opcional. Dá para pular e adicionar depois.</Help>
      <label htmlFor="sw-link" style={label()}>LINK</label>
      <input id="sw-link" type="text" placeholder="https://" value={form.url} onChange={(e) => set({ url: e.target.value })} style={cardInput} />
      <span style={label()}>LIGADO A UMA SKILL</span>
      <div role="radiogroup" aria-label="Skill" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <button type="button" role="radio" aria-checked={!form.skillId} className="tw-chip" onClick={() => set({ skillId: '' })} style={chipStyle(!form.skillId)}>Nenhuma</button>
        {skills.map((s) => <button key={s.id} type="button" role="radio" aria-checked={form.skillId === s.id} className="tw-chip" onClick={() => set({ skillId: s.id })} style={chipStyle(form.skillId === s.id)}>{s.name}</button>)}
      </div>
    </>) },
    { id: 'resumo', bg: '#B7A6FF', summary: true, node: (<>
      <Title>Confere a carta?</Title><Help>Ela entra no seu Brain gym na fila, com 0 de {form.total} blocos.</Help>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><SummaryRow k={m.label.toUpperCase()} v={form.title || '—'} /><SummaryRow k="SKILL" v={skills.find((s) => s.id === form.skillId)?.name ?? 'Nenhuma'} /><SummaryRow k="LINK" v={form.url || 'Sem link'} /></div>
    </>) },
  ];
  return (
    <BottomSheet tag={TAG} title={`Novo ${m.label.toLowerCase()}`} onClose={onClose}>
      <button type="button" onClick={onChangeType} style={{ alignSelf: 'flex-start', fontFamily: 'inherit', fontSize: 14, color: '#B7A6FF', background: 'none', border: 0, minHeight: 44, cursor: 'pointer', padding: 0 }}>Trocar o tipo</button>
      <QuestionDeck tag={TAG} cards={cards} step={d.step} onGo={go} busy={busy} busyLabel="Criando carta…" error={serverError} nextLabel={d.step === LAST ? 'Criar carta' : 'Próxima'} />
    </BottomSheet>
  );
}
