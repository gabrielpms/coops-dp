'use client';
import { useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { cardInput, darkBtn } from '../ds/tokens';

/** Cadastro do token pessoal do Figma (cifrado no servidor). Com ele o Coops importa as telas de um link do Figma para a análise. */
export function FigmaTokenDeck({ configured, last4, onClose, onSaved }: { configured: boolean; last4: string | null; onClose: () => void; onSaved: (text: string) => void }) {
  const [token, setToken] = useState(''); // fica só no estado
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = async (method: 'PUT' | 'DELETE') => {
    setBusy(true); setError(null);
    try {
      const r = await fetch('/api/me/integrations/figma', { method, headers: { 'content-type': 'application/json' }, body: method === 'PUT' ? JSON.stringify({ token: token.trim() }) : undefined });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setError(d.error ?? 'Não deu para salvar. Tente de novo.'); return; }
      onSaved(method === 'PUT' ? 'Figma conectado. Agora dá para importar telas por link nas iniciativas.' : 'Figma desconectado.');
    } catch { setError('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };
  const ghost = { ...darkBtn, background: 'transparent', color: '#F5F2EC', border: '1.5px solid #4A4858', minHeight: 48 } as const;
  const primary = { fontFamily: 'inherit', fontWeight: 600, fontSize: 15, color: '#0E0E12', background: '#8FE3C8', border: '2px solid #0E0E12', borderRadius: 14, minHeight: 48, padding: '0 20px', cursor: busy ? 'wait' : 'pointer' } as const;
  return (
    <BottomSheet tag="INTEGRAÇÕES · FIGMA" title="Token do Figma" sub="Para importar telas por link." onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); if (token.trim()) void call('PUT'); }} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560 }}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: '#C9C7D1' }}>
          {configured ? `Hoje o token termina em ${last4}. Cole outro para trocar.` : 'No Figma: Configurações › Segurança › Tokens de acesso pessoal. Marque só a leitura de arquivos (File content: Read).'}
          {' '}O token é cifrado e vale para os arquivos que a sua conta do Figma consegue abrir.
        </p>
        <input type="password" aria-label="Token pessoal do Figma" autoComplete="off" spellCheck={false} placeholder="figd_…" value={token} onChange={(e) => { setToken(e.target.value); setError(null); }} style={cardInput} />
        {error && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{error}</span>}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {configured ? <button type="button" disabled={busy} onClick={() => call('DELETE')} style={ghost}>Desconectar</button> : <span />}
          <button type="submit" disabled={busy || !token.trim()} style={{ ...primary, opacity: token.trim() ? 1 : 0.5 }}>{busy ? 'Testando e salvando…' : 'Salvar token'}</button>
        </div>
      </form>
    </BottomSheet>
  );
}
