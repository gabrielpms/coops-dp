'use client';
import { useState, type ReactNode } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import { CoopsLink } from '@/components/nav/useCoopsRouter';
import { ProjectDeck, type ProjectForm } from '@/components/wizard/ProjectDeck';
import { label, segmentIcon } from '@/components/ds/tokens';

type P = { id: string; name: string; segment: string; tagline: string; strategy: string; indicators: string[]; competitors: string[]; links: string[]; skills: string[]; invites: { name: string; email: string; position: 'IC' | 'MANAGER' }[]; counts: { squads: number; people: number; initiatives: number }; pendingInvites: number };

const STEPS = ['Conta criada', 'Primeiro projeto', 'Time e iniciativas'];
const SUBS = ['Seu perfil já existe', 'Empresa, skills e convites', 'Squads, pessoas e a primeira demanda'];

function Steps({ now }: { now: 2 | 3 }) {
  return (
    <div role="list" aria-label="Seu começo" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {STEPS.map((t, i) => {
        const n = i + 1, state = n < now ? 'done' : n === now ? 'now' : 'later';
        const bg = state === 'done' ? '#8FE3C8' : state === 'now' ? '#B7A6FF' : 'transparent';
        return (
          <div role="listitem" key={t} style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 14, borderRadius: 18, background: bg, color: state === 'later' ? '#A3A1AD' : '#0E0E12', border: state === 'later' ? '2px dashed #4A4858' : '2px solid #0E0E12', padding: '14px 16px' }}>
            <span style={{ flex: 'none', width: 40, height: 40, borderRadius: 12, border: `2px solid ${state === 'later' ? '#4A4858' : '#0E0E12'}`, background: state === 'later' ? 'transparent' : '#F5F2EC', color: state === 'later' ? '#A3A1AD' : '#0E0E12', display: 'flex', alignItems: 'center', justifyContent: 'center', ...label(13, '0'), fontWeight: 700 }}>{n}</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}><b style={{ fontSize: 16 }}>{t}</b><span style={{ fontSize: 13 }}>{SUBS[i]}</span></span>
            <span style={{ flex: 'none', ...label(10, '0.06em'), fontWeight: 700, border: `1.5px solid ${state === 'later' ? '#4A4858' : '#0E0E12'}`, borderRadius: 999, padding: '3px 8px', background: state === 'done' ? '#F5F2EC' : 'transparent' }}>{state === 'done' ? 'FEITO ✓' : state === 'now' ? 'AGORA' : 'DEPOIS'}</span>
          </div>
        );
      })}
    </div>
  );
}

const Intro = ({ step, title, sub }: { step: number; title: string; sub: ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 760 }}>
    <span style={{ ...label(12, '0.1em'), color: '#B7A6FF' }}>PRIMEIRO ACESSO · PASSO {step} DE 3</span>
    <h1 style={{ margin: 0, fontSize: 52, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.02 }}>{title}</h1>
    <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5, color: '#A3A1AD' }}>{sub}</p>
  </div>
);

const toForm = (p: P): ProjectForm => ({ name: p.name, segment: p.segment, tagline: p.tagline, strategy: p.strategy, indicators: p.indicators, competitors: p.competitors, links: p.links, skills: p.skills, invites: p.invites.filter((i) => true).map(({ name, email, position }) => ({ name, email, position })) });

export function PrimeiroAcessoClient({ user, project: initial }: { user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: any }; project: P | null }) {
  const [project, setProject] = useState<P | null>(initial);
  const [deck, setDeck] = useState<'create' | 'edit' | null>(null);
  const first = user.name.split(' ')[0];
  const close = () => setDeck(null);

  const cardLink = { flex: '0 1 290px', height: 330, boxSizing: 'border-box', textDecoration: 'none', borderRadius: 22, color: '#0E0E12', border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 16px 36px rgba(0,0,0,0.45)' } as const;
  const big = (n: number, l: string) => <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' }}>{n}</span><span style={label(11, '0')}>{l}</span></span>;
  const ico = (d: ReactNode, cls = 'fa-ic') => <svg className={cls} width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ overflow: 'visible' }}><g className="fa-a">{d}</g></svg>;

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 56px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
        <AppHeader {...user} />
        {!project ? (
          <div className="fa-in" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <Intro step={2} title={`Boas-vindas, ${first}.`} sub="Sua conta está pronta. Agora crie o primeiro projeto: a empresa onde você vai cuidar do time e das iniciativas de design." />
            <Steps now={2} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'stretch' }}>
              <button type="button" className="hb-add fa-start" onClick={() => setDeck('create')} style={{ flex: '0 1 380px', minHeight: 380, textAlign: 'left', cursor: 'pointer', boxSizing: 'border-box', borderRadius: 26, background: '#B7A6FF', color: '#0E0E12', border: '2px solid #0E0E12', padding: 26, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 0 0 3px #0E0E12, 0 0 0 6px #B7A6FF, 0 24px 50px rgba(0,0,0,0.5)' }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {ico(<><rect x="12" y="20" width="40" height="36" rx="3" /><path d="M24 20v-8h16v8M12 34h40M28 34v6h8v-6" /></>)}
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 52, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' }}>07</span><span style={label(11, '0')}>CARTAS · ~5 MIN</span></span>
                </span>
                <span style={{ marginTop: 'auto', ...label(11, '0.08em') }}>DECK DE PERGUNTAS</span>
                <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.08 }}>Criar o primeiro projeto</span>
                <span style={{ fontSize: 14, lineHeight: 1.45 }}>Uma pergunta por carta. Você pode pular o que for opcional e completar depois.</span>
                <span style={{ fontWeight: 600, fontSize: 15 }}>Começar <span className="fa-arrow">→</span></span>
              </button>
              <div style={{ flex: '1 1 320px', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 6 }}>
                <span style={{ ...label(11, '0.08em'), color: '#A3A1AD' }}>O QUE VOCÊ VAI CONFIGURAR</span>
                <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {[['Empresa e segmento', true], ['Estratégia'], ['Indicadores-chave'], ['Concorrentes e referências'], ['Skills do time', true], ['Convites'], ['Resumo']].map(([t, req], i) => (
                    <li key={String(t)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid #2C2C36' }}>
                      <span style={{ ...label(11, '0'), color: '#B7A6FF' }}>{String(i + 1).padStart(2, '0')}</span><span style={{ flex: 1, fontSize: 15 }}>{t}</span>
                      {req && <span style={{ ...label(9.5), color: '#A3A1AD' }}>OBRIGATÓRIO</span>}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <div className="fa-in" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <Intro step={3} title="Projeto criado. Bora pro time?" sub={project.pendingInvites ? `${project.name} está no ar e ${project.pendingInvites} ${project.pendingInvites === 1 ? 'convite foi enviado' : 'convites foram enviados'}. Agora monte os squads.` : `${project.name} está no ar. Monte os squads e chame o time quando quiser.`} />
            <Steps now={3} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end' }}>
              <div className="fa-pop" style={{ flex: '0 1 360px', position: 'relative', padding: '14px 18px 0 0' }}>
                <div aria-hidden="true" style={{ position: 'absolute', left: 18, top: 0, right: 0, bottom: 18, borderRadius: 26, background: '#4B36B0', border: '2px solid #0E0E12', transform: 'rotate(3deg)' }} />
                <div aria-hidden="true" style={{ position: 'absolute', left: 9, top: 7, right: 9, bottom: 9, borderRadius: 26, background: '#8B74F2', border: '2px solid #0E0E12', transform: 'rotate(1.5deg)' }} />
                <article style={{ position: 'relative', height: 330, boxSizing: 'border-box', borderRadius: 26, background: '#B7A6FF', color: '#0E0E12', border: '2px solid #0E0E12', padding: 24, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 20px 40px rgba(0,0,0,0.45)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {ico(<path d={segmentIcon(project.segment)} />)}
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}><span style={label(11, '0')}>{project.segment.toUpperCase()}</span><span style={{ ...label(10, '0'), background: '#F5F2EC', border: '1.5px solid #0E0E12', borderRadius: 999, padding: '2px 8px' }}>PROJETO CRIADO ✓</span></span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em' }}>{project.name}</h2><span style={{ fontSize: 14 }}>{project.tagline || 'Projeto novo'}</span></div>
                  <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, borderTop: '1.5px solid #0E0E12', paddingTop: 12 }}>
                    {[[project.indicators.length, 'indicadores'], [project.skills.length, 'skills'], [project.pendingInvites, 'convites']].map(([v, l]) => <span key={String(l)} style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 26, fontWeight: 600 }}>{v}</span><span style={{ fontSize: 12 }}>{l}</span></span>)}
                  </div>
                </article>
              </div>
              <CoopsLink href={`/p/${project.id}/time`} className="coops-card fa-next" style={{ ...cardLink, background: '#A9D8F5' }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {ico(<><circle cx="22" cy="20" r="7" /><circle cx="44" cy="22" r="6" /><path d="M8 50c1-10 7-15 14-15s13 5 14 15M34 50c1-8 5-12 10-12s9 4 10 12" /></>)}
                  {big(project.pendingInvites, project.pendingInvites === 1 ? 'CONVITE' : 'CONVITES')}
                </span>
                <span style={{ marginTop: 'auto', ...label(11, '0.08em') }}>GESTÃO DE TIME</span>
                <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>Montar squads e chamar o time</span>
                <span style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 10, fontSize: 13 }}>{project.pendingInvites ? 'Convites a caminho' : 'Squads e pessoas'}</span>
              </CoopsLink>
              <CoopsLink href={`/p/${project.id}/iniciativas`} className="coops-card fa-next" style={{ ...cardLink, background: '#8FE3C8' }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {ico(<path className="fa-flag" d="M18 56V10M18 12h30l-6 10 6 10H18" />)}
                  {big(0, 'INICIATIVAS')}
                </span>
                <span style={{ marginTop: 'auto', ...label(11, '0.08em') }}>INICIATIVAS COM AGENTE</span>
                <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>Abrir a primeira iniciativa</span>
                <span style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 10, fontSize: 13 }}>Descreva a demanda; o agente joga junto</span>
              </CoopsLink>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <CoopsLink href="/hub" className="hb-new" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 48, padding: '0 18px', borderRadius: 14, border: '1.5px solid #4A4858', color: '#F5F2EC', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
                <svg width="20" height="20" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="10" y="12" width="20" height="18" rx="3" /><rect x="34" y="12" width="20" height="18" rx="3" /><rect x="10" y="34" width="20" height="18" rx="3" /><rect x="34" y="34" width="20" height="18" rx="3" /></svg>
                Ir para o hub de projetos
              </CoopsLink>
              <button type="button" onClick={() => setDeck('edit')} style={{ minHeight: 48, padding: '0 18px', borderRadius: 14, border: 0, background: 'transparent', color: '#B7A6FF', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Ajustar o projeto</button>
            </div>
          </div>
        )}
      </div>
      {deck === 'create' && <ProjectDeck mode="create" title="Seu primeiro projeto" onClose={close} onSaved={(p) => { setProject(p); close(); window.scrollTo({ top: 0 }); }} />}
      {deck === 'edit' && project && <ProjectDeck mode="edit" projectId={project.id} initial={toForm(project)} onClose={close} onSaved={(p) => { setProject(p); close(); }} />}
    </div>
  );
}
