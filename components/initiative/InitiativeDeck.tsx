'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { QuestionDeck, type DeckCard } from '../wizard/QuestionDeck';
import { cardInput, label } from '../ds/tokens';

export type InitiativeForm = { product: string; problem: string; need: string };
export type InitiativeDraft = { form: InitiativeForm; step: number };
const LAST = 3;

/** Deck "Nova iniciativa": produto (obrigatório), problema e necessidade (opcionais). */
export function InitiativeDeck({ projectId, draft, onDraftChange, onClose, onSaved }: {
  projectId: string; draft?: InitiativeDraft | null; onDraftChange?: (d: InitiativeDraft | null) => void; onClose: () => void; onSaved: (id: string) => void;
}) {
  const [form, setForm] = useState<InitiativeForm>({ product: '', problem: '', need: '', ...(draft?.form ?? {}) });
  const [step, setStep] = useState(Math.min(LAST, draft?.step ?? 0));
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const touched = useRef(false);

  const save = useCallback((f: InitiativeForm, s: number) => {
    onDraftChange?.({ form: f, step: s });
    fetch('/api/drafts', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ scope: 'initiative', entityId: projectId, payload: { form: f, step: s } }) }).catch(() => {});
  }, [projectId, onDraftChange]);
  const latest = useRef({ form, step });
  latest.current = { form, step };
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!touched.current) return;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => save(latest.current.form, latest.current.step), 600);
    return () => clearTimeout(debounce.current);
  }, [form, save]);
  useEffect(() => () => { if (touched.current) save(latest.current.form, latest.current.step); }, [save]);

  const set = (patch: Partial<InitiativeForm>) => { touched.current = true; setForm((f) => ({ ...f, ...patch })); };

  const submit = async () => {
    setBusy(true); setServerError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/initiatives`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error ?? 'Não deu para criar. Tente de novo.'); return; }
      touched.current = false; clearTimeout(debounce.current); onDraftChange?.(null);
      onSaved(data.initiative.id);
    } catch { setServerError('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };

  const go = (k: number) => {
    touched.current = true;
    const target = Math.max(0, k);
    if (target > 0 && !form.product.trim()) { setErr(true); setStep(0); save(form, 0); return; }
    if (target > LAST) { void submit(); return; }
    setErr(false); setStep(target); save(form, target);
  };

  const Title = ({ children }: { children: string }) => <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{children}</span>;
  const Help = ({ children }: { children: string }) => <span style={{ fontSize: 14, lineHeight: 1.45 }}>{children}</span>;
  const area = { ...cardInput, minHeight: 130, resize: 'vertical' } as const;
  const cards: DeckCard[] = [
    { id: 'produto', bg: '#B7A6FF', node: (<>
      <Title>Qual é o produto?</Title><Help>A frente do produto onde a iniciativa acontece. É o nome que aparece na carta.</Help>
      <input type="text" aria-label="Produto da iniciativa" maxLength={160} placeholder="Ex.: Abertura de conta" value={form.product} onChange={(e) => { set({ product: e.target.value }); setErr(false); }} style={cardInput} />
      {err && <span role="alert" style={{ fontSize: 14, fontWeight: 600 }}>Escreva o produto para seguir.</span>}
    </>) },
    { id: 'problema', bg: '#F3D36B', optional: true, node: (<>
      <Title>Qual é o problema?</Title><Help>O que está acontecendo hoje. Se ainda não está claro, pode pular: o agente pergunta depois.</Help>
      <textarea aria-label="Problema" maxLength={1000} placeholder="Ex.: 4 em cada 10 pessoas abandonam o cadastro na etapa de documentos." value={form.problem} onChange={(e) => set({ problem: e.target.value })} style={area} />
    </>) },
    { id: 'necessidade', bg: '#A9D8F5', optional: true, node: (<>
      <Title>O que o negócio precisa?</Title><Help>A necessidade por trás da iniciativa. Se ficar em branco, o agente deduz e pede a sua confirmação.</Help>
      <textarea aria-label="Necessidade" maxLength={1000} placeholder="Ex.: Aumentar a conclusão do cadastro sem piorar a segurança." value={form.need} onChange={(e) => set({ need: e.target.value })} style={area} />
    </>) },
    { id: 'resumo', bg: '#B7A6FF', summary: true, node: (<>
      <Title>Confere a iniciativa?</Title><Help>Em seguida o agente confere se entendeu.</Help>
      {([['PRODUTO', form.product], ['PROBLEMA', form.problem || 'Ainda não informado'], ['NECESSIDADE', form.need || 'O agente deduz e pede confirmação']] as const).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 12, background: 'rgba(245,242,236,0.6)', border: '1.5px solid #0E0E12', padding: '10px 12px' }}><span style={label(10)}>{k}</span><span style={{ fontSize: 14, lineHeight: 1.4 }}>{v}</span></div>
      ))}
    </>) },
  ];
  return (
    <BottomSheet tag="INICIATIVA · NOVA" title="Nova iniciativa" onClose={onClose}>
      <QuestionDeck tag="INICIATIVA · NOVA" cards={cards} step={step} onGo={go} busy={busy} busyLabel="Criando iniciativa…" error={serverError} nextLabel={step === LAST ? 'Criar iniciativa' : 'Próxima'} />
    </BottomSheet>
  );
}
