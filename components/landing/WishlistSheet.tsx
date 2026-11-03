'use client';
import { useEffect, useRef, useState } from 'react';
import { ROLE_OPTIONS } from './data';
import { WISH_CHANNELS, WISH_ROLES, WISH_TEAM_SIZES, EMAIL_RE } from '@/lib/validation';
import { label } from '../ds/tokens';
import { Spinner } from '../ds/ScreenLoader';

const LS = 'coops.wishlist';
type Form = { name: string; email: string; role: number; teamSize: string; focus: number; pains: number[]; channels: number[]; beta: boolean; consent: boolean };
export type WishSeed = { role?: number; focus?: number } | null;

const field: React.CSSProperties = { fontFamily: 'inherit', fontSize: 15, color: '#F5F2EC', background: '#0E0E12', border: '1.5px solid #2C2C36', borderRadius: 10, minHeight: 48, padding: '0 14px', boxSizing: 'border-box', width: '100%' };

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-pressed={on} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, boxSizing: 'border-box', padding: '0 14px', borderRadius: 999, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: on ? '#B7A6FF' : 'transparent', color: on ? '#0E0E12' : '#D6D3DD', border: `1px solid ${on ? '#B7A6FF' : '#2C2C36'}`, transition: 'background-color 160ms ease, color 160ms ease, border-color 160ms ease' }}>{children}</button>;
}
function Section({ n, title, sub, last, children }: { n: string; title: string; sub: string; last?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 40px', padding: '28px 0', borderBottom: last ? 0 : '1px solid #23232B' }}>
      <div style={{ flex: '0 1 220px', display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ ...label(12, '0'), color: '#B7A6FF' }}>{n}</span><span style={{ fontSize: 18, fontWeight: 700 }}>{title}</span><span style={{ fontSize: 13, lineHeight: 1.5, color: '#A3A1AD' }}>{sub}</span></div>
      <div style={{ flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>{children}</div>
    </div>
  );
}
const toggle = (arr: number[], i: number) => (arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i]);

export function WishlistSheet({ seed, onClose }: { seed: WishSeed; onClose: () => void }) {
  const [f, setF] = useState<Form>({ name: '', email: '', role: seed?.role ?? 1, teamSize: WISH_TEAM_SIZES[0], focus: seed?.focus ?? 2, pains: [], channels: [0], beta: true, consent: false });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const set = (p: Partial<Form>) => setF((x) => ({ ...x, ...p }));

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const ov = document.body.style.overflow; document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = ov; window.removeEventListener('keydown', esc); prev?.focus?.(); };
  }, [onClose]);

  // Reabrir no mesmo navegador traz as respostas de volta (e-mail + token guardados).
  useEffect(() => {
    let saved: { email?: string; token?: string } = {};
    try { saved = JSON.parse(localStorage.getItem(LS) ?? '{}'); } catch {}
    if (!saved.email || !saved.token) return;
    fetch(`/api/wishlist?email=${encodeURIComponent(saved.email)}`, { headers: { 'x-wishlist-token': saved.token } }).then((r) => (r.ok ? r.json() : null)).then((d) => {
      const e = d?.entry; if (!e) return;
      const role = Math.max(0, WISH_ROLES.indexOf(e.role));
      const o = ROLE_OPTIONS[role];
      setF({ name: e.name, email: e.email, role, teamSize: e.teamSize, focus: Math.max(0, o.focus.indexOf(e.focus)), pains: e.pains.map((p: string) => o.pains.indexOf(p)).filter((i: number) => i >= 0), channels: e.channels.map((c: string) => WISH_CHANNELS.indexOf(c as never)).filter((i: number) => i >= 0), beta: e.beta, consent: true });
      setSent(true);
    }).catch(() => {});
  }, []);

  const o = ROLE_OPTIONS[f.role];
  const submit = async () => {
    if (!EMAIL_RE.test(f.email.trim())) { setErr('Precisamos de um e-mail válido.'); document.getElementById('wl-email')?.focus(); return; }
    if (!f.consent) { setErr('Marque o aceite de comunicações para entrar na lista.'); return; }
    setBusy(true); setErr('');
    let saved: { email?: string; token?: string } = {};
    try { saved = JSON.parse(localStorage.getItem(LS) ?? '{}'); } catch {}
    try {
      const r = await fetch('/api/wishlist', {
        method: 'POST', headers: { 'content-type': 'application/json', ...(saved.email === f.email.trim().toLowerCase() && saved.token ? { 'x-wishlist-token': saved.token } : {}) },
        body: JSON.stringify({ name: f.name.trim(), email: f.email.trim(), role: WISH_ROLES[f.role], teamSize: f.teamSize, focus: o.focus[f.focus] ?? '', pains: f.pains.map((i) => o.pains[i]), channels: f.channels.map((i) => WISH_CHANNELS[i]), beta: f.beta, consent: true }),
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.error ?? 'Não deu para salvar. Tente de novo.'); return; }
      try { localStorage.setItem(LS, JSON.stringify({ email: f.email.trim().toLowerCase(), token: d.token })); } catch {}
      setSent(true);
    } catch { setErr('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };
  const copy = () => { try { navigator.clipboard?.writeText(`${location.origin}/?convite=time`); } catch {} setCopied(true); };

  const chText = f.channels.length ? f.channels.map((i) => WISH_CHANNELS[i]).join(' e ').toLowerCase().replace('whatsapp', 'WhatsApp').replace('linkedin', 'LinkedIn') : 'e-mail';
  const stepBox = (n: string, bg: string, t: string, s: string) => (
    <li style={{ flex: '1 1 240px', display: 'flex', gap: 14, alignItems: 'center', padding: 16, borderRadius: 14, background: '#212129', border: '1px solid #2C2C36' }}>
      <span style={{ width: 32, height: 32, flex: 'none', borderRadius: 10, background: bg, color: '#0E0E12', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...label(12, '0'), fontWeight: 700 }}>{n}</span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 15, fontWeight: 600 }}>{t}</span><span style={{ fontSize: 13, color: '#A3A1AD' }}>{s}</span></span>
    </li>
  );
  const pill: React.CSSProperties = { ...label(12, '0'), padding: '8px 12px', borderRadius: 999, background: '#212129', border: '1px solid #2C2C36' };

  return (
    <>
      <button type="button" aria-label="Fechar wish list" onClick={onClose} className="coops-overlay" style={{ position: 'fixed', inset: 0, zIndex: 90, border: 0, padding: 0, background: 'rgba(14,14,18,0.72)', backdropFilter: 'blur(3px)', cursor: 'pointer' }} />
      <section ref={ref} tabIndex={-1} id="lista" role="dialog" aria-modal="true" aria-label="Wish list"
        style={{ animation: 'coopsSheetIn 560ms cubic-bezier(.22,1,.36,1) both', position: 'fixed', left: 0, right: 0, bottom: 0, height: 'min(760px, calc(100% - 56px))', zIndex: 100, background: '#0E0E12', borderRadius: '32px 32px 0 0', borderTop: '3px solid #B7A6FF', boxShadow: '0 -30px 80px rgba(0,0,0,0.6)', padding: '0 32px 48px', boxSizing: 'border-box', overflowY: 'auto', overscrollBehavior: 'contain', outline: 'none' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 2, background: '#0E0E12', margin: '0 -32px', padding: '12px 32px', borderBottom: '1px solid #1E1E25' }}>
          <div aria-hidden="true" style={{ width: 56, height: 5, borderRadius: 3, background: '#4A4858', margin: '0 auto 10px' }} />
          <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ ...label(12, '0.1em'), color: '#B7A6FF' }}>WISH LIST · ACESSO EM ONDAS</span>
            <button type="button" aria-label="Fechar" onClick={onClose} style={{ width: 44, height: 44, borderRadius: 14, background: '#212129', border: '1.5px solid #3A3846', color: '#F5F2EC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
          </div>
        </div>
        <div className="coops-sheet-body" style={{ maxWidth: 1216, margin: '0 auto', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ margin: 0, fontSize: 'clamp(34px, 6vw, 48px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1 }}>Entre na wish list.</h2>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55, color: '#D6D3DD', maxWidth: 640 }}>Estamos montando a mesa. Entre na lista para ganhar acesso antecipado e acompanhar cada etapa do lançamento.</p>
            <ol aria-label="Etapas de abertura" style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {stepBox('01', '#B7A6FF', 'Beta fechado', 'Primeiras mesas, com times escolhidos a dedo.')}
              {stepBox('02', '#F3D36B', 'Beta aberto', 'Novas ondas a cada mês, por ordem da lista.')}
              {stepBox('03', '#8FE3C8', 'Lançamento', 'Quem está na lista entra antes e com power up.')}
            </ol>
          </div>
          <div style={{ minWidth: 0, borderRadius: 22, background: '#141419', padding: '4px 32px 28px', boxSizing: 'border-box' }}>
            {!sent ? (
              <form role="form" aria-label="Wish list" noValidate onSubmit={(e) => { e.preventDefault(); void submit(); }} style={{ display: 'flex', flexDirection: 'column' }}>
                <Section n="01" title="Sobre você" sub="Para saber quem está chegando à mesa.">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><label htmlFor="wl-nome" style={{ fontSize: 13, color: '#A3A1AD' }}>Nome</label><input id="wl-nome" type="text" autoComplete="name" placeholder="Como te chamamos?" value={f.name} onChange={(e) => set({ name: e.target.value })} style={field} /></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><label htmlFor="wl-email" style={{ fontSize: 13, color: '#A3A1AD' }}>E-mail de trabalho</label><input id="wl-email" type="email" autoComplete="email" placeholder="voce@empresa.com" required aria-required="true" value={f.email} onChange={(e) => set({ email: e.target.value })} style={{ ...field, borderColor: err.startsWith('Precisamos') ? '#FF8A5B' : '#2C2C36' }} /></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><span style={{ fontSize: 13, color: '#A3A1AD' }}>Seu papel</span><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{WISH_ROLES.map((l, i) => <Chip key={l} on={f.role === i} onClick={() => f.role !== i && set({ role: i, focus: 0, pains: [] })}>{l}</Chip>)}</div></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 280 }}><label htmlFor="wl-time" style={{ fontSize: 13, color: '#A3A1AD' }}>Tamanho do time de design</label><select id="wl-time" value={f.teamSize} onChange={(e) => set({ teamSize: e.target.value })} style={{ ...field, padding: '0 12px' }}>{WISH_TEAM_SIZES.map((t) => <option key={t}>{t}</option>)}</select></div>
                </Section>
                <Section n="02" title="Seu interesse" sub={`Opções pensadas para ${o.short}. Mudam conforme o papel.`}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><span style={{ fontSize: 13, color: '#A3A1AD' }}>O que mais te interessou?</span><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{o.focus.map((l, i) => <Chip key={l} on={f.focus === i} onClick={() => set({ focus: i })}>{l}</Chip>)}</div></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><span style={{ fontSize: 13, color: '#A3A1AD' }}>O que mais pesa hoje? <span style={{ color: '#6E6C78' }}>Quantos quiser</span></span><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{o.pains.map((l, i) => <Chip key={l} on={f.pains.includes(i)} onClick={() => set({ pains: toggle(f.pains, i) })}>{l}</Chip>)}</div></div>
                </Section>
                <Section n="03" title="Novidades" sub="Só o andamento do lançamento, sem spam." last>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><span style={{ fontSize: 13, color: '#A3A1AD' }}>Onde prefere receber o andamento?</span><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{WISH_CHANNELS.map((l, i) => <Chip key={l} on={f.channels.includes(i)} onClick={() => set({ channels: toggle(f.channels, i) })}>{l}</Chip>)}</div></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[['beta', 'Topo testar o beta e conversar 30 min com o time.'], ['consent', 'Aceito receber comunicações sobre o lançamento. Dá para sair quando quiser.']].map(([k, t]) => (
                      <label key={k} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.45, color: '#D6D3DD', cursor: 'pointer', minHeight: 44 }}>
                        <input type="checkbox" checked={f[k as 'beta' | 'consent']} aria-required={k === 'consent'} onChange={() => { set({ [k]: !f[k as 'beta' | 'consent'] } as Partial<Form>); if (k === 'consent') setErr(''); }} style={{ width: 20, height: 20, margin: '1px 0 0', flex: 'none', accentColor: '#B7A6FF' }} />{t}
                      </label>
                    ))}
                  </div>
                </Section>
                {err && <p role="alert" style={{ margin: '0 0 12px', fontSize: 14, color: '#FF8A5B' }}>{err}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'flex-end', paddingTop: 20, borderTop: '1px solid #23232B' }}>
                  <span style={{ fontSize: 13, color: '#6E6C78', marginRight: 'auto' }}>Leva menos de 1 minuto.</span>
                  <button type="button" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '0 18px', borderRadius: 14, border: '1.5px solid #3A3846', background: 'transparent', color: '#F5F2EC', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Agora não</button>
                  <button type="submit" disabled={busy} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '0 22px', borderRadius: 14, border: 0, background: '#B7A6FF', color: '#0E0E12', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1, gap: 10 }}>{busy && <Spinner />}{busy ? 'Enviando…' : 'Entrar na wish list'}</button>
                </div>
              </form>
            ) : (
              <div role="status" style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start', paddingTop: 28 }}>
                <svg width="84" height="84" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6 60 38 94 50 60 62 50 94 40 62 6 50 40 38z" fill="#8FE3C8" stroke="#0E0E12" strokeWidth="3" strokeLinejoin="round" /><circle cx="44" cy="48" r="3.5" fill="#0E0E12" /><circle cx="56" cy="48" r="3.5" fill="#0E0E12" /><path d="M44 57c4 3 8 3 12 0" fill="none" stroke="#0E0E12" strokeWidth="3" strokeLinecap="round" /></svg>
                <span style={{ ...label(12, '0.1em'), color: '#8FE3C8' }}>VOCÊ ESTÁ NA LISTA</span>
                <h3 style={{ margin: 0, fontSize: 'clamp(30px, 5vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.05 }}>Cadeira reservada{f.name.trim() ? `, ${f.name.trim().split(' ')[0]}` : ''}.</h3>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: '#D6D3DD' }}>Vamos mandar o andamento por {chText}. Quando a sua onda abrir, você recebe o convite primeiro.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span style={pill}>{WISH_ROLES[f.role].toUpperCase()}</span><span style={pill}>{(o.focus[f.focus] ?? o.focus[0]).toUpperCase()}</span>
                  {f.beta && <span style={{ ...pill, background: '#B7A6FF', color: '#0E0E12', border: 0 }}>BETA TESTER</span>}
                </div>
                <div style={{ width: '100%', boxSizing: 'border-box', borderRadius: 14, background: '#212129', border: '1px solid #2C2C36', padding: 16, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 15, fontWeight: 600 }}>Suba na fila</span><span style={{ fontSize: 13, color: '#A3A1AD' }}>Cada pessoa do seu time que entrar adianta sua onda.</span></span>
                  <button type="button" onClick={copy} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 18px', borderRadius: 14, border: '1.5px solid #F5F2EC', background: 'transparent', color: '#F5F2EC', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{copied ? 'Link copiado' : 'Copiar convite'}</button>
                </div>
                <button type="button" onClick={() => { setSent(false); setCopied(false); }} style={{ background: 'none', border: 0, padding: '12px 0', minHeight: 44, color: '#B7A6FF', fontFamily: 'inherit', fontSize: 14, cursor: 'pointer' }}>Editar minhas respostas</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
