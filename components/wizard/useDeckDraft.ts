'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export type Draft<T> = { form: T; step: number };

/**
 * Estado de um deck de perguntas com rascunho persistente (PRD 6.2): abre já com o rascunho que veio
 * da página, salva 600 ms depois de mexer e na hora ao trocar de carta. Só grava depois que a pessoa mexe.
 */
export function useDeckDraft<T>({ scope, entityId, empty, draft, last, onDraftChange, persist = true }: {
  scope: string; entityId: string; empty: T; draft?: Draft<T> | null; last: number; onDraftChange?: (d: Draft<T> | null) => void;
  /** false nos decks de edição: o valor de partida vem do registro, então não há rascunho a guardar. */
  persist?: boolean;
}) {
  const [form, setForm] = useState<T>(() => (draft?.form ? { ...empty, ...draft.form } : empty));
  const [step, setStep] = useState(() => Math.min(last, draft?.step ?? 0));
  const touched = useRef(false);
  const latest = useRef({ form, step });
  latest.current = { form, step };

  // a função do pai pode mudar a cada renderização: guardada em ref para não realimentar o salvamento
  const notify = useRef(onDraftChange);
  notify.current = onDraftChange;
  const save = useCallback((f: T, s: number) => {
    if (!persist) return;
    notify.current?.({ form: f, step: s });
    fetch('/api/drafts', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ scope, entityId, payload: { form: f, step: s } }) }).catch(() => {});
  }, [scope, entityId, persist]);

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!touched.current) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => save(latest.current.form, latest.current.step), 600);
    return () => clearTimeout(timer.current);
  }, [form, save]);
  useEffect(() => () => { if (touched.current) save(latest.current.form, latest.current.step); }, [save]);

  const set = (patch: Partial<T>) => { touched.current = true; setForm((f) => ({ ...f, ...patch })); };
  const goTo = (k: number) => { touched.current = true; setStep(k); save(latest.current.form, k); };
  /** Depois de concluir: o servidor apaga o rascunho; aqui só impede a regravação ao desmontar. */
  const done = () => { touched.current = false; clearTimeout(timer.current); notify.current?.(null); };
  return { form, set, step, setStep, goTo, done };
}
