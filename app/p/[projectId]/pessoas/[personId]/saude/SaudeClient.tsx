'use client';
import { useState } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import { OpenDeckBanner } from '@/components/ds/OpenDeckBanner';
import { Spinner } from '@/components/ds/ScreenLoader';
import { DiHeart } from '@/components/person/DeckIcons';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { label } from '@/components/ds/tokens';
import { cycleLabel, firstName } from '@/lib/format';
import { HEALTH_DIMS } from '@/lib/validation';
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

export function SaudeClient({ user, person, projectId, isOwn, history }: { user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; person: { id: string; name: string; avatar: AvatarConfig | null }; projectId: string; isOwn: boolean; history: H[] }) {
  const { refresh } = useCoopsRouter();
  const last = history[0] ?? null;
  const [v, setV] = useState<Record<Dim, number>>({ saude: 0, design: 0, produto: 0, negocio: 0 });
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const fn = firstName(person.name);
  const shown: Record<Dim, number> = isOwn ? v : last ? { saude: last.saude, design: last.design, produto: last.produto, negocio: last.negocio } : { saude: 0, design: 0, produto: 0, negocio: 0 };
  const answered = HEALTH_DIMS.every((d) => shown[d.id] > 0);
  const avg = answered ? avgOf(shown) : 0;
  const prev = isOwn ? last : history[1] ?? null;
  const lows = HEALTH_DIMS.filter((d) => shown[d.id] > 0 && shown[d.id] <= 2);
  const trend = [...history].reverse().map((h) => ({ c: h.cycle, v: avgOf(h) }));

  const send = async () => {
    if (!answered) { setErr('Responda as quatro perguntas para enviar.'); return; }
    setBusy(true); setErr(null);
    try {
      const r = await fetch(`/api/people/${person.id}/health`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...v, note }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error ?? 'Não deu para enviar. Tente de novo.'); return; }
      setSent(true); setV({ saude: 0, design: 0, produto: 0, negocio: 0 }); setNote(''); refresh();
    } catch { setErr('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <OpenDeckBanner bg="#A9D8F5" icon={<DiHeart />} avatar={{ ...DEFAULT_AVATAR_CFG, ...(person.avatar ?? {}) }} back={{ href: `/p/${projectId}/pessoas/${person.id}`, label: `← ${isOwn ? 'Meu perfil' : person.name}` }}
          title="Saúde" desc={isOwn ? 'Um check-in rápido: como você está e o quanto as estratégias estão claras. Só você e seu manager veem.' : `Check-in de ${fn}. Só ${fn} e o manager veem.`} />
        {!isOwn && !last && <p style={{ margin: 0, color: '#A3A1AD', fontSize: 16 }}>{fn} ainda não fez nenhum check-in de saúde.</p>}
        {(isOwn || last) && <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {HEALTH_DIMS.map((d) => {
              const val = shown[d.id], p = prev?.[d.id] ?? 0, diff = val && p ? val - p : null;
              return (
                <article key={d.id} aria-label={d.title} style={{ minHeight: 340, boxSizing: 'border-box', borderRadius: 22, background: '#A9D8F5', color: '#0E0E12', border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 16px 36px rgba(0,0,0,0.45)' }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><DiHeart /><span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}>{val || '—'}</span></span>
                  <span style={{ marginTop: 'auto', fontSize: 21, fontWeight: 600, lineHeight: 1.2 }}>{d.title}</span><span style={{ fontSize: 14, lineHeight: 1.4 }}>{d.help}</span>
                  <div role={isOwn ? 'radiogroup' : 'img'} aria-label={isOwn ? d.title : `${d.title}: ${val} de 5`} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
                    {[1, 2, 3, 4, 5].map((n) => { const st = { height: isOwn ? 44 : 28, borderRadius: 8, border: '2px solid #0E0E12', background: n <= val ? '#0E0E12' : 'transparent', padding: 0, cursor: isOwn ? 'pointer' : 'default' } as const; return isOwn ? <button key={n} type="button" role="radio" aria-checked={val === n} aria-label={`Nota ${n} de 5`} onClick={() => { setV({ ...v, [d.id]: n }); setSent(false); setErr(null); }} style={st} /> : <span key={n} style={st} />; })}
                  </div>
                  <span style={{ display: 'flex', justifyContent: 'space-between', ...label(10, '0') }}><span>{d.lo}</span><span>{d.hi}</span></span>
                  {p > 0 && <span style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 8, fontSize: 13 }}>{cycleLabel(prev!.cycle)}: {p}{diff !== null && diff !== 0 ? ` · ${diff > 0 ? '+' : ''}${diff}` : diff === 0 ? ' · igual' : ''}</span>}
                </article>
              );
            })}
          </div>
          <section aria-label="Resumo" style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', borderRadius: 22, background: '#17171D', border: '1px solid #2C2C36', padding: '20px 24px' }}>
            <span style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}>{answered ? fmt(avg) : '—'}</span><span style={label(11, '0')}>MÉDIA / 5</span></span>
            {trend.length > 0 && <div role="img" aria-label={`Média por ciclo: ${trend.map((t) => `${cycleLabel(t.c)} ${fmt(t.v)}`).join(', ')}`} style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 56 }}>{trend.map((t, i) => <span key={i} title={`${cycleLabel(t.c)}: ${fmt(t.v)}`} style={{ width: 18, height: Math.max(6, (t.v / 5) * 56), borderRadius: 4, background: i === trend.length - 1 ? '#B7A6FF' : '#4A4858' }} />)}</div>}
          </section>
          {lows.length > 0 && (
            <section aria-label="Sugestões do agente" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lows.map((d) => <div key={d.id} className="coops-pu" style={{ display: 'flex', gap: 12, alignItems: 'center', borderRadius: 16, border: '1.5px dashed #8FE3C8', padding: '12px 16px' }}><span style={{ ...label(10, '0.08em'), color: '#8FE3C8' }}>AGENTE</span><span style={{ fontSize: 15, lineHeight: 1.45 }}>{isOwn ? d.tip : MGR_TIPS[d.id](fn)}</span></div>)}
            </section>
          )}
          {isOwn && <section style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640 }}>
            <label htmlFor="sd-nota" style={{ fontSize: 15 }}>Quer contar algo para o manager? <span style={{ color: '#A3A1AD' }}>(opcional)</span></label>
            <textarea id="sd-nota" value={note} onChange={(e) => setNote(e.target.value)} style={{ fontFamily: 'inherit', fontSize: 16, color: '#F5F2EC', background: '#17171D', border: '1.5px solid #2C2C36', borderRadius: 12, padding: '12px 14px', minHeight: 100, resize: 'vertical', boxSizing: 'border-box', width: '100%' }} />
            {err && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{err}</span>}
            {sent && <span role="status" style={{ fontSize: 15, fontWeight: 600, color: '#8FE3C8' }}>Check-in enviado ✓</span>}
            <button type="button" disabled={busy} onClick={send} style={{ alignSelf: 'flex-start', fontFamily: 'inherit', fontWeight: 600, fontSize: 15, color: '#0E0E12', background: '#B7A6FF', border: 0, borderRadius: 14, minHeight: 48, padding: '0 22px', cursor: busy ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, opacity: busy ? 0.7 : 1 }}>{busy && <Spinner />}{busy ? 'Enviando…' : 'Enviar check-in de saúde'}</button>
          </section>}
          {!isOwn && last?.note && <div style={{ borderRadius: 16, background: '#17171D', border: '1px solid #2C2C36', padding: '14px 18px', maxWidth: 640 }}><span style={{ ...label(10), color: '#A3A1AD' }}>RECADO PARA O MANAGER</span><p style={{ margin: '6px 0 0', fontSize: 15, lineHeight: 1.5 }}>{last.note}</p></div>}
        </>}
      </div>
    </div>
  );
}
