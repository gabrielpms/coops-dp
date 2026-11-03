'use client';
import { useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { QuestionDeck, type DeckCard } from '../wizard/QuestionDeck';
import { useDeckDraft, type Draft } from '../wizard/useDeckDraft';
import { Err, Help, SummaryRow, Title } from '../wizard/parts';
import { Avatar } from '../avatar/Avatar';
import { DEFAULT_AVATAR_CFG } from '../avatar/AvatarEditor';
import { cardInput, chipStyle, darkBtn, label } from '../ds/tokens';
import { EVIDENCE_TYPES } from '@/lib/validation';
import { DECK_META, type Action, type Evidence, type SquadCardView, type SquadDeckId, type SquadPerson } from './types';

export type CardForm = Record<string, any>;
export type CardDraft = Draft<CardForm>;
const defaults = (deck: SquadDeckId): CardForm => ({
  DESAFIO: { title: '', cenario: '', complexidade: 3, evidencias: [], abordagem: '', acoes: [] },
  FRENTE: { title: '', oque: '', impacto: '', nivel: 1, evidencias: [], acoes: [], championPersonId: null },
  ESTRATEGIA: { title: '', texto: '' },
  INDICADOR: { title: '', valor: '', variacao: 'estavel', challengeId: null },
  ALAVANCA: { title: '', descricao: '' },
}[deck]);
export const formOf = (c: SquadCardView): CardForm => ({ title: c.title, ...c.data, ...(c.deck === 'DESAFIO' ? { complexidade: c.level ?? 3 } : {}), ...(c.deck === 'FRENTE' ? { nivel: c.level ?? 1, championPersonId: c.championPersonId } : {}) });
const LASTS: Record<SquadDeckId, number> = { DESAFIO: 5, FRENTE: 7, ESTRATEGIA: 2, INDICADOR: 3, ALAVANCA: 2 };

// ---- peças com estado próprio (definidas fora do deck para não perder o foco)
function Bars({ value, onPick, aria, lo, hi }: { value: number; onPick: (n: number) => void; aria: string; lo: string; hi: string }) {
  return (<>
    <div role="radiogroup" aria-label={aria} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`Nível ${n} de 5`} onClick={() => onPick(n)} style={{ height: 52, borderRadius: 10, border: '2px solid #0E0E12', background: n <= value ? '#0E0E12' : 'transparent', cursor: 'pointer', padding: 0 }} />)}</div>
    <span style={{ display: 'flex', justifyContent: 'space-between', ...label(10, '0') }}><span>{lo}</span><span>{hi}</span></span>
  </>);
}
function EvidenceEditor({ items, onChange }: { items: Evidence[]; onChange: (v: Evidence[]) => void }) {
  const [tipo, setTipo] = useState<string>(EVIDENCE_TYPES[0]); const [texto, setTexto] = useState('');
  const add = () => { const t = texto.trim(); if (!t) return; onChange([...items, { tipo, texto: t }]); setTexto(''); };
  return (<>
    <div role="group" aria-label="Tipo de evidência" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{EVIDENCE_TYPES.map((t) => <button key={t} type="button" aria-pressed={tipo === t} className="tw-chip" onClick={() => setTipo(t)} style={chipStyle(tipo === t)}>{t}</button>)}</div>
    <form onSubmit={(e) => { e.preventDefault(); add(); }} style={{ display: 'flex', gap: 8 }}><input type="text" aria-label="Evidência" value={texto} onChange={(e) => setTexto(e.target.value)} style={{ ...cardInput, flex: '1 1 auto' }} /><button type="submit" style={darkBtn}>+ Adicionar</button></form>
    {items.map((e, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, border: '1.5px solid #0E0E12', background: '#F5F2EC', padding: '6px 6px 6px 12px' }}><span style={{ ...label(10), border: '1.5px solid #0E0E12', borderRadius: 999, padding: '2px 8px' }}>{e.tipo.toUpperCase()}</span><span style={{ flex: 1, fontSize: 14 }}>{e.texto}</span><button type="button" aria-label={`Remover evidência ${e.texto}`} onClick={() => onChange(items.filter((_, j) => j !== i))} style={{ width: 44, height: 44, border: 0, background: 'transparent', cursor: 'pointer' }}>✕</button></div>)}
  </>);
}
function ActionEditor({ items, onChange, people }: { items: Action[]; onChange: (v: Action[]) => void; people: SquadPerson[] }) {
  const [texto, setTexto] = useState(''); const [dono, setDono] = useState(''); const [prazo, setPrazo] = useState('');
  const add = () => { const t = texto.trim(); if (!t) return; onChange([...items, { texto: t, dono, prazo: prazo.trim(), done: false }]); setTexto(''); setPrazo(''); };
  return (<>
    {items.map((a, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, border: '1.5px solid #0E0E12', background: '#F5F2EC', padding: '6px 6px 6px 12px' }}><span style={{ ...label(11), fontWeight: 700 }}>{i + 1}</span><span style={{ flex: 1, fontSize: 14 }}>{a.texto}<br /><span style={{ fontSize: 12 }}>{[a.dono, a.prazo].filter(Boolean).join(' · ') || 'Sem dono'}</span></span><button type="button" aria-label={`Remover ação ${a.texto}`} onClick={() => onChange(items.filter((_, j) => j !== i))} style={{ width: 44, height: 44, border: 0, background: 'transparent', cursor: 'pointer' }}>✕</button></div>)}
    <input type="text" aria-label="Nova ação" placeholder="Ação" value={texto} onChange={(e) => setTexto(e.target.value)} style={cardInput} />
    <div role="group" aria-label="Dono da ação" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{people.map((p) => { const n = p.name.split(' ')[0]; return <button key={p.id} type="button" aria-pressed={dono === n} className="tw-chip" onClick={() => setDono(dono === n ? '' : n)} style={chipStyle(dono === n)}>{n}</button>; })}</div>
    <form onSubmit={(e) => { e.preventDefault(); add(); }} style={{ display: 'flex', gap: 8 }}><input type="text" aria-label="Prazo" placeholder="Prazo (ex.: nov)" value={prazo} onChange={(e) => setPrazo(e.target.value)} style={{ ...cardInput, flex: '1 1 auto' }} /><button type="submit" style={darkBtn}>+ Ação</button></form>
  </>);
}

export function SquadCardDeck({ squadId, deck, editing, people, challenges, draft, onDraftChange, onClose, onSaved }: {
  squadId: string; deck: SquadDeckId; editing: SquadCardView | null; people: SquadPerson[]; challenges: { id: string; title: string }[]; draft: CardDraft | null; onDraftChange: (d: CardDraft | null) => void; onClose: () => void; onSaved: () => void;
}) {
  const meta = DECK_META[deck]; const LAST = LASTS[deck];
  const d = useDeckDraft<CardForm>({ scope: `squad:${deck}`, entityId: squadId, empty: editing ? formOf(editing) : defaults(deck), draft: editing ? null : draft, last: LAST, onDraftChange, persist: !editing });
  const { form, set } = d;
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const TAG = `${meta.title.toUpperCase()} · ${editing ? 'EDITAR' : 'NOVO'}`;

  const submit = async () => {
    setBusy(true); setServerError(null);
    try {
      const r = await fetch(editing ? `/api/squads/${squadId}/cards/${editing.id}` : `/api/squads/${squadId}/cards`, { method: editing ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ deck, ...form, title: String(form.title).trim() }) });
      const data = await r.json();
      if (!r.ok) { setServerError(data.error ?? 'Não deu para salvar. Tente de novo.'); return; }
      d.done(); onSaved();
    } catch { setServerError('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };
  const go = (k: number) => {
    const to = Math.max(0, k);
    if (to > 0 && !String(form.title).trim()) { setErr(true); d.goTo(0); return; }
    setErr(false);
    if (to > LAST) { void submit(); return; }
    d.goTo(to);
  };
  const nameCard = (q: string, help: string, ph: string, errMsg: string, bg: string): DeckCard => ({ id: 'nome', bg, node: (<><Title>{q}</Title><Help>{help}</Help><input type="text" aria-label="Nome" placeholder={ph} value={form.title} onChange={(e) => { set({ title: e.target.value }); setErr(false); }} style={cardInput} /><Err show={err}>{errMsg}</Err></>) });
  const area = (id: string, bg: string, q: string, help: string, key: string, aria: string, opt = true): DeckCard => ({ id, bg, optional: opt, node: (<><Title>{q}</Title><Help>{help}</Help><textarea aria-label={aria} value={form[key]} onChange={(e) => set({ [key]: e.target.value })} style={{ ...cardInput, minHeight: 170, resize: 'vertical' }} /></>) });
  const summary = (rows: [string, string][]): DeckCard => ({ id: 'resumo', bg: '#B7A6FF', summary: true, node: (<><Title>Confere {deck === 'ALAVANCA' || deck === 'FRENTE' ? 'a' : deck === 'ESTRATEGIA' ? 'o item' : 'o'} {deck === 'ESTRATEGIA' ? '' : meta.one}?</Title><Help>O time inteiro vê o resultado.</Help><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{rows.map(([k, v]) => <SummaryRow key={k} k={k} v={v} />)}</div></>) });
  const ev = (): DeckCard => ({ id: 'ev', bg: '#F3D36B', optional: true, node: (<><Title>Que evidências temos?</Title><Help>{deck === 'DESAFIO' ? 'Um dado, uma pesquisa, uma fala de usuário ou um link.' : 'Dados, pesquisas ou feedbacks que mostram o andamento.'}</Help><EvidenceEditor items={form.evidencias} onChange={(v) => set({ evidencias: v })} /></>) });

  let cards: DeckCard[] = [];
  if (deck === 'DESAFIO') cards = [
    nameCard('Qual o desafio?', 'Uma frase curta, do jeito que o time falaria.', 'Ex.: Pessoas desistem no envio do documento', 'Dê um nome ao desafio para salvar.', '#FF8A5B'),
    area('cen', '#F5F2EC', 'Qual o cenário atual?', 'O que está acontecendo hoje.', 'cenario', 'Cenário atual'),
    { id: 'cx', bg: '#F5A9D6', node: (<><Title>Quão complexo é?</Title><Help>Toque numa barra para definir.</Help><Bars value={form.complexidade} onPick={(n) => set({ complexidade: n })} aria="Complexidade" lo="MUITO BAIXA" hi="MUITO ALTA" /></>) },
    ev(),
    { id: 'ab', bg: '#8FE3C8', optional: true, node: (<><Title>Como vamos atacar?</Title><Help>A abordagem e as primeiras ações.</Help><textarea aria-label="Abordagem" value={form.abordagem} onChange={(e) => set({ abordagem: e.target.value })} style={{ ...cardInput, minHeight: 80, resize: 'vertical' }} /><span style={label()}>PRIMEIRAS AÇÕES</span><ActionEditor items={form.acoes} onChange={(v) => set({ acoes: v })} people={people} /></>) },
    summary([['DESAFIO', form.title || '—'], ['COMPLEXIDADE', `${form.complexidade} de 5`], ['EVIDÊNCIAS', `${form.evidencias.length}`], ['AÇÕES', `${form.acoes.length}`]]),
  ];
  if (deck === 'FRENTE') cards = [
    nameCard('Qual a frente de trabalho?', 'Um nome curto, do jeito que o squad chama.', 'Ex.: Saúde do design system', 'Dê um nome à frente para seguir.', '#F5A9D6'),
    area('oq', '#F5F2EC', 'O que ela faz?', 'Explique em poucas linhas.', 'oque', 'O que a frente faz'),
    area('im', '#F3D36B', 'Qual impacto desejado?', 'Se der, amarre a um indicador do squad.', 'impacto', 'Impacto desejado'),
    { id: 'nv', bg: '#8FE3C8', node: (<><Title>Em que nível está?</Title><Help>Toque numa barra para definir.</Help><Bars value={form.nivel} onPick={(n) => set({ nivel: n })} aria="Nível de progresso" lo="COMEÇANDO" hi="CONCLUÍDA" /></>) },
    ev(),
    { id: 'ac', bg: '#A9D8F5', optional: true, node: (<><Title>Quais as ações?</Title><ActionEditor items={form.acoes} onChange={(v) => set({ acoes: v })} people={people} /></>) },
    { id: 'ch', bg: '#B7A6FF', optional: true, node: (<><Title>Quem é o champion da frente?</Title><Help>A pessoa escolhida ganha a coroa na carta.</Help>
      <div role="radiogroup" aria-label="Champion" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button type="button" role="radio" aria-checked={!form.championPersonId} onClick={() => set({ championPersonId: null })} className="tw-chip" style={{ ...chipStyle(!form.championPersonId), minHeight: 48 }}>Sem champion por agora</button>
        {people.map((p) => <button key={p.id} type="button" role="radio" aria-checked={form.championPersonId === p.id} onClick={() => set({ championPersonId: p.id })} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 52, borderRadius: 14, border: '1.5px solid #0E0E12', background: form.championPersonId === p.id ? '#F5F2EC' : 'rgba(245,242,236,0.45)', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit', color: '#0E0E12', textAlign: 'left', boxShadow: form.championPersonId === p.id ? '0 0 0 2px #0E0E12' : 'none' }}><span style={{ lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12' }}><Avatar {...DEFAULT_AVATAR_CFG} {...(p.avatar ?? {})} crown={form.championPersonId === p.id} size={36} label="" /></span><b style={{ fontSize: 15 }}>{p.name}</b></button>)}
      </div></>) },
    summary([['FRENTE', form.title || '—'], ['NÍVEL', `${form.nivel} de 5`], ['CHAMPION', people.find((p) => p.id === form.championPersonId)?.name ?? 'Sem champion'], ['AÇÕES', `${form.acoes.length}`]]),
  ];
  if (deck === 'ESTRATEGIA') cards = [
    nameCard('Qual é o item de estratégia?', 'Um título curto.', 'Ex.: Reduzir o abandono no cadastro', 'Dê um título ao item de estratégia.', '#B7A6FF'),
    area('tx', '#F5F2EC', 'Explique o item', 'O que ele significa para o squad.', 'texto', 'Texto da estratégia'),
    summary([['ITEM', form.title || '—'], ['TEXTO', form.texto || 'Sem texto']]),
  ];
  if (deck === 'INDICADOR') cards = [
    nameCard('Qual o indicador?', 'O nome do número que o squad acompanha.', 'Ex.: Ativação em 7 dias', 'Dê um nome ao indicador.', '#F3D36B'),
    { id: 'vl', bg: '#F5F2EC', optional: true, node: (<><Title>Qual o valor atual?</Title><Help>Escreva como aparece no dashboard.</Help><input type="text" aria-label="Valor" placeholder="Ex.: 42%" value={form.valor} onChange={(e) => set({ valor: e.target.value })} style={cardInput} /><span style={label()}>VARIAÇÃO</span><div role="radiogroup" aria-label="Variação" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{([['sobe', '▲ Sobe'], ['estavel', '● Estável'], ['desce', '▼ Desce']] as const).map(([v, t]) => <button key={v} type="button" role="radio" aria-checked={form.variacao === v} className="tw-chip" onClick={() => set({ variacao: v })} style={chipStyle(form.variacao === v)}>{t}</button>)}</div></>) },
    { id: 'lg', bg: '#FF8A5B', optional: true, node: (<><Title>Ligado a qual desafio?</Title><Help>Opcional. Mostra qual desafio esse número ajuda a medir.</Help><div role="radiogroup" aria-label="Desafio" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}><button type="button" role="radio" aria-checked={!form.challengeId} className="tw-chip" onClick={() => set({ challengeId: null })} style={chipStyle(!form.challengeId)}>Nenhum</button>{challenges.map((c) => <button key={c.id} type="button" role="radio" aria-checked={form.challengeId === c.id} className="tw-chip" onClick={() => set({ challengeId: c.id })} style={chipStyle(form.challengeId === c.id)}>{c.title}</button>)}</div></>) },
    summary([['INDICADOR', form.title || '—'], ['VALOR', `${form.valor || '—'} · ${form.variacao}`], ['DESAFIO', challenges.find((c) => c.id === form.challengeId)?.title ?? 'Nenhum']]),
  ];
  if (deck === 'ALAVANCA') cards = [
    nameCard('Qual é a alavanca?', 'O que o squad pode mexer para mudar o resultado.', 'Ex.: Reduzir campos do formulário', 'Dê um nome à alavanca.', '#C9F0B8'),
    area('ds', '#F5F2EC', 'Como ela funciona?', 'Por que ela deve mexer no resultado.', 'descricao', 'Descrição da alavanca'),
    summary([['ALAVANCA', form.title || '—'], ['DESCRIÇÃO', form.descricao || 'Sem descrição']]),
  ];
  return (
    <BottomSheet tag={TAG} title={editing ? `Editar ${meta.one}` : `Novo ${meta.one}`} onClose={onClose}>
      <QuestionDeck tag={TAG} cards={cards} step={d.step} onGo={go} busy={busy} busyLabel="Salvando…" error={serverError} nextLabel={d.step === LAST ? (editing ? 'Salvar alterações' : 'Criar') : 'Próxima'} />
    </BottomSheet>
  );
}
