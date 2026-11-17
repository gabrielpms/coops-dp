import { Avatar, BGS, HAIRS, SHIRTS, SKINS } from '@/components/avatar/Avatar';
import { label, mono, chipStyle } from '@/components/ds/tokens';
import { OpenDeckBanner } from '@/components/ds/OpenDeckBanner';
import { DsDemos } from './DsDemos';
import { BannerBrain, BannerDelivery, BannerEvents, BannerJourney, BannerStar, DeliveryCardIcon } from '@/components/person/BannerIcons';
import { BannerHeart, DimIcon } from '@/components/person/HealthIcons';
import { StudyTypeIcon } from '@/components/person/StudyTypeIcon';
import { EventTypeIcon } from '@/components/person/EventTypeIcon';
import { JourneyCardIcon } from '@/components/person/JourneyCardIcon';
import { AgentCardIcon, type AgentKind } from '@/components/initiative/AgentIcons';
import { EmptyDeckCard } from '@/components/person/EmptyDeckCard';
import { TOOL_ICON_PARTS } from '@/lib/toolIcons';
import { ICP } from '@/components/squad/deckIcons';

const COLORS: [string, string][] = [['lilac-100', '#EEE9FF'], ['lilac-200', '#D9CFFF'], ['lilac-300', '#B7A6FF'], ['lilac-500', '#8B74F2'], ['lilac-700', '#4B36B0'], ['ink-900', '#0E0E12'], ['ink-800', '#17171D'], ['ink-700', '#212129'], ['ink-600', '#2C2C36'], ['ink-400', '#4A4858'], ['ink-300', '#A3A1AD'], ['paper', '#F5F2EC'], ['skills', '#F3D36B'], ['brain gym', '#F5A9D6'], ['jornada', '#FF8A5B'], ['agente', '#8FE3C8'], ['saúde', '#A9D8F5'], ['alavancas', '#C9F0B8']];


const Sec = ({ t, d, children }: { t: string; d?: string; children: React.ReactNode }) => <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}><div><h2 style={{ margin: 0, fontSize: 28 }}>{t}</h2>{d && <p style={{ margin: '4px 0 0', color: '#A3A1AD', fontSize: 15 }}>{d}</p>}</div>{children}</section>;
const Cell = ({ bg, name, children }: { bg: string; name: string; children: React.ReactNode }) => <div className="coops-card" tabIndex={0} style={{ width: 150, boxSizing: 'border-box', borderRadius: 20, background: bg, color: '#0E0E12', border: '2px solid #0E0E12', padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>{children}<span style={{ ...mono, fontSize: 10 }}>{name}</span></div>;
const row = { display: 'flex', flexWrap: 'wrap', gap: 16 } as const;

// Página interna de conferência visual do DS (PRD §4): reúne os componentes reais do app. Passe o mouse ou foque para ver as micro-interações.
export default function DS() {
  if (process.env.NODE_ENV === 'production') return null;
  const toolKinds = Object.keys(TOOL_ICON_PARTS);
  const agentKinds: AgentKind[] = ['prod', 'prob', 'nec', 'ask', 'ctx'];
  const study = ['LIVRO', 'VIDEO', 'ARTIGO', 'CURSO', 'PODCAST', 'LINK'] as const;
  const events = ['CHECKIN', 'FEEDBACK', 'PROMOCAO', 'MERITO', 'MUDANCA_TIME', 'ENTREGA'] as const;
  return (
    <main style={{ maxWidth: 1216, margin: '0 auto', padding: '48px 32px 96px', display: 'flex', flexDirection: 'column', gap: 48 }}>
      <h1 style={{ margin: 0, fontSize: 64, fontWeight: 800, letterSpacing: '-0.035em' }}>Design System</h1>
      <Sec t="Cores"><div style={row}>{COLORS.map(([n, c]) => <div key={n} style={{ width: 120 }}><div style={{ height: 64, borderRadius: 14, background: c, border: '2px solid #2C2C36' }} /><span style={label(11, '0')}>{n}<br />{c}</span></div>)}</div></Sec>
      <Sec t="Tipografia" d="Schibsted Grotesk para texto; JetBrains Mono para rótulos e números pequenos."><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1 }}>Título 52 · 800</span><span style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.025em' }}>Título de carta 34</span><span style={{ fontSize: 21, fontWeight: 700 }}>Título 21 · 700</span><span style={{ fontSize: 16 }}>Texto 16, para leitura confortável em cartas e formulários.</span><span style={{ fontSize: 13 }}>Apoio 13</span><span style={{ ...mono, fontSize: 11, letterSpacing: '0.08em' }}>RÓTULO MONO 11 · LETRA ESPAÇADA</span></div></Sec>
      <Sec t="Botões e controles"><div style={{ ...row, alignItems: 'center' }}>
        <button style={{ minHeight: 48, padding: '0 20px', borderRadius: 14, border: 0, background: '#B7A6FF', fontWeight: 600, fontSize: 15 }}>Primário</button>
        <button style={{ minHeight: 48, padding: '0 20px', borderRadius: 14, border: 0, background: '#F5F2EC', fontWeight: 600, fontSize: 15 }}>Neutro</button>
        <button style={{ minHeight: 48, padding: '0 20px', borderRadius: 14, border: '1.5px solid #4A4858', background: 'transparent', color: '#F5F2EC', fontWeight: 600, fontSize: 15 }}>Fantasma</button>
        <button className="coops-mban-btn" style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#F5F2EC', background: '#0E0E12', border: '2px solid #F5F2EC', borderRadius: 12, minHeight: 48, padding: '0 18px' }}>+ Ação do banner</button>
        <button className="coops-x" aria-label="Fechar" style={{ width: 44, height: 44, borderRadius: 14, background: '#F5F2EC', border: '1.5px solid #0E0E12', color: '#0E0E12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
      </div></Sec>
      <Sec t="Seleção e campos"><div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560 }}>
        <div style={row}>{['Um', 'Dois', 'Três'].map((t, i) => <button key={t} type="button" className="tw-chip" aria-pressed={i === 0} style={chipStyle(i === 0)}>{t}</button>)}</div>
        <div role="tablist" aria-label="Exemplo de abas" style={row}>{['Todas', 'Ativas', 'Encerradas'].map((t, i) => <button key={t} type="button" role="tab" aria-selected={i === 0} style={{ fontFamily: 'inherit', fontWeight: i === 0 ? 600 : 400, fontSize: 14, color: i === 0 ? '#0E0E12' : '#F5F2EC', background: i === 0 ? '#F5F2EC' : 'transparent', border: i === 0 ? 0 : '1px solid #4A4858', borderRadius: 999, minHeight: 44, padding: '0 16px' }}>{t}</button>)}</div>
        <input aria-label="Exemplo de campo" placeholder="Campo de texto" style={{ fontFamily: 'inherit', fontSize: 16, color: '#F5F2EC', background: '#17171D', border: '1.5px solid #2C2C36', borderRadius: 12, padding: '12px 14px' }} />
        <textarea aria-label="Exemplo de área" rows={3} placeholder="Área de texto" style={{ fontFamily: 'inherit', fontSize: 16, color: '#F5F2EC', background: '#17171D', border: '1.5px solid #2C2C36', borderRadius: 12, padding: '12px 14px' }} />
      </div></Sec>
      <Sec t="Calendário, carta em foco e agente" d="Demos interativas dos componentes reais."><DsDemos /></Sec>
      <Sec t="Avatar"><div style={row}>
        {HAIRS.map((h, i) => <Avatar key={h} hairStyle={h} skin={SKINS[i % SKINS.length]} bg={BGS[i % BGS.length]} shirtStyle={SHIRTS[i % SHIRTS.length]} crown={i % 4 === 0} glasses={i % 3 === 0} size={96} label={h} />)}
      </div></Sec>
      <Sec t="Banner do deck" d="Ícone animado no hover ou foco do banner; o avatar leva de volta ao perfil."><OpenDeckBanner bg="#F3D36B" icon={<BannerStar />} back={{ href: '/ds', label: '← Voltar' }} title="Título do deck" desc="Descrição curta do que mora nesse deck." chip="Só você e seu manager veem" avatar={{ hairStyle: 'coque', skin: SKINS[4] }} avatarBg="#D9B84B" avatarCrown cta={{ label: '+ Carta', onClick: () => {} }} /></Sec>
      <Sec t="Ícones de banner" d="Um por deck: Skills, Brain gym, Jornada, Entregas, Eventos e Saúde."><div style={row}>
        {[['skills', '#F3D36B', <BannerStar key="a" size={56} />], ['brain gym', '#F5A9D6', <BannerBrain key="b" size={56} />], ['jornada', '#FF8A5B', <BannerJourney key="c" size={56} />], ['entregas', '#8FE3C8', <BannerDelivery key="d" size={56} />], ['eventos', '#B7A6FF', <BannerEvents key="e" size={56} />]].map(([n, bg, ic]) => <Cell key={String(n)} bg={String(bg)} name={String(n)}>{ic}</Cell>)}
        <Cell bg="#A9D8F5" name="saúde"><BannerHeart /></Cell>
      </div></Sec>
      <Sec t="Saúde · um ícone por pergunta"><div style={row}>{(['saude', 'design', 'produto', 'negocio'] as const).map((k) => <Cell key={k} bg="#A9D8F5" name={k}><DimIcon id={k} ink="#0E0E12" bg="#A9D8F5" /></Cell>)}</div></Sec>
      <Sec t="Brain gym · tipos de estudo"><div style={row}>{study.map((t) => <Cell key={t} bg="#F5A9D6" name={t.toLowerCase()}><StudyTypeIcon type={t} /></Cell>)}</div></Sec>
      <Sec t="Deck de eventos · tipos de carta"><div style={row}>{events.map((t) => <Cell key={t} bg="#B7A6FF" name={t.toLowerCase()}><EventTypeIcon type={t} /></Cell>)}</div></Sec>
      <Sec t="Entregas · carta de entrega"><div style={row}><Cell bg="#8FE3C8" name="entrega"><DeliveryCardIcon bg="#8FE3C8" /></Cell></div></Sec>
      <Sec t="Jornada · objetivo e foco"><div style={row}>{(['prog', 'goal', 'foco', 'past'] as const).map((k) => <Cell key={k} bg="#FF8A5B" name={k}><JourneyCardIcon kind={k} /></Cell>)}</div></Sec>
      <Sec t="Mesa do time · decks do squad"><div style={row}>{Object.entries(ICP).map(([k, parts]) => <Cell key={k} bg="#B7A6FF" name={k}><svg width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ overflow: 'visible' }}>{parts.map(([c, d], i) => <path key={i} className={c || undefined} d={d} />)}</svg></Cell>)}</div></Sec>
      <Sec t="Agente · confere o entendimento"><div style={row}>{agentKinds.map((k) => <Cell key={k} bg="#8FE3C8" name={k}><AgentCardIcon kind={k} /></Cell>)}</div></Sec>
      <Sec t="Deck de ferramentas · ícone por tipo"><div style={row}>{toolKinds.map((k) => <Cell key={k} bg="#F3D36B" name={k}><svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ overflow: 'visible' }}>{TOOL_ICON_PARTS[k].map(([c, , d], i) => <path key={i} className={c || undefined} d={d} />)}</svg></Cell>)}</div></Sec>
      <Sec t="Cartas e pilha" d="Carta, pilha de cartas e carta encerrada."><div style={{ ...row, alignItems: 'flex-start' }}>
        <div className="coops-card" tabIndex={0} style={{ width: 260, height: 300, boxSizing: 'border-box', borderRadius: 22, background: '#F3D36B', border: '2px solid #0E0E12', color: '#0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 16px 36px rgba(0,0,0,0.45)' }}><span style={{ ...mono, fontSize: 11 }}>CARTA</span><span style={{ marginTop: 'auto', fontSize: 22, fontWeight: 700 }}>Carta comum</span><span style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 10, fontSize: 13 }}>Levanta e inclina no hover</span></div>
        <div className="coops-pile" style={{ position: 'relative', width: 280, height: 340 }}><div className="coops-b2" style={{ position: 'absolute', left: 22, top: 0, right: 0, height: 300, borderRadius: 22, background: '#4B36B0', border: '2px solid #0E0E12', transform: 'rotate(5deg)' }} /><div className="coops-b1" style={{ position: 'absolute', left: 12, top: 10, right: 10, height: 300, borderRadius: 22, background: '#8B74F2', border: '2px solid #0E0E12', transform: 'rotate(2.5deg)' }} /><div className="coops-front" tabIndex={0} style={{ position: 'absolute', left: 0, top: 24, right: 22, height: 300, boxSizing: 'border-box', borderRadius: 22, background: '#B7A6FF', border: '2px solid #0E0E12', color: '#0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}><span style={{ ...mono, fontSize: 11 }}>PILHA</span><span style={{ marginTop: 'auto', fontSize: 22, fontWeight: 700 }}>Deck empilhado</span></div></div>
        <div style={{ width: 260, height: 300, boxSizing: 'border-box', borderRadius: 22, background: '#A3A1AD', border: '2px solid #0E0E12', color: '#0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}><span style={{ ...mono, fontSize: 11 }}>ENCERRADA</span><span style={{ marginTop: 'auto', fontSize: 22, fontWeight: 700 }}>Carta encerrada</span></div>
      </div></Sec>
      <Sec t="Estados vazios" d="Contorno tracejado na cor do deck, com a primeira ação."><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>{(['eventos', 'skills', 'gym', 'jornada'] as const).map((k) => <EmptyDeckCard key={k} kind={k} asManager skillCount={5} href="/ds" />)}</div></Sec>
    </main>
  );
}
