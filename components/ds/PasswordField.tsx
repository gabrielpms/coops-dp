'use client';
import { useState } from 'react';
import { deskInput } from './tokens';

/** Campo de senha com botão de mostrar/ocultar (alvo de toque de 44 px). */
export function PasswordField({ id, label, value, onChange, autoComplete, hint, required = true }: {
  id: string; label: string; value: string; onChange: (v: string) => void; autoComplete: 'new-password' | 'current-password'; hint?: string; required?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 14, color: '#A3A1AD' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input id={id} type={show ? 'text' : 'password'} autoComplete={autoComplete} required={required} value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={{ ...deskInput(focus), paddingRight: 64 }} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} style={{ position: 'absolute', right: 4, top: 4, width: 52, height: 44, border: 0, background: 'transparent', color: '#B7A6FF', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{show ? 'Ocultar' : 'Mostrar'}</button>
      </div>
      {hint && <span style={{ fontSize: 13, color: '#A3A1AD' }}>{hint}</span>}
    </div>
  );
}
