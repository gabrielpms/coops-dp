'use client';
import { useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { QuestionDeck, type DeckCard } from '../wizard/QuestionDeck';
import { useDeckDraft, type Draft } from '../wizard/useDeckDraft';
import { Err, Help, Title } from '../wizard/parts';
import { cardInput, chipStyle, label } from '../ds/tokens';

export type PowerUpForm = { type: '' | 'MENTORIA' | 'CURSO' | 'PROJETO'; name: string; skill: string; frequency: string; progress: number };
export type PowerUpDraft = Draft<PowerUpForm>;
const empty: PowerUpForm = { type: '', name: '', skill: '', frequency: '', progress: 0 };
const LAST = 4;
const TAG = 'POWER UPS · NOVO';
const TYPES = [
  { id: 'MENTORIA', label: 'Mentoria', hint: 'Conversas regulares com um profissional que te ajuda a evoluir.', bg: '#8FE3C8' },
  { id: 'CURSO', label: 'Curso', hint: 'Um curso sobre algum assunto, com módulos e progresso.', bg: '#F3D36B' },
  { id: 'PROJETO', label: 'Projeto paralelo', hint: 'Algo que você constrói fora do dia a dia para praticar.', bg: '#F5A9D6' },
] as const;
const FREQS = ['Semanal', 'Quinzenal', 'Mensal'];
const Q = { MENTORIA: ['Com quem é a mentoria?', 'Nome da pessoa que te acompanha.'], CURSO: ['Qual é o curso?', 'Nome do curso e onde você faz.'], PROJETO: ['Qual é o projeto?', 'Dê um nome para ele.'] } as const;

export function PowerUpDeck({ personId, personName, skills, draft, onDraftChange, onClose, onSaved }: {
  personId: string; personName: string; skills: string[]; draft: PowerUpDraft | null; onDraftChange: (d: PowerUpDraft | null) => void; onClose: () => void; onSaved: () => void;
}) {
  const d = useDeckDraft<PowerUpForm>({ scope: 'powerup', entityId: personId, empty, draft, last: LAST, onDraftChange });
  const { form, set } = d;
  const [errs, setErrs] = useState<{ type?: boolean; name?: boolean }>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const t = form.type;

  const validate = (to: number) => {
    if (to > 0 && !t) return { at: 0, flags: { type: true } };
    if (to > 1 && !form.name.trim()) return { at: 1, flags: { name: true } };
    return null;
  };
  const submit = async () => {
    setBusy(true); setServerError(null);
    try {
      const r = await fetch(`/api/people/${personId}/powerups`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: t, name: form.name.trim(), skill: form.skill, frequency: form.frequency, progress: form.progress }) });
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
  const tl = TYPES.find((x) => x.id === t)?.label ?? '';

  const cards: DeckCard[] = [
    { id: 'tipo', bg: '#B7A6FF', node: (<>
      <Title>Que tipo de power up?</Title><Help>Power up é uma ação que acelera o seu desenvolvimento: uma mentoria, um curso ou um projeto paralelo.</Help>
      <div role="radiogroup" aria-label="Tipo de power up" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TYPES.map((x) => <button key={x.id} type="button" role="radio" aria-checked={t === x.id} onClick={() => { set({ type: x.id }); setErrs({}); }} style={{ fontFamily: 'inherit', textAlign: 'left', minHeight: 64, borderRadius: 14, border: '2px solid #0E0E12', background: x.bg, boxShadow: t === x.id ? '0 0 0 3px #F5F2EC, 0 0 0 5px #0E0E12' : 'none', padding: '10px 14px', cursor: 'pointer', color: '#0E0E12' }}><span style={{ display: 'block', fontSize: 17, fontWeight: 700 }}>{x.label}</span><span style={{ fontSize: 13 }}>{x.hint}</span></button>)}
      </div>
      <Err show={errs.type}>Escolha um tipo para seguir.</Err>
    </>) },
    { id: 'nome', bg: '#F5F2EC', node: (<>
      <Title>{t ? Q[t][0] : 'Qual é o nome?'}</Title><Help>{t ? Q[t][1] : 'Escolha o tipo antes.'}</Help>
      <input type="text" aria-label="Nome do power up" value={form.name} onChange={(e) => { set({ name: e.target.value }); setErrs({}); }} style={cardInput} />
      <Err show={errs.name}>Preencha para seguir.</Err>
    </>) },
    { id: 'skill', bg: '#F3D36B', optional: true, node: (<>
      <Title>Que skill ele acelera?</Title><Help>Ajuda o manager a ligar o power up ao PDI.</Help>
      <input type="text" aria-label="Skill acelerada" placeholder="Ex.: Pesquisa" value={form.skill} onChange={(e) => set({ skill: e.target.value })} style={cardInput} />
      {skills.length > 0 && <div role="group" aria-label="Skills do projeto" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{skills.map((s) => <button key={s} type="button" aria-pressed={form.skill === s} className="tw-chip" onClick={() => set({ skill: s })} style={chipStyle(form.skill === s)}>{s}</button>)}</div>}
    </>) },
    { id: 'ritmo', bg: '#F5A9D6', optional: true, node: t === 'MENTORIA' ? (<>
      <Title>Com que frequência?</Title><Help>O ritmo combinado entre vocês.</Help>
      <div role="radiogroup" aria-label="Frequência" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{FREQS.map((f) => <button key={f} type="button" role="radio" aria-checked={form.frequency === f} className="tw-chip" onClick={() => set({ frequency: f })} style={chipStyle(form.frequency === f)}>{f}</button>)}</div>
    </>) : (<>
      <Title>Quanto você já fez?</Title><Help>Dá para atualizar depois.</Help>
      <span style={{ ...label(11), }}>{form.progress}% CONCLUÍDO</span>
      <div role="radiogroup" aria-label="Progresso" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{[0, 10, 25, 50, 75, 100].map((n) => <button key={n} type="button" role="radio" aria-checked={form.progress === n} className="tw-chip" onClick={() => set({ progress: n })} style={chipStyle(form.progress === n)}>{n === 0 ? 'Ainda não comecei' : `${n}%`}</button>)}</div>
    </>) },
    { id: 'resumo', bg: '#B7A6FF', summary: true, node: (<>
      <Title>Confere o power up?</Title><Help>É assim que ele vai aparecer na lista. Aparece no perfil de {personName} e no 1:1 com o manager.</Help>
      <div aria-hidden="true" style={{ alignSelf: 'flex-start', width: 260, borderRadius: 18, background: '#8FE3C8', border: '2px solid #0E0E12', padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={label(10)}>{tl.toUpperCase() || 'POWER UP'}</span><span style={{ fontSize: 20, fontWeight: 700 }}>{form.name || 'Nome do power up'}</span>
        <span style={{ fontSize: 13 }}>{t === 'MENTORIA' ? form.frequency || 'Sem frequência' : `${form.progress}% concluído`}</span>
        {form.skill && <span style={{ fontSize: 12, fontWeight: 600, background: '#F3D36B', border: '1.5px solid #0E0E12', borderRadius: 999, padding: '3px 9px', alignSelf: 'flex-start' }}>Skill: {form.skill}</span>}
      </div>
    </>) },
  ];
  return (
    <BottomSheet tag={TAG} title="Cadastrar power up" onClose={onClose}>
      <QuestionDeck tag={TAG} cards={cards} step={d.step} onGo={go} busy={busy} busyLabel="Salvando…" error={serverError} nextLabel={d.step === LAST ? 'Criar power up' : 'Próxima'} />
    </BottomSheet>
  );
}
