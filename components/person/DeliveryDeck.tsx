'use client';
import { useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { QuestionDeck, type DeckCard } from '../wizard/QuestionDeck';
import { useDeckDraft, type Draft } from '../wizard/useDeckDraft';
import { Err, Help, SummaryRow, Title } from '../wizard/parts';
import { cardInput, chipStyle, darkBtn, label } from '../ds/tokens';
import { hostOf } from '@/lib/validation';
import { MONTHS_LONG, STATUS_LONG } from '@/lib/format';

export type DeliveryForm = { title: string; description: string; initiativeId: string; status: 'ENTREGUE' | 'EM_ANDAMENTO' | 'PAUSADA'; role: string; links: string[]; date: string; impact: string };
export type DeliveryDraft = Draft<DeliveryForm>;
export type DeliveryView = DeliveryForm & { id: string; initiativeTitle: string | null };
const LAST = 4;
const todayIso = () => new Date().toISOString().slice(0, 10);
const longDate = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${d} de ${MONTHS_LONG[m - 1]} de ${y}`; };
const isUrl = (v: string) => { try { new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`); return /\./.test(v); } catch { return false; } };

export function DeliveryDeck({ personId, editing, initiatives, draft, onDraftChange, onClose, onSaved }: {
  personId: string; editing: DeliveryView | null; initiatives: { id: string; title: string }[]; draft: DeliveryDraft | null; onDraftChange: (d: DeliveryDraft | null) => void; onClose: () => void; onSaved: () => void;
}) {
  const start: DeliveryForm = editing ? { ...editing } : { title: '', description: '', initiativeId: '', status: 'ENTREGUE', role: '', links: [], date: todayIso(), impact: '' };
  const d = useDeckDraft<DeliveryForm>({ scope: 'delivery', entityId: personId, empty: start, draft: editing ? null : draft, last: LAST, onDraftChange, persist: !editing });
  const { form, set } = d;
  const [errTitle, setErrTitle] = useState(false);
  const [typedLink, setTypedLink] = useState('');
  const [linkErr, setLinkErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const TAG = `SUAS ENTREGAS · ${editing ? 'EDITAR' : 'NOVA'}`;

  const submit = async () => {
    setBusy(true); setServerError(null);
    try {
      const r = await fetch(editing ? `/api/people/${personId}/deliveries/${editing.id}` : `/api/people/${personId}/deliveries`, { method: editing ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: form.title.trim(), description: form.description.trim(), initiativeId: form.initiativeId || null, status: form.status, role: form.role.trim(), impact: form.impact, date: form.date, links: form.links }) });
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
  const addLink = () => { const v = typedLink.trim(); if (!v) return; if (!isUrl(v)) { setLinkErr(true); return; } setLinkErr(false); if (!form.links.includes(v)) set({ links: [...form.links, v] }); setTypedLink(''); };
  const ini = initiatives.find((i) => i.id === form.initiativeId);
  const kk = `ENTREGA · ${form.date.slice(8, 10)} ${MONTHS_LONG[Number(form.date.slice(5, 7)) - 1]?.slice(0, 3).toUpperCase()}`;
  void kk;

  const cards: DeckCard[] = [
    { id: 'qual', bg: '#8FE3C8', node: (<>
      <Title>Qual foi a entrega?</Title><Help>O título vira o nome da carta no deck. A descrição conta o que foi para o ar.</Help>
      <span style={label(11)}>{longDate(form.date)} · {editing ? 'data da entrega' : 'registrada automaticamente'}</span>
      <label htmlFor="dw-titulo" style={label()}>TÍTULO</label>
      <input id="dw-titulo" type="text" value={form.title} placeholder="Ex.: Captura guiada na câmera" onChange={(e) => { set({ title: e.target.value }); setErrTitle(false); }} style={cardInput} />
      <Err show={errTitle}>Dê um título à entrega para seguir.</Err>
      <label htmlFor="dw-desc" style={label()}>DESCRIÇÃO · OPCIONAL</label>
      <textarea id="dw-desc" value={form.description} onChange={(e) => set({ description: e.target.value })} style={{ ...cardInput, minHeight: 100, resize: 'vertical' }} />
    </>) },
    { id: 'ini', bg: '#B7A6FF', node: (<>
      <Title>Ela faz parte de alguma iniciativa?</Title><Help>Se fizer, a entrega fica ligada à mesa da iniciativa.</Help>
      <div role="radiogroup" aria-label="Iniciativa" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <button type="button" role="radio" aria-checked={!form.initiativeId} className="tw-chip" onClick={() => set({ initiativeId: '' })} style={chipStyle(!form.initiativeId)}>Nenhuma iniciativa</button>
        {initiatives.map((i) => <button key={i.id} type="button" role="radio" aria-checked={form.initiativeId === i.id} className="tw-chip" onClick={() => set({ initiativeId: i.id })} style={chipStyle(form.initiativeId === i.id)}>{i.title}</button>)}
      </div>
      <span style={label()}>COMO ELA ESTÁ?</span>
      <div role="radiogroup" aria-label="Status" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(['ENTREGUE', 'EM_ANDAMENTO', 'PAUSADA'] as const).map((s) => <button key={s} type="button" role="radio" aria-checked={form.status === s} className="tw-chip" onClick={() => set({ status: s })} style={chipStyle(form.status === s)}>{STATUS_LONG[s]}</button>)}
      </div>
    </>) },
    { id: 'papel', bg: '#F3D36B', optional: true, node: (<>
      <Title>Qual foi o seu papel?</Title><Help>O que você puxou de ponta a ponta.</Help>
      <textarea aria-label="Seu papel" value={form.role} onChange={(e) => set({ role: e.target.value })} style={{ ...cardInput, minHeight: 130, resize: 'vertical' }} />
    </>) },
    { id: 'links', bg: '#F5A9D6', optional: true, node: (<>
      <Title>Quer anexar links?</Title><Help>Opcional. Figma, documento, PR, dashboard: o que ajuda a contar essa entrega.</Help>
      <form onSubmit={(e) => { e.preventDefault(); addLink(); }} style={{ display: 'flex', gap: 8 }}>
        <input type="text" aria-label="Link" placeholder="https://" value={typedLink} onChange={(e) => { setTypedLink(e.target.value); setLinkErr(false); }} style={{ ...cardInput, flex: '1 1 auto' }} /><button type="submit" style={darkBtn}>Adicionar</button>
      </form>
      <Err show={linkErr}>Esse link não parece válido. Confere e tenta de novo.</Err>
      {form.links.length === 0 && <span style={{ fontSize: 14 }}>Nenhum link anexado ainda.</span>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{form.links.map((l, i) => <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, border: '1.5px solid #0E0E12', background: '#F5F2EC', padding: '6px 6px 6px 12px' }}><span style={{ flex: 1, minWidth: 0 }}><b style={{ fontSize: 14 }}>{hostOf(l)}</b><br /><span style={{ fontSize: 12, wordBreak: 'break-all' }}>{l}</span></span><button type="button" aria-label={`Remover ${l}`} onClick={() => set({ links: form.links.filter((_, j) => j !== i) })} style={{ width: 44, height: 44, border: 0, background: 'transparent', cursor: 'pointer' }}>✕</button></div>)}</div>
    </>) },
    { id: 'resumo', bg: '#B7A6FF', summary: true, node: (<>
      <Title>Confere a entrega?</Title><Help>Ela entra no deck de Entregas e aparece para o manager.</Help>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SummaryRow k="ENTREGA" v={form.title || '—'} /><SummaryRow k="INICIATIVA" v={ini?.title ?? 'Nenhuma iniciativa'} /><SummaryRow k="STATUS" v={STATUS_LONG[form.status]} />
        <SummaryRow k="SEU PAPEL" v={form.role || 'Sem descrição'} /><SummaryRow k="LINKS" v={form.links.length ? form.links.map(hostOf).join(', ') : 'Nenhum'} />
      </div>
    </>) },
  ];
  return (
    <BottomSheet tag={TAG} title={editing ? 'Editar entrega' : 'Nova entrega'} onClose={onClose}>
      <QuestionDeck tag={TAG} cards={cards} step={d.step} onGo={go} busy={busy} busyLabel="Salvando…" error={serverError} nextLabel={d.step === LAST ? (editing ? 'Salvar alterações' : 'Criar entrega') : 'Próxima'} />
    </BottomSheet>
  );
}
