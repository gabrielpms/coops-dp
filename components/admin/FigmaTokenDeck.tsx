'use client';
import { useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { QuestionDeck, type DeckCard } from '../wizard/QuestionDeck';
import { Err, Help, SummaryRow, Title } from '../wizard/parts';
import { cardInput, darkBtn } from '../ds/tokens';
import { GUIDES, GuideSteps } from './IntegrationGuide';

const TAG = 'INTEGRAÇÕES · FIGMA';
const TOKEN_RE = /^[A-Za-z0-9_.-]{20,300}$/;

/** Cadastro do token pessoal do Figma (cifrado no servidor), uma carta por vez: onde achar, colar e conferir. */
export function FigmaTokenDeck({ configured, last4, onClose, onSaved }: { configured: boolean; last4: string | null; onClose: () => void; onSaved: (text: string) => void }) {
  const [step, setStep] = useState(0);
  const [token, setToken] = useState(''); // fica só no estado: nunca vai para rascunho
  const [errToken, setErrToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const tokenOk = TOKEN_RE.test(token.trim());

  const call = async (method: 'PUT' | 'DELETE') => {
    setBusy(true); setServerError(null);
    try {
      const r = await fetch('/api/me/integrations/figma', { method, headers: { 'content-type': 'application/json' }, body: method === 'PUT' ? JSON.stringify({ token: token.trim() }) : undefined });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setServerError(d.error ?? 'Não deu para salvar. Tente de novo.'); return; }
      onSaved(method === 'PUT' ? 'Figma conectado. Agora dá para importar telas por link nas iniciativas.' : 'Figma desconectado.');
    } catch { setServerError('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };
  const go = (k: number) => {
    const to = Math.max(0, k);
    if (to > 0 && !tokenOk && (!configured || token.trim())) { setErrToken('Cole o token inteiro (ele começa com figd_).'); setStep(0); return; }
    if (to > 0 && !configured && !token.trim()) { setErrToken('Cole o token inteiro (ele começa com figd_).'); setStep(0); return; }
    setErrToken(null);
    if (to > 1) { if (token.trim()) void call('PUT'); else onClose(); return; }
    setStep(to);
  };
  const cards: DeckCard[] = [
    { id: 'token', size: 'lg', bg: '#F5A9D6', node: (<>
      <Title>{configured ? 'Trocar o token do Figma?' : 'Cole o token pessoal do Figma'}</Title>
      <Help>{configured ? `Hoje o token termina em ${last4}. Deixe em branco para manter.` : 'Ele é cifrado e só os 4 últimos caracteres aparecem aqui. ' + GUIDES.figma.why}</Help>
      <GuideSteps guide="figma" />
      <input type="password" aria-label="Token pessoal do Figma" autoComplete="off" spellCheck={false} placeholder="figd_…" value={token} onChange={(e) => { setToken(e.target.value); setErrToken(null); }} style={cardInput} />
      <Err show={!!errToken}>{errToken}</Err>
      {configured && <button type="button" disabled={busy} onClick={() => void call('DELETE')} style={{ ...darkBtn, alignSelf: 'flex-start' }}>Desconectar o Figma</button>}
    </>) },
    { id: 'resumo', size: 'sm', bg: '#B7A6FF', summary: true, node: (<>
      <Title>Confere?</Title><Help>Ao salvar, o Coops testa o token no Figma antes de guardá-lo.</Help>
      <SummaryRow k="TOKEN" v={token.trim() ? 'Novo token (será testado)' : configured ? `Mantido · •••• ${last4}` : '—'} />
      <SummaryRow k="PARA QUE SERVE" v="Importar as telas de um link do Figma para a análise da iniciativa" />
    </>) },
  ];
  return (
    <BottomSheet tag={TAG} title="Token do Figma" sub="Uma pergunta por carta." onClose={onClose}>
      <QuestionDeck tag={TAG} cards={cards} step={step} onGo={go} busy={busy} busyLabel="Testando e salvando…" error={serverError} nextLabel={step === 1 ? 'Salvar integração' : 'Próxima'} />
    </BottomSheet>
  );
}
