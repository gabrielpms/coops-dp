'use client';
import { useEffect, useRef, useState } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import { OpenDeckBanner } from '@/components/ds/OpenDeckBanner';
import { Spinner } from '@/components/ds/ScreenLoader';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { label } from '@/components/ds/tokens';
import { cycleLabel, firstName } from '@/lib/format';
import { HEALTH_DIMS, currentCycle } from '@/lib/validation';
import type { AvatarConfig } from '@/components/avatar/Avatar';

type H = { id: string; cycle: string; saude: number; design: number; produto: number; negocio: number; note: string; at: string };
type Dim = 'saude' | 'design' | 'produto' | 'negocio';
const avgOf = (h: Pick<H, Dim>) => (h.saude + h.design + h.produto + h.negocio) / 4;
const fmt = (n: number) => n.toFixed(1).replace('.', ',');
const MGR_TIPS: Record<Dim, (fn: string) => string> = {
  saude: (fn) => `A saúde de ${fn} está baixa. Vale olhar a carga antes do próximo ciclo.`,
  design: (fn) => `A estratégia de design não está clara para ${fn}. Um ritual de alinhamento pode ajudar.`,
  produto: () => 'Combine com o PM um resumo das prioridades para o squad.',
  negocio: (fn) => `${fn} não vê a conexão com as metas da empresa. Leve os OKRs para o próximo 1:1.`,
};

const mono = "'JetBrains Mono', ui-monospace, monospace";
const TAG: Record<Dim, string> = { saude: 'BEM-ESTAR', design: 'CLAREZA', produto: 'CLAREZA', negocio: 'CLAREZA' };
const svgP = { width: 56, height: 56, viewBox: '0 0 64 64', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: 'shi', style: { overflow: 'visible' } } as const;

function DimIcon({ id, ink, bg }: { id: Dim; ink: string; bg: string }) {
  if (id === 'saude') return <svg {...svgP} stroke={ink}><path d="M6 58h52" /><g className="zs-b"><ellipse cx="32" cy="51" rx="18" ry="6" fill={bg} /><g className="zs-m"><ellipse cx="32" cy="39" rx="13" ry="5" fill={bg} /><g className="zs-t"><ellipse cx="32" cy="29" rx="8" ry="4" fill={bg} /></g></g></g><path className="zs-sp" d="M48 22l2-2M16 22l-2-2M32 18v-4" /></svg>;
  if (id === 'design') return <svg {...svgP} stroke={ink}><circle cx="32" cy="32" r="24" fill={bg} /><path d="M32 8v5M32 51v5M8 32h5M51 32h5" /><g className="sh-ndl"><path d="M32 16l5 16h-10z" fill={ink} /><path d="M27 32h10l-5 16z" fill={bg} /></g><circle cx="32" cy="32" r="2" fill={bg} /></svg>;
  if (id === 'produto') return <svg {...svgP} stroke={ink}><path className="sh-route" d="M10 52c10 0 12-16 22-16s10-16 20-16" /><circle className="sh-m sh-m1" cx="10" cy="52" r="4" fill={bg} /><circle className="sh-m sh-m2" cx="32" cy="36" r="4" fill={bg} /><path d="M52 20V4" /><path className="sh-flag" d="M52 5h10l-3 5 3 5H52z" fill={ink} /></svg>;
  return <svg {...svgP} stroke={ink}><g className="sh-pz1"><path d="M6 20h22v8a4 4 0 0 1 0 8v8H6z" fill={bg} /></g><g className="sh-pz2"><path d="M36 20h22v24H36v-8a4 4 0 0 0 0-8z" fill={bg} /></g><path className="sh-sp" d="M32 10v-5M24 13l-3-4M40 13l3-4M32 54v5" /></svg>;
}

const BannerHeart = () => <svg width="84" height="84" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ overflow: 'visible' }}><path className="ic-heart" d="M32 54S8 40 8 24a12 12 0 0 1 24-4 12 12 0 0 1 24 4c0 16-24 30-24 30z" /><path className="ic-ecg" d="M14 30h10l4-8 6 16 4-8h12" /></svg>;

export function SaudeClient({ user, person, projectId, isOwn, history, draft }: { draft: { v: Record<string, number>; note: string } | null; user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; person: { id: string; name: string; avatar: AvatarConfig | null }; projectId: string; isOwn: boolean; history: H[] }) {
  const { refresh } = useCoopsRouter();
  const cur = currentCycle();
  const last = history[0] ?? null;
  const [v, setV] = useState<Record<Dim, number>>(() => (draft ? { saude: draft.v.saude ?? 0, design: draft.v.design ?? 0, produto: draft.v.produto ?? 0, negocio: draft.v.negocio ?? 0 } : isOwn && last && last.cycle === cur ? { saude: last.saude, design: last.design, produto: last.produto, negocio: last.negocio } : { saude: 0, design: 0, produto: 0, negocio: 0 }));
  const [note, setNote] = useState(() => (draft ? draft.note : isOwn && last && last.cycle === cur ? last.note : ''));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(() => !draft && isOwn && !!last && last.cycle === cur);
  const dirty = useRef(false), timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Rascunho: cada nota/comentário é salvo no banco (debounce) até o envio.
  useEffect(() => {
    if (!isOwn || !dirty.current) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { fetch('/api/drafts', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ scope: 'health', entityId: person.id, payload: { form: { v, note } } }) }).catch(() => {}); }, 400);
    return () => clearTimeout(timer.current);
  }, [v, note, isOwn, person.id]);
  const fn = firstName(person.name);
  const shown: Record<Dim, number> = isOwn ? v : last ? { saude: last.saude, design: last.design, produto: last.produto, negocio: last.negocio } : { saude: 0, design: 0, produto: 0, negocio: 0 };
  const answered = HEALTH_DIMS.every((d) => shown[d.id] > 0);
  const rated = HEALTH_DIMS.filter((d) => shown[d.id] > 0);
  const avg = rated.length ? rated.reduce((a, d) => a + shown[d.id], 0) / rated.length : 0;
  // Ciclo anterior de comparação: o mais recente diferente do ciclo exibido.
  const baseCycle = isOwn ? cur : last?.cycle ?? cur;
  const prev = history.find((h) => h.cycle !== baseCycle) ?? null;
  const prevAvg = prev ? avgOf(prev) : null;
  const low = HEALTH_DIMS.find((d) => shown[d.id] > 0 && shown[d.id] <= 2) ?? null;

  // Barras: um valor por ciclo (o mais recente), ordem cronológica; o último é o atual.
  const byCycle = new Map<string, number>();
  for (const h of history) if (!byCycle.has(h.cycle) && (!isOwn || h.cycle !== cur)) byCycle.set(h.cycle, avgOf(h));
  const past = [...byCycle.entries()].reverse().slice(-3).map(([c, val]) => ({ c, val }));
  const bars = isOwn ? [...past, ...(avg ? [{ c: cur, val: avg }] : [])] : [...[...byCycle.entries()].reverse().slice(-4).map(([c, val]) => ({ c, val }))];
  const d = prevAvg !== null && avg ? avg - prevAvg : null;
  const trendTxt = (d === null ? 'Sem ciclo anterior para comparar' : Math.abs(d) < 0.05 ? `Igual ao ${prev!.cycle.split('-')[1]}` : `${d > 0 ? '+' : '−'}${fmt(Math.abs(d))} em relação ao ${prev!.cycle.split('-')[1]}`) + ` · ${rated.length} ${rated.length === 1 ? 'carta' : 'cartas'}`;

  const send = async () => {
    if (!answered) { setErr('Dê uma nota para as quatro cartas para enviar.'); return; }
    setBusy(true); setErr(null);
    try {
      const r = await fetch(`/api/people/${person.id}/health`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...v, note }) });
      const j = await r.json();
      if (!r.ok) { setErr(j.error ?? 'Não deu para enviar. Tente de novo.'); return; }
      dirty.current = false; clearTimeout(timer.current); await fetch(`/api/drafts?scope=health&entityId=${person.id}`, { method: 'DELETE' }).catch(() => {}); setSent(true); refresh();
    } catch { setErr('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <OpenDeckBanner bg="#A9D8F5" icon={<BannerHeart />} avatar={{ ...DEFAULT_AVATAR_CFG, ...(person.avatar ?? {}) }} avatarBg="#7FB8DD" avatarCrown avatarHref={`/p/${projectId}/pessoas/${person.id}`}
          back={{ href: `/p/${projectId}/pessoas/${person.id}`, label: `← ${isOwn ? 'Meu perfil' : person.name}` }}
          title={isOwn ? 'Check-in de saúde' : `Saúde de ${fn}`}
          desc={isOwn ? 'Dê sua nota de 1 a 5 em cada carta. Só você e seu manager veem as respostas.' : `O que ${fn} respondeu no período. Use como ponto de partida do próximo 1:1, não como avaliação.`}
          chip={isOwn ? 'Só você e seu manager veem' : `Só ${fn} e você veem`} />
        {!isOwn && !last ? <p style={{ margin: 0, color: '#A3A1AD', fontSize: 16 }}>{fn} ainda não fez nenhum check-in de saúde.</p> : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'flex-start' }}>
            <div style={{ flex: '999 1 560px', minWidth: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 18 }}>
                {HEALTH_DIMS.map((q) => {
                  const val = shown[q.id], on = val > 0, ink = on ? '#0E0E12' : '#F5F2EC', cardBg = on ? '#A9D8F5' : '#17171D';
                  const p = prev ? prev[q.id] : 0, diff = on && p ? val - p : null;
                  const diffBg = diff === null ? '#A3A1AD' : diff === 0 ? '#F5F2EC' : diff > 0 ? '#8FE3C8' : '#FF8A5B';
                  return (
                    <article key={q.id} className="coops-card" aria-label={q.title} style={{ minHeight: 360, boxSizing: 'border-box', borderRadius: 24, background: cardBg, color: '#0E0E12', border: on ? '2px solid #0E0E12' : '2px dashed #A9D8F5', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: on ? '#A9D8F5' : '#0E0E12', background: ink, border: `1.5px solid ${ink}`, borderRadius: 999, padding: '4px 8px' }}>{TAG[q.id]}</span>
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', color: ink }}><span style={{ fontSize: 38, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' }}>{on ? val : '—'}</span><span style={{ fontFamily: mono, fontSize: 10 }}>{isOwn ? 'SUA NOTA' : `NOTA DE ${fn.toUpperCase()}`}</span></span>
                      </div>
                      <span style={{ lineHeight: 0, alignSelf: 'flex-start' }}><DimIcon id={q.id} ink={ink} bg={cardBg} /></span>
                      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6, color: ink }}><span style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.15 }}>{q.title}</span><span style={{ fontSize: 13, lineHeight: 1.45, opacity: 0.85 }}>{q.help}</span></div>
                      <div role="group" aria-label={`Nota para ${q.title}`} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 5 }}>
                          {[1, 2, 3, 4, 5].map((n) => {
                            const filled = n <= val;
                            const st = { fontFamily: mono, fontSize: 13, fontWeight: 700, height: isOwn ? 44 : 40, borderRadius: 11, background: filled ? '#0E0E12' : 'transparent', color: filled ? '#A9D8F5' : ink, border: `2px solid ${on ? '#0E0E12' : '#4A4858'}`, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' } as const;
                            return isOwn
                              ? <button key={n} type="button" aria-label={`${q.title}: nota ${n}`} aria-pressed={val === n} onClick={() => { dirty.current = true; setV({ ...v, [q.id]: n }); setSent(false); setErr(null); }} style={{ ...st, cursor: 'pointer' }}>{n}</button>
                              : <span key={n} role="img" aria-label={`${q.title}: nota ${n}${val === n ? ' (resposta)' : ''}`} style={st}>{n}</span>;
                          })}
                        </div>
                        <span style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 10, color: ink }}><span>{q.lo.toUpperCase()}</span><span>{q.hi.toUpperCase()}</span></span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1.5px solid ${ink}`, paddingTop: 10, color: ink }}>
                        <span style={{ fontSize: 13 }}>{prev ? prev.cycle.split('-')[1] : 'Anterior'}: <strong>{p || '—'}</strong></span>
                        <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: '#0E0E12', background: diffBg, border: '1.5px solid #0E0E12', borderRadius: 6, padding: '3px 6px' }}>{diff === null ? '—' : diff === 0 ? '=' : diff > 0 ? `+${diff}` : String(diff)}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
            <aside style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="sh-avg" tabIndex={0} style={{ borderRadius: 26, background: '#A9D8F5', color: '#0E0E12', border: '2px solid #0E0E12', padding: 22, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '8px 8px 0 #4F8DB3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ overflow: 'visible' }}><path className="sh-hb" style={{ transformBox: 'fill-box' }} d="M32 54S8 40 8 24a12 12 0 0 1 24-4 12 12 0 0 1 24 4c0 16-24 30-24 30z" /><path className="sh-ecg" d="M14 30h10l4-8 6 16 4-8h12" /></svg>
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 52, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' }}>{avg ? fmt(avg) : '—'}</span><span style={{ fontFamily: mono, fontSize: 11 }}>MÉDIA / 5</span></span>
                </div>
                {bars.length > 0 && <div role="img" aria-label={`Média por ciclo: ${bars.map((b) => `${b.c.split('-')[1]} ${fmt(b.val)}`).join(', ')}`} style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 52 }}>
                  {bars.map((b, i) => <span key={b.c} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}><span style={{ width: '100%', height: Math.round((b.val / 5) * 40), borderRadius: 4, background: i === bars.length - 1 ? '#0E0E12' : '#F5F2EC', border: '1.5px solid #0E0E12', boxSizing: 'border-box' }} /><span style={{ fontFamily: mono, fontSize: 9 }}>{b.c.split('-')[1]}</span></span>)}
                </div>}
                <span style={{ fontSize: 14, borderTop: '1.5px solid #0E0E12', paddingTop: 10 }}>{avg ? trendTxt : 'Dê uma nota para ver a média'}</span>
              </div>
              {low && <div className="coops-pu" style={{ borderRadius: 18, background: '#17171D', border: '1px solid #2C2C36', padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <svg width="32" height="32" viewBox="0 0 100 100" aria-hidden="true" style={{ flex: 'none' }}><path d="M50 6 60 38 94 50 60 62 50 94 40 62 6 50 40 38z" fill="#8FE3C8" stroke="#0E0E12" strokeWidth="3" strokeLinejoin="round" /><circle cx="44" cy="48" r="3.5" fill="#0E0E12" /><circle cx="56" cy="48" r="3.5" fill="#0E0E12" /></svg>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontFamily: mono, fontSize: 11, color: '#8FE3C8' }}>AGENTE</span><span style={{ fontSize: 14, lineHeight: 1.45 }}>{isOwn ? low.tip : MGR_TIPS[low.id](fn)}</span></span>
              </div>}
              {isOwn ? <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label htmlFor="sd-nota" style={{ fontSize: 14, color: '#A3A1AD' }}>Quer contar algo para o manager? (opcional)</label>
                  <textarea id="sd-nota" rows={4} value={note} onChange={(e) => { dirty.current = true; setNote(e.target.value); setSent(false); }} placeholder="Como foram as últimas semanas" style={{ fontFamily: 'inherit', fontSize: 16, lineHeight: 1.5, color: '#F5F2EC', background: '#17171D', border: '1.5px solid #2C2C36', borderRadius: 12, padding: '12px 14px', resize: 'vertical', boxSizing: 'border-box', width: '100%' }} />
                </div>
                {err && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{err}</span>}
                <button type="button" disabled={busy} onClick={send} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 52, color: '#0E0E12', background: sent ? '#F5F2EC' : '#B7A6FF', border: 0, fontFamily: 'inherit', fontWeight: 600, fontSize: 16, borderRadius: 14, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1 }}>{busy && <Spinner />}{busy ? 'Enviando…' : sent ? 'Check-in enviado ✓' : 'Enviar check-in de saúde'}</button>
              </> : <>
                {last?.note && <div style={{ borderRadius: 18, background: '#17171D', border: '1px solid #2C2C36', padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ fontFamily: mono, fontSize: 11, color: '#A3A1AD' }}>COMENTÁRIO DE {fn.toUpperCase()}</span><span style={{ fontSize: 15, lineHeight: 1.5 }}>“{last.note}”</span></div>}
                <a href={`/p/${projectId}/pessoas/${person.id}/eventos`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 52, color: '#0E0E12', background: '#B7A6FF', textDecoration: 'none', fontWeight: 600, fontSize: 16, borderRadius: 14 }}>Levar para o próximo 1:1</a>
              </>}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
