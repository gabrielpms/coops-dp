'use client';
import { useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { QuestionDeck, type DeckCard } from '../wizard/QuestionDeck';
import { useDeckDraft, type Draft } from '../wizard/useDeckDraft';
import { Err, Help, SummaryRow, Title } from '../wizard/parts';
import { cardInput, darkBtn, label } from '../ds/tokens';
import { EVENT_TYPE_LABEL } from '@/lib/validation';
import { MONTHS_LONG } from '@/lib/format';

export type EventKind = 'CHECKIN' | 'FEEDBACK' | 'PROMOCAO' | 'MERITO' | 'MUDANCA_TIME';
export type EventForm = { title: string; body: string; pedidos: string[]; radar: string[]; combinados: string[]; proximo: string[]; autor: string; anexos: string[]; de: string; para: string; msg: string };
export type EventDraft = Draft<EventForm>;
const empty: EventForm = { title: '', body: '', pedidos: [], radar: [], combinados: [], proximo: [], autor: '', anexos: [], de: '', para: '', msg: '' };
const LASTS: Record<EventKind, number> = { CHECKIN: 6, FEEDBACK: 4, PROMOCAO: 4, MERITO: 3, MUDANCA_TIME: 4 };
const todayIso = () => new Date().toISOString().slice(0, 10);
const longDate = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${d} de ${MONTHS_LONG[m - 1]} de ${y}`; };

function ListEditor({ items, onChange, aria, ph }: { items: string[]; onChange: (v: string[]) => void; aria: string; ph: string }) {
  const [v, setV] = useState('');
  const add = () => { const t = v.trim(); if (t) { onChange([...items, t]); setV(''); } };
  return (<>
    {items.map((it, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, border: '1.5px solid #0E0E12', background: '#F5F2EC', padding: '6px 6px 6px 12px' }}><span style={{ ...label(11), fontWeight: 700 }}>{i + 1}</span><span style={{ flex: 1, fontSize: 14 }}>{it}</span><button type="button" aria-label={`Remover ${it}`} onClick={() => onChange(items.filter((_, j) => j !== i))} style={{ width: 44, height: 44, border: 0, background: 'transparent', cursor: 'pointer' }}>✕</button></div>)}
    <form onSubmit={(e) => { e.preventDefault(); add(); }} style={{ display: 'flex', gap: 8 }}><input type="text" aria-label={aria} placeholder={ph} value={v} onChange={(e) => setV(e.target.value)} style={{ ...cardInput, flex: '1 1 auto' }} /><button type="submit" style={darkBtn}>+ Adicionar</button></form>
  </>);
}

export function EventDeck({ personId, personName, kind, draft, onDraftChange, onChangeType, onClose, onSaved }: {
  personId: string; personName: string; kind: EventKind; draft: EventDraft | null; onDraftChange: (d: EventDraft | null) => void; onChangeType: () => void; onClose: () => void; onSaved: () => void;
}) {
  const LAST = LASTS[kind];
  const d = useDeckDraft<EventForm>({ scope: `event:${kind}`, entityId: personId, empty, draft, last: LAST, onDraftChange });
  const { form, set } = d;
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const date = todayIso();
  const lbl = EVENT_TYPE_LABEL[kind];
  const TAG = `DECK DE EVENTOS · NOVO EVENTO · ${lbl.toUpperCase()}`;

  const submit = async () => {
    setBusy(true); setServerError(null);
    const base = { type: kind, title: form.title.trim(), date, body: form.body.trim() };
    const extra = kind === 'CHECKIN' ? { pedidos: form.pedidos, radar: form.radar, combinados: form.combinados, proximo: form.proximo } : kind === 'FEEDBACK' ? { autor: form.autor.trim(), anexos: form.anexos } : kind === 'MERITO' ? { msg: form.msg } : { de: form.de.trim(), para: form.para.trim(), msg: form.msg };
    try {
      const r = await fetch(`/api/people/${personId}/events`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...base, ...extra }) });
      const data = await r.json();
      if (!r.ok) { setServerError(data.error ?? 'Não deu para salvar. Tente de novo.'); return; }
      d.done(); onSaved();
    } catch { setServerError('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };
  const go = (k: number) => {
    const to = Math.max(0, k);
    if (to > 0 && !form.title.trim()) { setErr(true); d.goTo(0); return; }
    setErr(false);
    if (to > LAST) { void submit(); return; }
    d.goTo(to);
  };
  const T = { check: 'Qual o tema central da conversa?', fb: 'Qual o título do feedback?', other: kind === 'PROMOCAO' ? 'Qual a promoção?' : kind === 'MERITO' ? 'Qual o mérito?' : 'Qual a mudança?' };
  const first: DeckCard = { id: 'titulo', bg: '#B7A6FF', node: (<>
    <Title>{kind === 'CHECKIN' ? T.check : kind === 'FEEDBACK' ? T.fb : T.other}</Title><Help>Vira o título da carta no deck.{kind === 'FEEDBACK' ? ' Pode ser uma frase marcante do feedback.' : ''}</Help>
    <span style={label(11)}>{longDate(date)} · registrado automaticamente</span>
    <input type="text" aria-label="Título do evento" value={form.title} onChange={(e) => { set({ title: e.target.value }); setErr(false); }} style={cardInput} />
    <Err show={err}>Dê um título ao evento para seguir.</Err>
  </>) };
  const text = (id: string, bg: string, q: string, help: string, key: 'body' | 'msg', aria: string, optional = true): DeckCard => ({ id, bg, optional, node: (<><Title>{q}</Title><Help>{help}</Help><textarea aria-label={aria} value={form[key]} onChange={(e) => set({ [key]: e.target.value })} style={{ ...cardInput, minHeight: 170, resize: 'vertical' }} /></>) });
  const list = (id: string, bg: string, q: string, help: string, key: 'pedidos' | 'radar' | 'combinados' | 'proximo', aria: string): DeckCard => ({ id, bg, optional: true, node: (<><Title>{q}</Title><Help>{help}</Help><ListEditor items={form[key]} onChange={(v) => set({ [key]: v })} aria={aria} ph="Escreva e adicione" /></>) });
  const dePara = (q: string, help: string, a: string, b: string): DeckCard => ({ id: 'depara', bg: '#F3D36B', optional: true, node: (<><Title>{q}</Title><Help>{help}</Help><label htmlFor="ev-de" style={label()}>DE</label><input id="ev-de" type="text" placeholder={a} value={form.de} onChange={(e) => set({ de: e.target.value })} style={cardInput} /><label htmlFor="ev-para" style={label()}>PARA</label><input id="ev-para" type="text" placeholder={b} value={form.para} onChange={(e) => set({ para: e.target.value })} style={cardInput} /></>) });
  const summary = (rows: [string, string][]): DeckCard => ({ id: 'resumo', bg: '#B7A6FF', summary: true, node: (<><Title>Confere {kind === 'CHECKIN' ? 'o check-in' : kind === 'FEEDBACK' ? 'o feedback' : 'o evento'}?</Title><Help>Ele entra no deck de Eventos de {personName} como uma carta de {lbl.toLowerCase()}.</Help><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{rows.map(([k, v]) => <SummaryRow key={k} k={k} v={v} />)}</div></>) });

  let cards: DeckCard[] = [];
  if (kind === 'CHECKIN') cards = [first, text('conv', '#F5F2EC', 'Como foi a conversa?', 'Um resumo curto para lembrar do contexto depois.', 'body', 'Resumo da conversa'),
    list('ped', '#F3D36B', `O que ${personName} pediu para você?`, 'Solicitações da pessoa para o líder. Cada uma vira um item para acompanhar.', 'pedidos', 'Pedido'),
    list('rad', '#A9D8F5', 'O que fica no radar?', 'Sinais e temas para observar, sem ação ainda.', 'radar', 'Item de radar'),
    list('comb', '#8FE3C8', 'O que vocês combinaram?', 'Combinados gerais, que valem a partir de agora.', 'combinados', 'Combinado'),
    list('prox', '#F5A9D6', 'E para o próximo encontro?', 'O que cada um traz para o próximo check-in.', 'proximo', 'Item do próximo encontro'),
    summary([['TEMA', form.title || '—'], ['PEDIDOS', `${form.pedidos.length}`], ['RADAR', `${form.radar.length}`], ['COMBINADOS', `${form.combinados.length}`], ['PRÓXIMO ENCONTRO', `${form.proximo.length}`]])];
  if (kind === 'FEEDBACK') cards = [first, text('o-que', '#F5F2EC', 'O que foi dito?', 'Descreva o feedback com o contexto em que ele aconteceu.', 'body', 'O que foi dito', false),
    { id: 'autor', bg: '#F3D36B', optional: true, node: (<><Title>Quem deu o feedback?</Title><Help>Nome do autor, ou do grupo que deu o feedback.</Help><input type="text" aria-label="Autor do feedback" value={form.autor} onChange={(e) => set({ autor: e.target.value })} style={cardInput} /></>) },
    { id: 'anx', bg: '#F5A9D6', optional: true, node: (<><Title>Quer anexar algo?</Title><Help>Links para prints, e-mails, a gravação ou um documento que dão contexto.</Help><ListEditor items={form.anexos} onChange={(v) => set({ anexos: v })} aria="Link do anexo" ph="https://" /></>) },
    summary([['FEEDBACK', form.title || '—'], ['AUTOR', form.autor || 'Sem autor'], ['ANEXOS', `${form.anexos.length}`]])];
  if (kind === 'PROMOCAO') cards = [first, text('o-que', '#F5F2EC', 'O que aconteceu?', 'O contexto em poucas linhas, para lembrar depois.', 'body', 'O que aconteceu'), dePara('De qual cargo para qual?', 'O cargo anterior e o novo.', 'Product Designer', 'Senior Product Designer'),
    text('msg', '#8FE3C8', `Quer deixar uma mensagem para ${personName}?`, 'Ela entra no corpo da carta, assinada por você.', 'msg', 'Mensagem'), summary([['PROMOÇÃO', form.title || '—'], ['CARGO', `${form.de || '—'} → ${form.para || '—'}`], ['MENSAGEM', form.msg || 'Sem mensagem']])];
  if (kind === 'MERITO') cards = [first, text('o-que', '#F5F2EC', 'O que aconteceu?', 'O contexto em poucas linhas, para lembrar depois.', 'body', 'O que aconteceu'),
    text('msg', '#8FE3C8', `Quer deixar uma mensagem para ${personName}?`, 'Ela entra no corpo da carta, assinada por você.', 'msg', 'Mensagem'), summary([['MÉRITO', form.title || '—'], ['MENSAGEM', form.msg || 'Sem mensagem']])];
  if (kind === 'MUDANCA_TIME') cards = [first, text('o-que', '#F5F2EC', 'O que aconteceu?', 'O contexto em poucas linhas, para lembrar depois.', 'body', 'O que aconteceu'), dePara('De qual squad para qual?', 'O squad de saída e o de chegada.', 'Squad Pagamentos', 'Squad Onboarding'),
    text('msg', '#8FE3C8', `Quer deixar uma mensagem para ${personName}?`, 'Ela entra no corpo da carta, assinada por você.', 'msg', 'Mensagem'), summary([['MUDANÇA', form.title || '—'], ['SQUAD', `${form.de || '—'} → ${form.para || '—'}`], ['MENSAGEM', form.msg || 'Sem mensagem']])];

  return (
    <BottomSheet tag={TAG} title={`Novo ${lbl.toLowerCase()}`} onClose={onClose}>
      <button type="button" onClick={onChangeType} style={{ alignSelf: 'flex-start', fontFamily: 'inherit', fontSize: 14, color: '#B7A6FF', background: 'none', border: 0, minHeight: 44, cursor: 'pointer', padding: 0 }}>Trocar o tipo</button>
      <QuestionDeck tag={TAG} cards={cards} step={d.step} onGo={go} busy={busy} busyLabel="Registrando…" error={serverError} nextLabel={d.step === LAST ? 'Registrar evento' : 'Próxima'} />
    </BottomSheet>
  );
}
