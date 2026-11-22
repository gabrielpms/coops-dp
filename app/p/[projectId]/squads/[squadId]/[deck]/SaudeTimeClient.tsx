'use client';
import { AppHeader } from '@/components/ds/AppHeader';
import { OpenDeckBanner } from '@/components/ds/OpenDeckBanner';
import { BannerHeart, DimIcon } from '@/components/person/HealthIcons';
import { CoopsLink } from '@/components/nav/useCoopsRouter';
import { mono } from '@/components/ds/tokens';
import { HEALTH_DIMS } from '@/lib/validation';
import type { AvatarConfig } from '@/components/avatar/Avatar';

type Dim = 'saude' | 'design' | 'produto' | 'negocio';
type Pt = { cycle: string; n: number; avgs: Record<Dim, number> | null };
const TAG: Record<Dim, string> = { saude: 'BEM-ESTAR', design: 'CLAREZA', produto: 'CLAREZA', negocio: 'CLAREZA' };
const TIPS: Record<Dim, string> = {
  saude: 'A saúde média do time está baixa. Vale olhar a carga do squad antes do próximo ciclo.',
  design: 'A estratégia de design não está clara para o squad. Um ritual de alinhamento pode ajudar.',
  produto: 'O squad pede mais clareza sobre o produto. Combine com o PM um resumo das prioridades.',
  negocio: 'O squad não vê a conexão com as metas da empresa. Leve os OKRs para a próxima reunião.',
};
const fmt = (n: number) => (Math.round(n * 10) / 10).toFixed(1).replace('.', ',');
const q = (c: string) => c.split('-')[1] ?? c;

export function SaudeTimeClient({ user, projectId, squad, total, answers, enough, min, series }: {
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; projectId: string; squad: { id: string; name: string }; total: number; answers: number; enough: boolean; min: number; series: Pt[];
}) {
  const cur = series[series.length - 1] ?? null;
  const prev = [...series].slice(0, -1).reverse().find((p) => p.avgs) ?? null;
  const avgs = enough && cur?.avgs ? cur.avgs : null;
  const avg = avgs ? (avgs.saude + avgs.design + avgs.produto + avgs.negocio) / 4 : 0;
  const prevAvg = prev?.avgs ? (prev.avgs.saude + prev.avgs.design + prev.avgs.produto + prev.avgs.negocio) / 4 : null;
  const d = prevAvg !== null && avg ? avg - prevAvg : null;
  const bars = series.filter((p) => p.avgs).map((p) => ({ c: p.cycle, v: (p.avgs!.saude + p.avgs!.design + p.avgs!.produto + p.avgs!.negocio) / 4 }));
  const low = avgs ? HEALTH_DIMS.map((x) => ({ id: x.id as Dim, v: avgs[x.id as Dim] })).filter((x) => x.v <= 2.5).sort((a, b) => a.v - b.v)[0] ?? null : null;
  const back = `/p/${projectId}/squads/${squad.id}`;
  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <OpenDeckBanner bg="#A9D8F5" icon={<BannerHeart />} back={{ href: back, label: `${squad.name}` }} title="Saúde do time"
          desc="A média do que o squad respondeu no período. Ninguém aparece individualmente: as notas de cada pessoa ficam no deck dela."
          chip="Só a média do time, sem respostas individuais"
          tile={<><span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{answers}/{total}</span><span style={{ ...mono, fontSize: 10 }}>RESPONDERAM</span></>} />
        {!avgs ? (
          <div style={{ borderRadius: 22, border: '1.5px dashed #4A4858', padding: 28, maxWidth: 560 }}><b style={{ fontSize: 20 }}>Ainda poucas respostas</b><p style={{ margin: '8px 0 0', color: '#A3A1AD', lineHeight: 1.5 }}>Mostramos o agregado a partir de {min} respostas, para não identificar quem respondeu. Hoje são {answers} de {total}.</p></div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'flex-start' }}>
            <div style={{ flex: '999 1 560px', minWidth: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 18 }}>
                {HEALTH_DIMS.map((x) => {
                  const id = x.id as Dim, v = avgs[id], p = prev?.avgs?.[id] ?? null, diff = p !== null ? Math.round((v - p) * 10) / 10 : null;
                  const diffBg = diff === null ? '#A3A1AD' : diff === 0 ? '#F5F2EC' : diff > 0 ? '#8FE3C8' : '#FF8A5B';
                  return (
                    <article key={id} className="coops-card" aria-label={x.title} style={{ minHeight: 360, boxSizing: 'border-box', borderRadius: 24, background: '#A9D8F5', color: '#0E0E12', border: '2px solid #0E0E12', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ ...mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: '#A9D8F5', background: '#0E0E12', border: '1.5px solid #0E0E12', borderRadius: 999, padding: '4px 8px' }}>{TAG[id]}</span>
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 38, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' }}>{fmt(v)}</span><span style={{ ...mono, fontSize: 10 }}>MÉDIA DO TIME</span></span>
                      </div>
                      <span style={{ lineHeight: 0, alignSelf: 'flex-start' }}><DimIcon id={id} ink="#0E0E12" bg="#A9D8F5" /></span>
                      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.15 }}>{x.title}</span><span style={{ fontSize: 13, lineHeight: 1.45, opacity: 0.85 }}>{x.help}</span></div>
                      <div role="group" aria-label={`${x.title}: média ${fmt(v)} de 5`} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 5 }}>
                          {[1, 2, 3, 4, 5].map((k) => { const fill = Math.max(0, Math.min(1, v - (k - 1))); return <span key={k} aria-hidden="true" style={{ ...mono, fontSize: 13, fontWeight: 700, height: 40, borderRadius: 11, border: '2px solid #0E0E12', display: 'flex', alignItems: 'center', justifyContent: 'center', background: fill >= 1 ? '#0E0E12' : fill > 0 ? `linear-gradient(90deg, rgba(14,14,18,0.3) ${Math.round(fill * 100)}%, transparent ${Math.round(fill * 100)}%)` : 'transparent', color: fill >= 1 ? '#A9D8F5' : '#0E0E12' }}>{k}</span>; })}
                        </div>
                        <span style={{ display: 'flex', justifyContent: 'space-between', ...mono, fontSize: 10 }}><span>{x.lo.toUpperCase()}</span><span>{x.hi.toUpperCase()}</span></span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid #0E0E12', paddingTop: 10 }}>
                        <span style={{ fontSize: 13 }}>{prev ? q(prev.cycle) : 'Anterior'}: <strong>{p !== null ? fmt(p) : '—'}</strong></span>
                        <span style={{ ...mono, fontSize: 11, fontWeight: 700, background: diffBg, border: '1.5px solid #0E0E12', borderRadius: 6, padding: '3px 6px' }}>{diff === null ? '—' : diff === 0 ? '=' : `${diff > 0 ? '+' : '−'}${fmt(Math.abs(diff))}`}</span>
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
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 52, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' }}>{fmt(avg)}</span><span style={{ ...mono, fontSize: 11 }}>MÉDIA DO TIME / 5</span></span>
                </div>
                {bars.length > 0 && <div role="img" aria-label={`Média por ciclo: ${bars.map((b) => `${q(b.c)} ${fmt(b.v)}`).join(', ')}`} style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 52 }}>
                  {bars.map((b, i) => <span key={b.c} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}><span style={{ width: '100%', height: Math.round((b.v / 5) * 40), borderRadius: 4, background: i === bars.length - 1 ? '#0E0E12' : '#F5F2EC', border: '1.5px solid #0E0E12', boxSizing: 'border-box' }} /><span style={{ ...mono, fontSize: 9 }}>{q(b.c)}</span></span>)}
                </div>}
                <span style={{ fontSize: 14, borderTop: '1.5px solid #0E0E12', paddingTop: 10 }}>{d === null ? 'Sem ciclo anterior para comparar' : Math.abs(d) < 0.05 ? `Igual ao ${q(prev!.cycle)}` : `${d > 0 ? '+' : '−'}${fmt(Math.abs(d))} em relação ao ${q(prev!.cycle)}`} · 4 cartas</span>
              </div>
              {low && <div className="coops-pu" style={{ borderRadius: 18, background: '#17171D', border: '1px solid #2C2C36', padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <svg width="32" height="32" viewBox="0 0 100 100" aria-hidden="true" style={{ flex: 'none' }}><path d="M50 6 60 38 94 50 60 62 50 94 40 62 6 50 40 38z" fill="#8FE3C8" stroke="#0E0E12" strokeWidth="3" strokeLinejoin="round" /><circle cx="44" cy="48" r="3.5" fill="#0E0E12" /><circle cx="56" cy="48" r="3.5" fill="#0E0E12" /></svg>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ ...mono, fontSize: 11, color: '#8FE3C8' }}>AGENTE</span><span style={{ fontSize: 14, lineHeight: 1.45 }}>{TIPS[low.id]}</span></span>
              </div>}
              <div style={{ borderRadius: 18, background: '#17171D', border: '1px solid #2C2C36', padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ ...mono, fontSize: 11, color: '#A3A1AD' }}>RESPOSTAS DO CICLO</span><span style={{ fontSize: 15, lineHeight: 1.5 }}>{answers} de {total} {total === 1 ? 'pessoa respondeu' : 'pessoas responderam'}. O agregado aparece a partir de {min} respostas.</span></div>
              <CoopsLink href={back} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 52, color: '#0E0E12', background: '#B7A6FF', textDecoration: 'none', fontWeight: 600, fontSize: 16, borderRadius: 14 }}>Levar para a reunião do squad</CoopsLink>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
