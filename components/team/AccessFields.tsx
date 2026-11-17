'use client';
import { useState } from 'react';
import { cardInput, darkBtn, label } from '../ds/tokens';

export const MIN_PASSWORD = 8;
const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
/** Senha aleatória de 10 caracteres, sem letras que se confundem (l, I, O, 0, 1). */
export const generatePassword = () => { const a = new Uint32Array(10); crypto.getRandomValues(a); return Array.from(a, (n) => ALPHABET[n % ALPHABET.length]).join(''); };

/** Senha de acesso criada por quem cadastra: a pessoa entra com o e-mail e esta senha. Fica só no estado do formulário (nunca vai para o rascunho). */
export function AccessFields({ email, password, onPassword, error, id }: { email: string; password: string; onPassword: (v: string) => void; error?: boolean; id: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(`E-mail: ${email}\nSenha: ${password}`); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* sem permissão: a senha continua visível */ } };
  return (
    <>
      <label htmlFor={id} style={label()}>SENHA DE ACESSO</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input id={id} type="text" autoComplete="off" spellCheck={false} aria-label="Senha de acesso" placeholder={`Pelo menos ${MIN_PASSWORD} caracteres`} value={password} onChange={(e) => onPassword(e.target.value)} style={{ ...cardInput, flex: '1 1 auto', fontFamily: "'JetBrains Mono', monospace" }} />
        <button type="button" onClick={() => onPassword(generatePassword())} style={{ ...darkBtn, flex: 'none', minHeight: 52 }}>Gerar</button>
      </div>
      {error && <span role="alert" style={{ fontSize: 14, fontWeight: 600 }}>A senha precisa ter pelo menos {MIN_PASSWORD} caracteres.</span>}
      <button type="button" onClick={copy} disabled={!password || !email} style={{ ...darkBtn, alignSelf: 'flex-start', background: 'transparent', color: '#0E0E12', border: '1.5px solid #0E0E12', minHeight: 44, opacity: !password || !email ? 0.5 : 1 }}>{copied ? 'Copiado ✓' : 'Copiar e-mail e senha'}</button>
    </>
  );
}
