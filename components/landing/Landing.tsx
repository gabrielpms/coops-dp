'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Avatar } from '../avatar/Avatar';
import { CROWD, HERO, MESA_SETS, MOMENTS } from './data';
import { WishlistSheet, type WishSeed } from './WishlistSheet';
import { label } from '../ds/tokens';

const H2: React.CSSProperties = { margin: 0, fontSize: 'clamp(38px, 6vw, 64px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1 };
const eyebrow = (color: string): React.CSSProperties => ({ ...label(12, '0.1em'), color });
const btnDark: React.CSSProperties = { color: '#F5F2EC', background: '#0E0E12', textDecoration: 'none', fontWeight: 600, fontSize: 15, borderRadius: 14, padding: '0 20px', display: 'inline-flex', alignItems: 'center', minHeight: 48, boxSizing: 'border-box' };
const Star = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6 60 38 94 50 60 62 50 94 40 62 6 50 40 38z" fill="#8FE3C8" stroke="#0E0E12" strokeWidth="3" strokeLinejoin="round" /><circle cx="44" cy="48" r="3.5" fill="#0E0E12" /><circle cx="56" cy="48" r="3.5" fill="#0E0E12" /><path d="M44 57c4 3 8 3 12 0" fill="none" stroke="#0E0E12" strokeWidth="3" strokeLinecap="round" /></svg>
);
const Ico = ({ d, size = 40, sw = 2.2 }: { d: string; size?: number; sw?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

function HeroPerson({ d, hovered, dim, onEnter, onLeave }: { d: (typeof HERO)[number]; hovered: boolean; dim: boolean; onEnter: () => void; onLeave: () => void }) {
  const [k, setK] = useState(0);
  const [fade, setFade] = useState(false);
  useEffect(() => {
    if (!hovered) { setK(0); setFade(false); return; }
    let iv: ReturnType<typeof setInterval>, t2: ReturnType<typeof setTimeout>;
    const swap = () => { setFade(true); t2 = setTimeout(() => { setK((x) => x + 1); setFade(false); }, 180); };
    const t1 = setTimeout(() => { swap(); iv = setInterval(swap, 1200); }, 400);
    return () => { clearTimeout(t1); clearInterval(iv); clearTimeout(t2); };
  }, [hovered]);
  const card = hovered ? d.cards[k % d.cards.length] : d.cards[0];
  return (
    <div onMouseEnter={onEnter} onMouseLeave={onLeave} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: hovered ? 3 : 1, opacity: dim ? 0.5 : 1, transition: 'opacity 260ms ease', cursor: 'default' }}>
      <span style={{ width: d.cw, height: d.ch, boxSizing: 'border-box', borderRadius: 14, background: card.bg, border: '2px solid #0E0E12', transform: hovered ? 'translateY(-14px) rotate(0deg) scale(1.1)' : `rotate(${d.rot}deg)`, padding: 10, display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left', boxShadow: hovered ? '0 18px 32px rgba(14,14,18,0.3)' : '0 8px 18px rgba(14,14,18,0.18)', transition: 'transform 320ms cubic-bezier(.34,1.4,.64,1), box-shadow 320ms ease, background-color 240ms ease' }}>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, opacity: fade ? 0 : 1, transform: fade ? 'translateY(6px)' : 'none', transition: 'opacity 180ms ease, transform 180ms ease' }}>
          <Ico d={card.icon} size={24} sw={3} />
          <span style={{ marginTop: 'auto', ...label(9), letterSpacing: '0.06em' }}>{card.label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.1 }}>{card.text}</span>
        </span>
      </span>
      <span style={{ width: 0, height: d.line, borderLeft: '2px dashed #0E0E12' }} />
      <div style={{ transform: hovered ? 'translateY(-10px) scale(1.06)' : 'none', transformOrigin: 'bottom center', transition: 'transform 320ms cubic-bezier(.34,1.4,.64,1)' }}><Avatar {...d.a} size={d.size} label="" /></div>
    </div>
  );
}

function Card({ children, style }: { children: ReactNode; style: React.CSSProperties }) {
  return <div style={{ position: 'absolute', boxSizing: 'border-box', borderRadius: 18, border: '2px solid #0E0E12', padding: 12, color: '#0E0E12', display: 'flex', flexDirection: 'column', ...style }}>{children}</div>;
}

export function Landing() {
  const [wish, setWish] = useState<WishSeed | undefined>(undefined); // undefined = fechado
  const [hero, setHero] = useState(-1);
  const [moment, setMoment] = useState(-1);
  const [mesa, setMesa] = useState(0);
  const [mesaFade, setMesaFade] = useState(false);
  const [mesaHover, setMesaHover] = useState(false);
  const [ic, setIc] = useState(false);
  const [team, setTeam] = useState(false);
  const [ini, setIni] = useState(false);
  const [crowd, setCrowd] = useState(-1);
  const openWish = (e: React.MouseEvent, seed: WishSeed = null) => { e.preventDefault(); setWish(seed); };

  useEffect(() => {
    if (!mesaHover) return;
    let t: ReturnType<typeof setTimeout>;
    const step = () => { setMesaFade(true); t = setTimeout(() => { setMesa((m) => m + 1); setMesaFade(false); }, 560); };
    step();
    const iv = setInterval(step, 1800);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, [mesaHover]);

  const cur = MESA_SETS[mesa % MESA_SETS.length];
  const mc = (i: number, delay: number) => ({ zIndex: cur.zs[i], transform: `translate(${cur.pos[i][0]}px, ${cur.pos[i][1]}px) rotate(${cur.rot[i]}deg)`, transition: `transform 700ms cubic-bezier(.65,0,.25,1) ${delay}ms` });
  const mAvatar = (i: number, pos: React.CSSProperties, size: number, delay: number) => (
    <div style={{ position: 'absolute', zIndex: 5, opacity: mesaFade ? 0 : 1, transform: mesaFade ? 'translateY(8px) scale(0.94)' : 'none', transition: `opacity 320ms ease ${delay}ms, transform 380ms cubic-bezier(.2,.8,.2,1) ${delay}ms`, ...pos }}><Avatar {...cur.av[i]} size={size} label="Pessoa do time" /></div>
  );
  const navLink: React.CSSProperties = { color: '#0E0E12', textDecoration: 'none', fontSize: 15, padding: '12px 14px', minHeight: 44, boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center' };
  const planCard = (on: boolean): React.CSSProperties => ({ transform: on ? 'translateY(-6px)' : 'none', boxShadow: on ? '0 24px 48px rgba(0,0,0,0.45)' : 'none', transition: 'transform 420ms cubic-bezier(.2,.8,.2,1), box-shadow 420ms ease', flex: '1 1 480px', minHeight: 440, boxSizing: 'border-box', borderRadius: 32, border: '2px solid #0E0E12', padding: 40, display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', overflow: 'hidden', color: '#0E0E12' });
  const mini = (bg: string, skin: string, hair: string, extra: object, tf: string, pos: React.CSSProperties, z: number, delay = 0) => (
    <div style={{ position: 'absolute', zIndex: z, width: 128, height: 176, boxSizing: 'border-box', borderRadius: 16, background: '#17171D', border: '2px solid #0E0E12', overflow: 'hidden', transform: tf, transition: `transform 420ms cubic-bezier(.2,.8,.2,1) ${delay}ms`, boxShadow: '0 12px 24px rgba(14,14,18,0.25)', ...pos }}>
      <div style={{ background: bg, padding: '8px 8px 0', display: 'flex', justifyContent: 'center', borderBottom: '2px solid #0E0E12' }}><Avatar skin={skin} hairStyle={hair} bg={bg} size={92} label="" {...extra} /></div>
      <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ height: 6, width: '70%', borderRadius: 3, background: '#F5F2EC' }} /><span style={{ height: 6, width: '45%', borderRadius: 3, background: '#4A4858' }} /></div>
    </div>
  );

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: '#0E0E12', color: '#F5F2EC' }}>
      <section style={{ background: '#B7A6FF', color: '#0E0E12', borderBottom: '2px solid #0E0E12', padding: '24px 32px 0', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 48 }}>
          <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>coops.</span>
            <nav aria-label="Principal" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
              <a href="#produtos" style={navLink}>Como é</a><a href="#ic" style={navLink}>Para ICs</a><a href="#momentos" style={navLink}>Agente</a><a href="#planos" style={navLink}>Para managers</a>
              <a href="/cadastro" style={navLink}>Entrar</a>
              <a href="#lista" onClick={(e) => openWish(e)} style={btnDark}>Entrar na wish list</a>
            </nav>
          </header>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end', marginTop: 40 }}>
            <h1 style={{ flex: '1 1 640px', margin: 0, fontSize: 'clamp(52px, 10vw, 120px)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.88 }}>Your design companion.</h1>
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55 }}>Gestão de time e amadurecimento de iniciativas, para quem lidera e para quem faz design. Tudo é deck e carta. Estamos abrindo em ondas: entre na wish list.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <a href="#lista" onClick={(e) => openWish(e)} style={btnDark}>Quero acesso antecipado</a>
                <a href="#produtos" style={{ ...btnDark, color: '#0E0E12', background: 'transparent', border: '2px solid #0E0E12' }}>Ver como é</a>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="lp-hero" style={{ position: 'relative', marginTop: 81, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', flexWrap: 'nowrap' }}>
            <span className="lp-pill" style={{ position: 'absolute', left: '2%', top: 30, ...label(13, '0'), fontWeight: 700, background: '#F5F2EC', border: '2px solid #0E0E12', borderRadius: 999, padding: '8px 14px', transform: 'rotate(-8deg)' }}>SEM PLANILHA</span>
            <span className="lp-pill" style={{ position: 'absolute', right: '2%', top: 60, ...label(13, '0'), fontWeight: 700, color: '#F5F2EC', background: '#0E0E12', borderRadius: 999, padding: '8px 14px', transform: 'rotate(7deg)' }}>COM AGENTE</span>
            {HERO.map((d, i) => <HeroPerson key={i} d={d} hovered={hero === i} dim={hero !== -1 && hero !== i} onEnter={() => setHero(i)} onLeave={() => setHero(-1)} />)}
          </div>
        </div>
      </section>

      <div aria-hidden="true" style={{ background: '#0E0E12', borderBottom: '2px solid #2C2C36', padding: '16px 0', display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'nowrap', whiteSpace: 'nowrap', overflow: 'hidden', ...label(14, '0.08em') }}>
        {[['CHECK-IN', '#B7A6FF'], ['SKILLS', '#F3D36B'], ['BRAIN GYM', '#F5A9D6'], ['JORNADA', '#FF8A5B'], ['AGENTE', '#8FE3C8'], ['INICIATIVA', '#F5F2EC'], ['CHAMPION', '#B7A6FF'], ['POWER UP', '#F3D36B']].map(([t, c]) => <span key={t} style={{ color: c }}>{t} ✦</span>)}
      </div>

      <div style={{ padding: '0 32px' }}>
        <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 96, paddingTop: 96 }}>
          <section id="produtos" style={{ borderRadius: 32, background: '#17171D', border: '1px solid #2C2C36', padding: 'clamp(24px, 4vw, 48px)', display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
            <div style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <span style={eyebrow('#B7A6FF')}>TUDO EM CIMA DA MESA</span>
              <h2 style={H2}>Seu time e suas iniciativas, em cima da mesa.</h2>
              <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55, color: '#D6D3DD' }}>Pessoas viram cartas, desenvolvimento vira deck e cada iniciativa ganha um agente que joga junto com você.</p>
              <a href="#momentos" style={{ alignSelf: 'flex-start', fontWeight: 600, fontSize: 16, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Ver como funciona →</a>
            </div>
            <div onMouseEnter={() => setMesaHover(true)} onMouseLeave={() => setMesaHover(false)} className="lp-mesa" style={{ flex: '1 1 480px', minWidth: 0, height: 450, overflow: 'visible' }}>
              <div aria-hidden="true" style={{ position: 'relative', height: 560, width: '100%', transform: 'scale(0.8)', transformOrigin: 'top center' }}>
                <div style={{ position: 'absolute', left: '6%', right: '6%', top: 70, bottom: 70, borderRadius: 32, background: '#241E3A', border: '2px solid #3A3160', boxShadow: 'inset 0 0 0 10px #1C1730' }} />
                <Card style={{ left: '20%', top: 120, width: 150, height: 200, background: '#B7A6FF', boxShadow: '0 12px 24px rgba(0,0,0,0.4)', ...mc(0, 0) }}><Ico d="M20 22m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0M44 22m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0M6 50c1-9 7-14 14-14s13 5 14 14M30 50c1-9 7-14 14-14s13 5 14 14" /><span style={{ marginTop: 'auto', fontSize: 15, fontWeight: 700, lineHeight: 1.15 }}>{cur.c1}</span></Card>
                <Card style={{ left: '41%', top: 150, width: 150, height: 200, background: '#F3D36B', boxShadow: '0 12px 24px rgba(0,0,0,0.4)', ...mc(1, 40) }}><Ico d="M32 6l7 15 16 2-12 11 3 16-14-8-14 8 3-16L9 23l16-2z" /><span style={{ marginTop: 'auto', fontSize: 15, fontWeight: 700, lineHeight: 1.15 }}>{cur.c2}</span></Card>
                <Card style={{ right: '16%', top: 110, width: 150, height: 200, background: '#F5A9D6', boxShadow: '0 12px 24px rgba(0,0,0,0.4)', ...mc(2, 80) }}><Ico d="M12 14h16a4 4 0 0 1 4 4v36a4 4 0 0 0-4-4H12zM52 14H36a4 4 0 0 0-4 4v36a4 4 0 0 1 4-4h16z" /><span style={{ marginTop: 'auto', fontSize: 15, fontWeight: 700, lineHeight: 1.15 }}>{cur.c3}</span></Card>
                <Card style={{ left: '30%', top: 290, width: 210, height: 150, padding: 14, gap: 6, background: '#F5F2EC', boxShadow: '0 16px 30px rgba(0,0,0,0.45)', ...mc(3, 120) }}><span style={{ ...label(10, '0'), color: '#4B36B0' }}>{cur.k4}</span><span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>{cur.c4}</span></Card>
                <Card style={{ right: '18%', top: 300, width: 120, height: 160, background: '#FF8A5B', ...mc(4, 160) }}><Ico size={36} d="M8 54c10 0 10-14 20-14s8-14 18-14M46 26V8l10 5-10 5" /><span style={{ marginTop: 'auto', fontSize: 14, fontWeight: 700 }}>{cur.c5}</span></Card>
                {mAvatar(0, { left: '2%', top: 20 }, 104, 0)}{mAvatar(1, { right: '2%', top: 30 }, 96, 70)}{mAvatar(2, { left: '4%', bottom: 10 }, 96, 140)}{mAvatar(3, { right: '4%', bottom: 0 }, 104, 210)}
                <div style={{ position: 'absolute', left: '50%', bottom: 0, zIndex: 6, transform: 'translateX(-50%)', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                  <Star size={84} />
                  <span style={{ marginBottom: 40, maxWidth: 170, fontSize: 13, lineHeight: 1.3, color: '#0E0E12', background: '#F5F2EC', border: '2px solid #0E0E12', borderRadius: '14px 14px 14px 4px', padding: '8px 10px' }}>{cur.bubble}</span>
                </div>
              </div>
            </div>
          </section>

          <section id="ic" style={{ borderRadius: 32, background: '#F5F2EC', color: '#0E0E12', border: '2px solid #0E0E12', padding: 'clamp(24px, 4vw, 48px)', display: 'flex', flexWrap: 'wrap-reverse', gap: 56, alignItems: 'center' }}>
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <span style={eyebrow('#4B36B0')}>PARA ICS</span>
              <h2 style={H2}>Sua coroa, seus power ups.</h2>
              <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55, color: '#3A3846' }}>Registre suas entregas, acompanhe o que está estudando e veja seu objetivo do ciclo. Quando vira referência em algo, ganha a coroa de champion.</p>
              <ul style={{ margin: '4px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 16 }}>
                {[['#B7A6FF', 'Feedbacks e entregas registrados antes de esquecer'], ['#F5A9D6', 'Estudos com progresso em blocos'], ['#FF8A5B', 'Objetivo do ciclo combinado com o manager']].map(([c, t]) => <li key={t} style={{ display: 'flex', gap: 12, alignItems: 'center' }}><span style={{ width: 12, height: 16, flex: 'none', borderRadius: 3, background: c, border: '1.5px solid #0E0E12' }} />{t}</li>)}
              </ul>
            </div>
            <div aria-hidden="true" onMouseEnter={() => setIc(true)} onMouseLeave={() => setIc(false)} style={{ flex: '1 1 460px', minWidth: 0, height: 440, borderRadius: 32, background: '#B7A6FF', border: '2px solid #0E0E12', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: '50%', bottom: -10, transform: ic ? 'translateX(-50%) translateY(-10px) scale(1.05)' : 'translateX(-50%)', transformOrigin: '50% 100%', transition: 'transform 320ms cubic-bezier(.2,.8,.2,1)' }}><Avatar skin="#C68B5E" hairStyle="trancas" shirtStyle="clara" earrings lashes crown bg="#D9CFFF" size={300} label="" /></div>
              {[['Curso de pesquisa', { left: 30, top: 40 }, ic ? 'translate(-10px, -8px) rotate(-12deg)' : 'rotate(-6deg)'], ['Mentoria quinzenal', { right: 30, top: 70 }, ic ? 'translate(10px, -10px) rotate(11deg)' : 'rotate(5deg)']].map(([t, pos, tf]) => (
                <div key={t as string} style={{ position: 'absolute', ...(pos as object), display: 'flex', alignItems: 'center', gap: 10, background: '#8FE3C8', border: '2px solid #0E0E12', borderRadius: 16, padding: '10px 14px', transform: tf as string, transition: 'transform 320ms cubic-bezier(.2,.8,.2,1)' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg><span style={{ fontWeight: 700, fontSize: 14 }}>{t as string}</span>
                </div>
              ))}
              <div style={{ position: 'absolute', right: 50, bottom: 60, background: '#F3D36B', border: '2px solid #0E0E12', borderRadius: 16, padding: '10px 14px', transform: ic ? 'translate(8px, 6px) rotate(-9deg) scale(1.06)' : 'rotate(-4deg)', transition: 'transform 320ms cubic-bezier(.2,.8,.2,1)', fontWeight: 700, fontSize: 14 }}>Champion de pesquisa</div>
            </div>
          </section>

          <section id="momentos" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}><span style={eyebrow('#8FE3C8')}>O AGENTE</span><h2 style={{ ...H2, maxWidth: 720 }}>Do problema à decisão, uma carta de cada vez.</h2></div>
              <p style={{ margin: 0, maxWidth: 360, fontSize: 18, lineHeight: 1.55, color: '#D6D3DD' }}>O agente percebe em que momento sua iniciativa está e entrega o deck de ferramentas certo.</p>
            </div>
            <ol style={{ listStyle: 'none', margin: 0, padding: '40px 0 16px', display: 'flex', gap: 0, flexWrap: 'wrap', justifyContent: 'center' }}>
              {MOMENTS.map((m, i) => {
                const on = moment === i;
                return (
                  <li key={m.n} tabIndex={0} onMouseEnter={() => setMoment(i)} onMouseLeave={() => setMoment((c) => (c === i ? -1 : c))} onFocus={() => setMoment(i)} onBlur={() => setMoment(-1)}
                    style={{ flex: '0 0 200px', height: 280, boxSizing: 'border-box', borderRadius: 22, background: m.bg, color: '#0E0E12', border: '2px solid #0E0E12', padding: 18, display: 'flex', flexDirection: 'column', marginRight: i < MOMENTS.length - 1 ? -16 : 0, position: 'relative', zIndex: on ? 10 : i === 2 ? 2 : i === 3 ? 1 : 0, transform: on ? 'translateY(-36px) rotate(0deg) scale(1.1)' : `rotate(${m.rot}deg) translateY(${m.y}px)`, boxShadow: on ? '0 28px 56px rgba(0,0,0,0.6), 0 0 0 3px #F5F2EC' : i === 2 ? '0 20px 40px rgba(0,0,0,0.5)' : 'none', transition: 'transform 220ms ease, box-shadow 220ms ease', cursor: 'default' }}>
                    <Ico d={m.icon} size={48} /><span style={{ marginTop: 'auto', fontSize: 40, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>{m.n}</span><span style={{ marginTop: 6, fontSize: 18, fontWeight: 600, lineHeight: 1.2 }}>{m.title}</span>
                  </li>
                );
              })}
            </ol>
            <p style={{ margin: '24px 0 0', textAlign: 'center', fontSize: 15, color: '#A3A1AD' }}>Em cada momento, o agente distribui as cartas certas: heurísticas, benchmark, métricas, roteiro de teste e mais.</p>
          </section>

          <section id="planos" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <article onMouseEnter={() => setTeam(true)} onMouseLeave={() => setTeam(false)} style={{ ...planCard(team), background: '#F5F2EC' }}>
              <span style={eyebrow('#4B36B0')}>COOPS · TEAM</span>
              <h3 style={{ margin: 0, fontSize: 'clamp(30px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.05, maxWidth: 330 }}>Team management doesn’t need to be a spreadsheet.</h3>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: '#3A3846', maxWidth: 280 }}>Cada pessoa vira uma carta com quatro decks de desenvolvimento.</p>
              <a href="#lista" onClick={(e) => openWish(e, { role: 1, focus: 0 })} style={{ ...btnDark, marginTop: 'auto', alignSelf: 'flex-start', position: 'relative', zIndex: 5 }}>Para managers</a>
              <div aria-hidden="true">
                {mini('#FF8A5B', '#F2D3BC', 'cacheado', { shirtStyle: 'preta', glasses: true }, team ? 'translate(-34px, -36px) rotate(-17deg)' : 'rotate(-10deg)', { right: 190, bottom: -30 }, 1)}
                {mini('#8FE3C8', '#5A3825', 'careca', { facialHair: 'barba' }, team ? 'translate(16px, -40px) rotate(15deg)' : 'rotate(8deg)', { right: 20, bottom: -24 }, 2, 60)}
                {mini('#B7A6FF', '#8D5A3B', 'coque', { shirtStyle: 'blazer', crown: true }, team ? 'translateY(-52px) rotate(0deg) scale(1.06)' : 'rotate(-1deg)', { right: 100, bottom: 10 }, 3, 30)}
              </div>
            </article>
            <article onMouseEnter={() => setIni(true)} onMouseLeave={() => setIni(false)} style={{ ...planCard(ini), background: '#B7A6FF' }}>
              <span style={eyebrow('#0E0E12')}>COOPS · INITIATIVES</span>
              <h3 style={{ margin: 0, fontSize: 'clamp(30px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.05, maxWidth: 330 }}>Product sense is complex, but doesn’t need to be hard.</h3>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, maxWidth: 280 }}>Um agente que entrega as ferramentas certas para cada momento.</p>
              <a href="#lista" onClick={(e) => openWish(e, { role: 0, focus: 0 })} style={{ ...btnDark, marginTop: 'auto', alignSelf: 'flex-start', position: 'relative', zIndex: 5 }}>Para quem faz design</a>
              <div aria-hidden="true">
                <div style={{ position: 'absolute', right: 150, bottom: -24, width: 140, height: 190, boxSizing: 'border-box', borderRadius: 16, background: '#F3D36B', border: '2px solid #0E0E12', padding: 12, transform: ini ? 'translate(-36px, -40px) rotate(-18deg)' : 'rotate(-10deg)', transition: 'transform 420ms cubic-bezier(.2,.8,.2,1) 60ms' }}><Ico size={34} sw={2.4} d="M8 14h20v36H8zM36 14h20v36H36zM12 22h12M40 22h12" /></div>
                <div style={{ position: 'absolute', right: 30, bottom: -10, zIndex: 2, width: 150, height: 200, boxSizing: 'border-box', borderRadius: 16, background: '#F5F2EC', border: '2px solid #0E0E12', padding: 12, transform: ini ? 'translate(-6px, -46px) rotate(1deg) scale(1.05)' : 'rotate(6deg)', transition: 'transform 420ms cubic-bezier(.2,.8,.2,1)', display: 'flex', flexDirection: 'column', boxShadow: '0 12px 24px rgba(14,14,18,0.25)' }}><Ico size={34} d="M32 6c10 8 14 20 10 34H22C18 26 22 14 32 6zM22 40l-8 10h12M42 40l8 10H38M32 19a5 5 0 1 0 0 10a5 5 0 1 0 0-10" /><span style={{ marginTop: 'auto', fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>Pessoas desistem no envio do documento</span></div>
                <div style={{ position: 'absolute', right: 24, top: 40, zIndex: 3, transform: ini ? 'translate(-14px, 10px) rotate(24deg) scale(1.12)' : 'none', transition: 'transform 520ms cubic-bezier(.34,1.56,.64,1)' }}><Star size={110} /></div>
              </div>
            </article>
          </section>

          <section style={{ borderRadius: 32, background: '#17171D', border: '1px solid #2C2C36', padding: '48px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20, overflow: 'hidden' }}>
            <h2 style={H2}>Puxe uma cadeira.</h2>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55, color: '#D6D3DD' }}>A mesa está pronta para o seu time.</p>
            <a href="#lista" onClick={(e) => openWish(e)} style={{ ...btnDark, color: '#0E0E12', background: '#B7A6FF' }}>Entrar na wish list</a>
            <div aria-hidden="true" className="lp-crowd" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginTop: 32, flexWrap: 'nowrap' }}>
              {CROWD.map((c, i) => (
                <div key={i} onMouseEnter={() => setCrowd(i)} onMouseLeave={() => setCrowd(-1)} style={{ transform: crowd === i ? 'translateY(-14px) scale(1.08)' : 'none', opacity: crowd === -1 || crowd === i ? 1 : 0.55, transformOrigin: 'bottom center', transition: 'transform 300ms cubic-bezier(.34,1.4,.64,1), opacity 300ms ease', position: 'relative', zIndex: crowd === i ? 2 : 1 }}><Avatar {...c.cfg} size={c.size} label="" /></div>
              ))}
            </div>
          </section>

          <footer style={{ borderTop: '1px solid #2C2C36', padding: '32px 0 48px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>coops<span style={{ color: '#B7A6FF' }}>.</span></span>
            <nav aria-label="Rodapé" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {[['#produtos', 'Como é'], ['#ic', 'Para ICs'], ['#planos', 'Para managers']].map(([h, t]) => <a key={h} href={h} style={{ color: '#A3A1AD', textDecoration: 'none', fontSize: 14, padding: '10px 12px', minHeight: 44, boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center' }}>{t}</a>)}
              <a href="#lista" onClick={(e) => openWish(e)} style={{ color: '#A3A1AD', textDecoration: 'none', fontSize: 14, padding: '10px 12px', minHeight: 44, boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center' }}>Wish list</a>
            </nav>
            <span style={{ fontSize: 14, color: '#A3A1AD' }}>your design companion</span>
          </footer>
        </div>
      </div>
      {wish !== undefined && <WishlistSheet seed={wish} onClose={() => setWish(undefined)} />}
    </div>
  );
}
