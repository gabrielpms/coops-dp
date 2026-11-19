'use client';
import { useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import { AdminCard } from '@/components/admin/AdminBanner';
import { IconBars, IconBino, IconCycle, IconDeck } from '@/components/admin/Icons';
import { FocusCard, FocusClose } from '@/components/ds/FocusCard';
import { CoopsLink } from '@/components/nav/useCoopsRouter';
import type { AvatarConfig } from '@/components/avatar/Avatar';
import { label } from '@/components/ds/tokens';
import { MOMENTS } from '@/lib/tools';
import type { Resultados } from '@/lib/agent/schemas';

type Key = 'resumo' | 'heuristica' | 'metricas' | 'estrategia';
const SEV: Record<string, [string, string]> = { CRITICO: ['CRÍTICO', '#FF8A5B'], ALTO: ['ALTO', '#F3D36B'], MEDIO: ['MÉDIO', '#F5F2EC'], BAIXO: ['BAIXO', '#8FE3C8'] };
const LVL: Record<string, string> = { ALTO: 'Alto', MEDIO: 'Médio', BAIXO: 'Baixo' };
const FRENTE: Record<string, string> = { heuristica: 'Heurística', metricas: 'Métricas', estrategia: 'Estratégia' };
const CAMADA: Record<string, string> = { NEGOCIO: 'Negócio', PRODUTO: 'Produto', EXPERIENCIA: 'Experiência' };
const PLAUS: Record<string, string> = { PROVAVEL: 'Provável', PLAUSIVEL: 'Plausível', POSSIVEL: 'Possível', SURPRESA: 'Surpresa' };
const OWNER: Record<string, string> = { DESIGN: 'Design', PRODUTO: 'Produto', DADOS: 'Dados', ENGENHARIA: 'Engenharia' };

const Pill = ({ children, bg = 'transparent', fg = '#0E0E12' }: { children: ReactNode; bg?: string; fg?: string }) => <span style={{ ...label(10, '0.06em'), background: bg, color: fg, border: '1.5px solid #0E0E12', borderRadius: 999, padding: '2px 8px', whiteSpace: 'nowrap' }}>{children}</span>;
const Sec = ({ title, children }: { title: string; children: ReactNode }) => <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><span style={label(11, '0.08em')}>{title}</span>{children}</section>;
const Item = ({ children }: { children: ReactNode }) => <div style={{ borderRadius: 12, background: 'rgba(245,242,236,0.6)', border: '1.5px solid #0E0E12', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, lineHeight: 1.45 }}>{children}</div>;
const Bullets = ({ items }: { items: string[] }) => <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, lineHeight: 1.45 }}>{items.map((t, i) => <li key={i}>{t}</li>)}</ul>;

export function AnaliseClient({ user, projectId, initiative, results, when, model }: {
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; projectId: string; initiative: { id: string; product: string }; results: Resultados; when: string; model: string;
}) {
  const [focus, setFocus] = useState<{ key: Key; rect: DOMRect | null } | null>(null);
  const lastEl = useRef<HTMLElement | null>(null);
  const c = results.consolidar, h = results.heuristica, m = results.metricas, e = results.estrategia;
  const open = (key: Key) => (ev: MouseEvent<HTMLElement>) => { lastEl.current = ev.currentTarget; setFocus({ key, rect: ev.currentTarget.getBoundingClientRect() }); };
  const close = () => { setFocus(null); lastEl.current?.focus?.(); };
  const back = `/p/${projectId}/iniciativas/${initiative.id}/mesa`;
  const empty = (txt: string) => <div style={{ height: 340, boxSizing: 'border-box', borderRadius: 22, border: '1.5px dashed #4A4858', color: '#A3A1AD', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, fontSize: 14 }}>{txt}</div>;
  const date = new Date(when).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  const body: Record<Key, { bg: string; title: string; kicker: string; node: ReactNode }> = {
    resumo: { bg: '#B7A6FF', title: 'Resumo e prioridades', kicker: 'RESUMO', node: c && (<>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{c.resumo}</p>
      {c.maiorRisco && <Sec title="MAIOR RISCO"><span style={{ fontSize: 14, lineHeight: 1.45 }}>{c.maiorRisco}</span></Sec>}
      {c.recomendacao && <Sec title="RECOMENDAÇÃO PRINCIPAL"><span style={{ fontSize: 14, lineHeight: 1.45 }}>{c.recomendacao}</span></Sec>}
      {c.prioridades.length > 0 && <Sec title="PRIORIDADES CRUZADAS">{c.prioridades.map((p, i) => <Item key={i}><b>{p.item}</b><span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{p.frentes.map((f) => <Pill key={f}>{FRENTE[f]}</Pill>)}<Pill bg="#0E0E12" fg="#F5F2EC">IMPACTO {LVL[p.impacto].toUpperCase()}</Pill><Pill>ESFORÇO {LVL[p.esforco].toUpperCase()}</Pill>{p.tela && <Pill>{p.tela.toUpperCase()}</Pill>}</span></Item>)}</Sec>}
      {c.proximosPassos.length > 0 && <Sec title="PRÓXIMOS PASSOS">{c.proximosPassos.map((p, i) => <Item key={i}><span>{p.acao}</span><span><Pill>{OWNER[p.dono].toUpperCase()}</Pill></span></Item>)}</Sec>}
    </>) },
    heuristica: { bg: '#F3D36B', title: 'Heurística de usabilidade', kicker: 'HEURÍSTICA', node: h && (<>
      <Sec title={`SCORE ${h.score}/100`}><span style={{ fontSize: 15, lineHeight: 1.5 }}>{h.resumo}</span></Sec>
      <Sec title={`ACHADOS · ${h.achados.length}`}>{h.achados.map((a, i) => <Item key={i}><span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}><Pill bg={SEV[a.severidade][1]}>{SEV[a.severidade][0]}</Pill>{a.tela && <Pill>{a.tela.toUpperCase()}</Pill>}{a.principio && <Pill>{a.principio.toUpperCase()}</Pill>}</span><b>{a.titulo}</b><span>{a.descricao}</span>{a.recomendacao && <span><b>Recomendação: </b>{a.recomendacao}</span>}</Item>)}</Sec>
    </>) },
    metricas: { bg: '#8FE3C8', title: 'Métricas e tagueamento', kicker: 'MÉTRICAS', node: m && (<>
      <Sec title={m.confirmada ? 'CORE ACTION' : 'CORE ACTION · A CONFIRMAR'}><span style={{ fontSize: 15, lineHeight: 1.5 }}>{m.coreAction}</span></Sec>
      {(['NEGOCIO', 'PRODUTO', 'EXPERIENCIA'] as const).map((k) => { const l = m.pontos.filter((p) => p.camada === k); return l.length ? <Sec key={k} title={`CAMADA ${CAMADA[k].toUpperCase()} · ${l.length}`}>{l.map((p, i) => <Item key={i}><span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{p.tela && <Pill>{p.tela.toUpperCase()}</Pill>}</span><b>{p.evento}</b>{p.porque && <span>{p.porque}</span>}</Item>)}</Sec> : null; })}
      {m.lacunas.length > 0 && <Sec title="LACUNAS DE DESIGN"><Bullets items={m.lacunas} /></Sec>}
    </>) },
    estrategia: { bg: '#F5A9D6', title: 'Leitura estratégica', kicker: 'ESTRATÉGIA', node: e && (<>
      <Sec title={`MATURIDADE ${e.score}/100 · PROBLEMA ${e.problema.veredito}`}><span style={{ fontSize: 15, lineHeight: 1.5 }}>{e.problema.justificativa}</span></Sec>
      {e.gaps.length > 0 && <Sec title="GAPS DA SOLUÇÃO">{e.gaps.map((g, i) => <Item key={i}><span><Pill bg={SEV[g.severidade][1]}>{SEV[g.severidade][0]}</Pill></span><b>{g.titulo}</b><span>{g.descricao}</span></Item>)}</Sec>}
      {e.cenarios.length > 0 && <Sec title="CENÁRIOS NEGATIVOS">{e.cenarios.map((s, i) => <Item key={i}><span><Pill>{PLAUS[s.plausibilidade].toUpperCase()}</Pill></span><b>{s.titulo}</b>{s.sinalAlerta && <span><b>Sinal de alerta: </b>{s.sinalAlerta}</span>}{s.mitigacao && <span><b>Mitigação: </b>{s.mitigacao}</span>}</Item>)}</Sec>}
      {(e.horizontes.h1 || e.horizontes.h2 || e.horizontes.h3) && <Sec title="HORIZONTES">{([['H1 · AGORA', e.horizontes.h1], ['H2 · MÉDIO PRAZO', e.horizontes.h2], ['H3 · LONGO PRAZO', e.horizontes.h3]] as const).filter(([, t]) => t).map(([k, t]) => <Item key={k}><b>{k}</b><span>{t}</span></Item>)}</Sec>}
      {(e.dicas.quick.length > 0 || e.dicas.estruturantes.length > 0) && <Sec title="DICAS">{e.dicas.quick.length > 0 && <><b style={{ fontSize: 13 }}>Quick wins</b><Bullets items={e.dicas.quick} /></>}{e.dicas.estruturantes.length > 0 && <><b style={{ fontSize: 13 }}>Estruturantes</b><Bullets items={e.dicas.estruturantes} /></>}</Sec>}
      {e.provocacoes.length > 0 && <Sec title="PROVOCAÇÕES"><Bullets items={e.provocacoes} /></Sec>}
    </>) },
  };
  const cur = focus ? body[focus.key] : null;

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <CoopsLink href={back} style={{ fontSize: 14, minHeight: 44, display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start' }}>← Mesa da iniciativa</CoopsLink>
        <section aria-label="Parecer do agente" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ ...label(12, '0.1em'), color: '#8FE3C8' }}>{initiative.product.toUpperCase()} · ANÁLISE DO AGENTE</span>
          <h1 style={{ margin: 0, fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05 }}>Parecer da iniciativa</h1>
          {c && <p style={{ margin: 0, maxWidth: 760, fontSize: 17, lineHeight: 1.5 }}>{c.resumo}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {c?.scoreUsabilidade != null && <span style={{ fontSize: 14, fontWeight: 600, color: '#0E0E12', background: '#F3D36B', borderRadius: 999, padding: '8px 14px' }}>Usabilidade {c.scoreUsabilidade}/100</span>}
            {c?.scoreEstrategico != null && <span style={{ fontSize: 14, fontWeight: 600, color: '#0E0E12', background: '#F5A9D6', borderRadius: 999, padding: '8px 14px' }}>Maturidade estratégica {c.scoreEstrategico}/100</span>}
            {c?.coreAction && <span style={{ fontSize: 14, fontWeight: 600, color: '#F5F2EC', border: '1.5px solid #4A4858', borderRadius: 999, padding: '7px 14px' }}>Core action: {c.coreAction}</span>}
            {c && <span style={{ fontSize: 14, fontWeight: 600, color: '#0E0E12', background: '#8FE3C8', borderRadius: 999, padding: '8px 14px' }}>Momento {c.momento} · {MOMENTS[c.momento]}</span>}
          </div>
          {results.rotear?.suposicoes?.length ? <p style={{ margin: 0, fontSize: 13, color: '#A3A1AD', maxWidth: 760 }}>Suposições do agente: {results.rotear.suposicoes.join(' · ')}</p> : null}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <CoopsLink href={`/p/${projectId}/iniciativas/${initiative.id}/momento`} style={{ fontWeight: 600, fontSize: 15, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Ver ferramentas do momento →</CoopsLink>
            <span style={{ fontSize: 13, color: '#A3A1AD' }}>Gerada em {date}{model ? ` · ${model}` : ''}</span>
          </div>
        </section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {c && <AdminCard bg="#B7A6FF" icon={<IconDeck bg="#B7A6FF" />} big={String(c.prioridades.length).padStart(2, '0')} bigLabel={c.prioridades.length === 1 ? 'PRIORIDADE' : 'PRIORIDADES'} kicker="PARECER" title="Resumo e prioridades" foot={c.recomendacao || c.maiorRisco || 'Próximos passos e maior risco'} aria="Abrir o resumo e as prioridades" onClick={open('resumo')} />}
          {h ? <AdminCard bg="#F3D36B" icon={<IconBino bg="#F3D36B" />} big={String(h.score)} bigLabel="SCORE" kicker="HEURÍSTICA" title="Usabilidade" foot={`${h.achados.length} ${h.achados.length === 1 ? 'achado' : 'achados'} · ${h.resumo}`} aria="Abrir a heurística de usabilidade" onClick={open('heuristica')} /> : empty('Heurística não analisada: não havia telas anexadas.')}
          {m ? <AdminCard bg="#8FE3C8" icon={<IconBars />} big={String(m.pontos.length).padStart(2, '0')} bigLabel="PONTOS" kicker="MÉTRICAS" title="Tagueamento" foot={`Core action: ${m.coreAction}`} aria="Abrir as métricas e o tagueamento" onClick={open('metricas')} /> : empty('Métricas não analisadas: não havia telas anexadas.')}
          {e ? <AdminCard bg="#F5A9D6" icon={<IconCycle bg="#F5A9D6" />} big={String(e.score)} bigLabel="MATURIDADE" kicker="ESTRATÉGIA" title="Leitura estratégica" foot={`Problema ${e.problema.veredito.toLowerCase()} · ${e.problema.justificativa}`} aria="Abrir a leitura estratégica" onClick={open('estrategia')} /> : empty('Estratégia não analisada.')}
        </div>
      </div>
      {cur && focus && (
        <FocusCard origin={focus.rect} bg={cur.bg} ariaLabel={cur.title} onClose={close}>
          <div className="coops-fx-body" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <span style={label(11, '0.08em')}>ANÁLISE DO AGENTE › {cur.kicker}</span>
              <FocusClose onClick={close} />
            </div>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{cur.title}</h2>
            {cur.node}
          </div>
        </FocusCard>
      )}
    </div>
  );
}
