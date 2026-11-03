'use client';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/avatar/Avatar';
import { useCoopsRouter, CoopsLink } from '@/components/nav/useCoopsRouter';
import { PasswordField } from '@/components/ds/PasswordField';
import { deskInput, label } from '@/components/ds/tokens';

const F = [
  { bg: '#F5F2EC', label: 'TIME', icon: 'M20 22m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0M44 22m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0M6 50c1-9 7-14 14-14s13 5 14 14M30 50c1-9 7-14 14-14s13 5 14 14', title: 'Cada pessoa é uma carta', detail: '4 decks de desenvolvimento', avatar: true, head: 'Seu time, em cartas.', sub: 'Cada pessoa ganha uma carta com eventos, skills, brain gym e jornada.', bubble: 'Começa por você: sua carta é a primeira.' },
  { bg: '#F3D36B', label: 'SKILLS', icon: 'M32 6l7 15 16 2-12 11 3 16-14-8-14 8 3-16L9 23l16-2z', title: 'Facilitação', detail: 'Você 4 · manager 4', pips: 4, head: 'Skills sem planilha.', sub: 'Autoavaliação de 1 a 5, lado a lado com a nota do manager.', bubble: 'Duas skills subiram neste ciclo.' },
  { bg: '#F5A9D6', label: 'BRAIN GYM', icon: 'M12 14h16a4 4 0 0 1 4 4v36a4 4 0 0 0-4-4H12zM52 14H36a4 4 0 0 0-4 4v36a4 4 0 0 1 4-4h16z', title: 'Livro · Continuous Discovery', detail: 'Ligado a Pesquisa', num: '60%', pct: 60, head: 'Estudo que vira evolução.', sub: 'Livros, cursos e palestras ligados às skills que você quer subir.', bubble: 'Faltam 3 capítulos. Bora?' },
  { bg: '#FF8A5B', label: 'JORNADA', icon: 'M8 54c10 0 10-14 20-14s8-14 18-14M46 26V8l10 5-10 5', title: 'Liderar uma pesquisa de ponta a ponta', detail: 'Objetivo Q4 · 3 de 5 passos', num: '3/5', pct: 60, head: 'Jornada com norte.', sub: 'Objetivos por ciclo, combinados entre você e o manager.', bubble: 'Próximo passo: roteiro com o squad.' },
  { bg: '#8FE3C8', label: 'AGENTE', icon: 'M32 6c10 8 14 20 10 34H22C18 26 22 14 32 6zM32 19a5 5 0 1 0 0 10a5 5 0 1 0 0-10M22 40l-8 10h12M42 40l8 10H38', title: 'Pessoas desistem no envio do documento', detail: 'Iniciativa 07 · Explore the solutions', head: 'Um agente que joga junto.', sub: 'Ele entende o momento da iniciativa e entrega as cartas certas.', bubble: 'Quer gerar 4 alternativas de fluxo?' },
];
const SLOTS = [
  { t: 'translate(0, 0) rotate(-4deg) scale(1)', z: 6, op: 1, sh: '0 24px 40px rgba(14,14,18,0.35)' },
  { t: 'translate(46px, -16px) rotate(6deg) scale(0.95)', z: 5, op: 1, sh: '0 10px 20px rgba(14,14,18,0.2)' },
  { t: 'translate(86px, -30px) rotate(13deg) scale(0.9)', z: 4, op: 1, sh: 'none' },
  { t: 'translate(110px, -40px) rotate(18deg) scale(0.86)', z: 3, op: 0, sh: 'none' },
  { t: 'translate(-150%, 60px) rotate(-24deg) scale(0.9)', z: 7, op: 0, sh: 'none' },
];

function Carousel() {
  const n = F.length;
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const [swap, setSwap] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  const swapT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const go = (i: number) => { setSwap(true); clearTimeout(swapT.current); swapT.current = setTimeout(() => setSwap(false), 220); setCur(((i % n) + n) % n); };
  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => setCur((c) => { setSwap(true); clearTimeout(swapT.current); swapT.current = setTimeout(() => setSwap(false), 220); return (c + 1) % n; }), 3600);
    return () => clearInterval(timer.current);
  }, [paused, cur, n]);
  useEffect(() => () => clearTimeout(swapT.current), []);

  return (
    <aside onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      style={{ position: 'relative', flex: '1 1 420px', minHeight: 420, borderRadius: 32, background: '#B7A6FF', color: '#0E0E12', padding: 40, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 24, overflow: 'hidden' }}>
      <div aria-hidden="true" style={{ position: 'absolute', left: -70, bottom: -90, width: 300, height: 300, borderRadius: '50%', border: '1.5px solid rgba(14,14,18,0.22)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', right: -60, top: 80, width: 200, height: 200, borderRadius: '50%', border: '1.5px solid rgba(14,14,18,0.22)' }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#0E0E12', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>coops.</span>
        <span style={label(12, '0.08em')}>{String(cur + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
      </div>
      <div aria-hidden="true" style={{ position: 'relative', flex: 1, minHeight: 360 }}>
        {F.map((f, i) => {
          const s = SLOTS[(i - cur + n) % n];
          return (
            <div key={f.label} style={{ position: 'absolute', left: '50%', top: '50%', width: 230, height: 300, margin: '-150px 0 0 -150px', boxSizing: 'border-box', borderRadius: 24, background: f.bg, border: '2px solid #0E0E12', padding: 18, display: 'flex', flexDirection: 'column', gap: 10, zIndex: s.z, opacity: s.op, transform: s.t, boxShadow: s.sh, transition: 'transform 700ms cubic-bezier(.65,0,.25,1), opacity 500ms ease, box-shadow 500ms ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <svg width="44" height="44" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon} /></svg>
                <span style={{ ...label(10), border: '1.5px solid #0E0E12', borderRadius: 999, padding: '4px 8px' }}>{f.label}</span>
              </div>
              {f.avatar && <div style={{ alignSelf: 'center', lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12', marginTop: 4 }}><Avatar skin="#8D5A3B" hairStyle="blackpower" shirtStyle="gola-alta" earrings lashes crown bg="#F3D36B" size={96} label="" /></div>}
              {f.pips && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5, marginTop: 8 }}>{[1, 2, 3, 4, 5].map((k) => <span key={k} style={{ height: 30, borderRadius: 8, border: '2px solid #0E0E12', background: k <= f.pips! ? '#0E0E12' : 'transparent' }} />)}</div>}
              {f.num && <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>{f.num}</span><span style={{ display: 'block', height: 8, borderRadius: 4, background: 'rgba(14,14,18,0.18)' }}><span style={{ display: 'block', width: `${f.pct}%`, height: 8, borderRadius: 4, background: '#0E0E12' }} /></span></div>}
              <span style={{ marginTop: 'auto', fontSize: 20, fontWeight: 700, lineHeight: 1.15 }}>{f.title}</span>
              <span style={{ fontSize: 13, lineHeight: 1.4 }}>{f.detail}</span>
            </div>
          );
        })}
        <div style={{ position: 'absolute', right: 0, bottom: 0, zIndex: 8, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <span style={{ maxWidth: 190, fontSize: 13, lineHeight: 1.3, background: '#F5F2EC', border: '2px solid #0E0E12', borderRadius: '14px 14px 4px 14px', padding: '8px 12px', marginBottom: 44, opacity: swap ? 0 : 1, transform: swap ? 'translateY(6px)' : 'none', transition: 'opacity 220ms ease, transform 220ms ease' }}>{F[cur].bubble}</span>
          <svg width="72" height="72" viewBox="0 0 100 100" style={{ transform: `rotate(${cur * 72}deg)`, transition: 'transform 700ms cubic-bezier(.34,1.56,.64,1)' }}>
            <path d="M50 6 60 38 94 50 60 62 50 94 40 62 6 50 40 38z" fill="#8FE3C8" stroke="#0E0E12" strokeWidth="3" strokeLinejoin="round" /><circle cx="44" cy="48" r="3.5" fill="#0E0E12" /><circle cx="56" cy="48" r="3.5" fill="#0E0E12" /><path d="M44 57c4 3 8 3 12 0" fill="none" stroke="#0E0E12" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div aria-live="polite" style={{ position: 'relative', minHeight: 96 }}>
          {F.map((f, i) => (
            <div key={f.label} aria-hidden={i !== cur} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 6, opacity: i === cur ? 1 : 0, transform: i === cur ? 'none' : 'translateY(10px)', transition: 'opacity 400ms ease, transform 500ms cubic-bezier(.22,1,.36,1)', pointerEvents: 'none' }}>
              <p style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{f.head}</p>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, maxWidth: 440 }}>{f.sub}</p>
            </div>
          ))}
        </div>
        <div role="tablist" aria-label="Recursos do Coops" style={{ display: 'flex', gap: 6 }}>
          {F.map((f, i) => (
            <button key={f.label} type="button" role="tab" aria-selected={i === cur} aria-label={f.label} onClick={() => go(i)}
              style={{ flex: i === cur ? '4 1 0' : '1 1 0', height: 10, minWidth: 10, padding: 0, borderRadius: 5, border: '1.5px solid #0E0E12', background: 'rgba(14,14,18,0.12)', cursor: 'pointer', overflow: 'hidden', transition: 'flex 400ms cubic-bezier(.22,1,.36,1)' }}>
              {i === cur && <span key={cur} style={{ display: 'block', height: '100%', background: '#0E0E12', animation: 'coopsFill 3600ms linear both', animationPlayState: paused ? 'paused' : 'running' }} />}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function CadastroClient() {
  const { go } = useCoopsRouter();
  const [v, setV] = useState({ name: '', email: '', phone: '', password: '', role: 'MANAGER' as 'IC' | 'MANAGER' });
  const [focus, setFocus] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      if (v.password.length < 8) { setError('A senha precisa ter pelo menos 8 caracteres'); setBusy(false); document.getElementById('cad-senha')?.focus(); return; }
      const r = await fetch('/api/auth/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(v) });
      const d = await r.json();
      if (!r.ok) { setError(d.error ?? 'Não foi possível criar a conta.'); setBusy(false); return; }
      go(d.next);
    } catch { setError('Sem conexão. Tente de novo.'); setBusy(false); }
  };
  const field = (id: string, text: string, type: string, auto: string, ph: string, key: 'name' | 'email' | 'phone') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 14, color: '#A3A1AD' }}>{text}</label>
      <input id={id} type={type} autoComplete={auto} placeholder={ph} value={v[key]} required={key !== 'phone'} onChange={(e) => setV({ ...v, [key]: e.target.value })} onFocus={() => setFocus(id)} onBlur={() => setFocus('')} style={deskInput(focus === id)} />
    </div>
  );
  const roleCard = (value: 'IC' | 'MANAGER', title: string, sub: string, icon: React.ReactNode) => {
    const on = v.role === value;
    return (
      <label style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10, borderRadius: 18, background: on ? '#B7A6FF' : '#17171D', color: on ? '#0E0E12' : '#F5F2EC', border: `1.5px solid ${on ? '#B7A6FF' : '#2C2C36'}`, padding: 16, cursor: 'pointer', minHeight: 132, boxSizing: 'border-box' }}>
        <input type="radio" name="papel" value={value} checked={on} onChange={() => setV({ ...v, role: value })} style={{ position: 'absolute', top: 16, right: 16, width: 20, height: 20, accentColor: on ? '#0E0E12' : '#B7A6FF' }} />
        <svg width="36" height="36" viewBox="0 0 64 64" fill="none" stroke={on ? '#0E0E12' : '#F5F2EC'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
        <span style={{ fontSize: 18, fontWeight: 700 }}>{title}</span><span style={{ fontSize: 13, color: on ? '#0E0E12' : '#A3A1AD' }}>{sub}</span>
      </label>
    );
  };
  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: 24, display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <Carousel />
      <main style={{ flex: '1 1 480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 8px' }}>
        <form onSubmit={submit} style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ ...label(12, '0.1em'), color: '#B7A6FF' }}>CRIAR CONTA</span>
            <h1 style={{ margin: 0, fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05 }}>Vamos montar seu deck</h1>
          </div>
          {field('cad-nome', 'Nome', 'text', 'name', 'Marina Costa', 'name')}
          {field('cad-email', 'E-mail de trabalho', 'email', 'email', 'voce@empresa.com', 'email')}
          {field('cad-tel', 'Telefone', 'tel', 'tel', '(11) 90000-0000', 'phone')}
          <PasswordField id="cad-senha" label="Crie uma senha" autoComplete="new-password" value={v.password} onChange={(password) => setV({ ...v, password })} hint="Mínimo de 8 caracteres." />
          <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <legend style={{ fontSize: 14, color: '#A3A1AD', marginBottom: 10, padding: 0 }}>Como você atua?</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
              {roleCard('IC', 'IC', 'Faço o design acontecer', <path d="M14 50l6-18 24-24 12 12-24 24zM38 14l12 12" />)}
              {roleCard('MANAGER', 'Manager', 'Lidero um time de design', <><circle cx="22" cy="22" r="8" /><circle cx="44" cy="26" r="6" /><path d="M8 52c2-10 8-16 14-16s12 6 14 16M36 52c1-7 4-12 8-12s8 5 10 12" /></>)}
            </div>
          </fieldset>
          {error && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{error}</span>}
          <button type="submit" disabled={busy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 52, color: '#0E0E12', background: '#B7A6FF', border: 0, fontFamily: 'inherit', fontWeight: 600, fontSize: 16, borderRadius: 14, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1 }}>Criar conta</button>
          <p style={{ margin: 0, fontSize: 14, color: '#A3A1AD', textAlign: 'center' }}>Já tem conta? <CoopsLink href="/entrar">Entrar</CoopsLink></p>
        </form>
      </main>
    </div>
  );
}
