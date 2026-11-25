'use client';
import { useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { QuestionDeck, type DeckCard } from '../wizard/QuestionDeck';
import { Err, Help, SummaryRow, Title } from '../wizard/parts';
import { cardInput, chipStyle, label } from '../ds/tokens';
import { GuideCard } from './IntegrationGuide';
import { MODELS } from '@/lib/agent/catalog';

const TAG = 'INTEGRAÇÕES · ANTHROPIC';
const KEY_RE = /^sk-ant-[A-Za-z0-9_-]{20,300}$/;

/** Cadastro da chave da API (cifrada no servidor) e do modelo do agente: uma pergunta por carta. */
export function ApiKeyDeck({ configured, last4, model: model0, onClose, onSaved }: { configured: boolean; last4: string | null; model: string; onClose: () => void; onSaved: () => void }) {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState(''); // fica só no estado: nunca vai para rascunho
  const [model, setModel] = useState(model0);
  const [errKey, setErrKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const keyOk = KEY_RE.test(apiKey.trim());

  const submit = async () => {
    setBusy(true); setServerError(null);
    try {
      const r = await fetch('/api/me/integrations/anthropic', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}), model }) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { setServerError(data.error ?? 'Não deu para salvar. Tente de novo.'); return; }
      onSaved();
    } catch { setServerError('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };
  const go = (k: number) => {
    const to = Math.max(0, k);
    if (to > 1 && !configured && !keyOk) { setErrKey('Cole a chave inteira (ela começa com sk-ant-).'); setStep(1); return; }
    if (to > 1 && apiKey.trim() && !keyOk) { setErrKey('Essa não parece uma chave da Anthropic (ela começa com sk-ant-).'); setStep(1); return; }
    setErrKey(null);
    if (to > 3) { void submit(); return; }
    setStep(to);
  };
  const cards: DeckCard[] = [
    { id: 'guia', size: 'sm', bg: '#8FE3C8', node: <GuideCard guide="anthropic" /> },
    { id: 'chave', size: 'sm', bg: '#A9D8F5', node: (<>
      <Title>{configured ? 'Trocar a chave da Anthropic?' : 'Cole a chave da API da Anthropic'}</Title>
      <Help>{configured ? `Hoje a chave termina em ${last4}. Deixe em branco para manter e só mudar o modelo.` : 'Ela é cifrada e só os 4 últimos caracteres aparecem aqui. Na carta anterior está onde achar.'}</Help>
      <input type="password" aria-label="Chave da API da Anthropic" autoComplete="off" spellCheck={false} placeholder="sk-ant-…" value={apiKey} onChange={(e) => { setApiKey(e.target.value); setErrKey(null); }} style={cardInput} />
      <Err show={!!errKey}>{errKey}</Err>
    </>) },
    { id: 'modelo', size: 'sm', bg: '#F3D36B', node: (<>
      <Title>Qual modelo o agente usa?</Title><Help>Vale para todas as análises dos seus projetos. Dá para mudar quando quiser.</Help>
      <span style={label()}>MODELO</span>
      <div role="radiogroup" aria-label="Modelo" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MODELS.map((m) => { const on = model === m.id; return (
          <button key={m.id} type="button" role="radio" aria-checked={on} className="tw-chip" onClick={() => setModel(m.id)} style={{ ...chipStyle(on), display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '10px 14px' }}>
            <b style={{ fontSize: 15 }}>{m.name}</b><span style={{ fontSize: 12, fontWeight: 400 }}>{m.hint}</span>
          </button>); })}
      </div>
    </>) },
    { id: 'resumo', size: 'sm', bg: '#B7A6FF', summary: true, node: (<>
      <Title>Confere?</Title><Help>Ao salvar, o Coops testa a chave na Anthropic antes de guardá-la.</Help>
      <SummaryRow k="CHAVE" v={apiKey.trim() ? 'Nova chave (será testada)' : configured ? `Mantida · •••• ${last4}` : '—'} />
      <SummaryRow k="MODELO" v={MODELS.find((m) => m.id === model)?.name ?? model} />
    </>) },
  ];
  return (
    <BottomSheet tag={TAG} title="Chave da Anthropic" sub="Uma pergunta por carta." onClose={onClose}>
      <QuestionDeck tag={TAG} cards={cards} step={step} onGo={go} busy={busy} busyLabel="Testando e salvando…" error={serverError} nextLabel={step === 3 ? 'Salvar integração' : 'Próxima'} />
    </BottomSheet>
  );
}
