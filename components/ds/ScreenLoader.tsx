import { label as mono } from './tokens';

/**
 * Carregamento de tela: três cartas empilhadas que se puxam em loop.
 * Aparece só se a espera passar de 250 ms (CSS `coops-loader`), então não pisca em cargas rápidas.
 * `fill` ocupa a tela inteira; sem `fill` serve para um trecho da página.
 */
export function ScreenLoader({ text = 'Embaralhando as cartas…', fill = true }: { text?: string; fill?: boolean }) {
  const cards = [
    { bg: '#4B36B0', x: '-26px', r: '-10deg', d: '0.30s' },
    { bg: '#8B74F2', x: '26px', r: '9deg', d: '0.15s' },
    { bg: '#B7A6FF', x: '0px', r: '-2deg', d: '0s' },
  ];
  return (
    <div role="status" aria-live="polite" className="coops-loader" style={{ minHeight: fill ? '100vh' : 240, boxSizing: 'border-box', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
      <div aria-hidden="true" style={{ position: 'relative', width: 140, height: 168 }}>
        {cards.map((c, i) => (
          <span key={i} className="ld-card" style={{ ['--x' as string]: c.x, ['--r' as string]: c.r, animationDelay: c.d, position: 'absolute', left: 22, top: 18, width: 96, height: 132, boxSizing: 'border-box', borderRadius: 18, background: c.bg, border: '2px solid #0E0E12', boxShadow: '0 12px 24px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 10 } as React.CSSProperties}>
            {i === 2 && <svg className="ld-star" width="30" height="30" viewBox="0 0 100 100"><path d="M50 6 60 38 94 50 60 62 50 94 40 62 6 50 40 38z" fill="#8FE3C8" stroke="#0E0E12" strokeWidth="5" strokeLinejoin="round" /></svg>}
          </span>
        ))}
      </div>
      <span style={{ ...mono(12, '0.1em'), color: '#A3A1AD', textTransform: 'uppercase' }}>{text}</span>
    </div>
  );
}

/** Estrela pequena para botões e trechos em carregamento. */
export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden="true" className="ld-star" width={size} height={size} viewBox="0 0 100 100" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M50 6 60 38 94 50 60 62 50 94 40 62 6 50 40 38z" fill="currentColor" />
    </svg>
  );
}
