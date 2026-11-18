'use client';
import { Avatar, type AvatarConfig } from '../avatar/Avatar';
import { DEFAULT_AVATAR_CFG } from '../avatar/AvatarEditor';
import { CoopsLink } from '../nav/useCoopsRouter';
import { label } from '../ds/tokens';

export type Seat = { avatar: AvatarConfig | null; crown: boolean };

// Posições das cadeiras (esquerda, topo, tamanho do avatar), tiradas do protótipo Coops05-Time por número de lugares.
type Pos = [number, number, number];
const SEATS: Record<number, Pos[]> = {
  3: [[71, -1, 58], [5, 41, 50], [145, 41, 50]],
  4: [[77, 9, 46], [151, 83, 38], [81, 153, 38], [11, 83, 38]],
  5: [[77, 9, 46], [148, 61, 38], [122, 140, 38], [40, 140, 38], [14, 61, 38]],
  6: [[77, 9, 46], [142, 48, 38], [142, 118, 38], [81, 153, 38], [20, 118, 38], [20, 48, 38]],
  7: [[77, 9, 46], [136, 39, 38], [149, 99, 38], [111, 146, 38], [51, 146, 38], [13, 99, 38], [26, 39, 38]],
  8: [[77, 9, 46], [130, 34, 38], [151, 83, 38], [130, 132, 38], [81, 153, 38], [32, 132, 38], [11, 83, 38], [32, 34, 38]],
};
const CARDS = ['#FF8A5B', '#F5A9D6', '#B7A6FF', '#F3D36B'];

/** Carta do squad na tela Time: mesa redonda com as pessoas sentadas em volta e as cartas no centro (Coops05-Time). */
export function SquadTableCard({ href, squad, seats, people, extra }: { href: string; squad: { id: string; name: string; description?: string }; seats: Seat[]; people: number; extra: boolean }) {
  const n = seats.length;
  const small = n <= 3; // até 3 lugares: mesa maior e avatares maiores
  const layout = SEATS[small ? 3 : Math.min(n, 8)];
  const big = n > 8;
  // lugares vazios (até 3) repetem a última pessoa, como o protótipo repete a liderança
  const filled = small ? Array.from({ length: 3 }, (_, i) => seats[i] ?? seats[seats.length - 1]) : seats;
  const sh = small ? 4 : 3;
  const table = small ? { size: 150, left: 25, top: 36, w: 200, h: 196, pad: 6, drop: 7 } : { size: 116, left: 42, top: 44, w: 200, h: 204, pad: 2, drop: 6 };
  const cards = small ? { w: 26, h: 34, top: 115, r: 5, lefts: [45, 73, 101, 129] } : { w: 20, h: 27, top: 89, r: 4, lefts: [60, 80, 100, 120] };
  const empty = n === 0;
  return (
    <CoopsLink className="coops-m" href={href} aria-label={`Abrir a mesa do time ${squad.name}`} style={{ color: '#0E0E12', textDecoration: 'none', borderRadius: 24, background: '#B7A6FF', border: '2px solid #0E0E12', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 360, boxShadow: '6px 6px 0 #4B36B0' }}>
      <div style={{ padding: '14px 16px 0', display: 'flex', justifyContent: 'space-between', ...label(11, '0.06em') }}><span>MESA DO TIME</span><span>{extra ? `${people} + 1` : `${people} ${people === 1 ? 'PESSOA' : 'PESSOAS'}`}</span></div>
      {empty ? (
        <div className="coops-av" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 'none', height: 204, paddingTop: 2 }}>
          <span aria-hidden="true" style={{ width: 120, height: 120, borderRadius: '50%', border: '2px dashed #0E0E12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, textAlign: 'center', padding: 12, boxSizing: 'border-box' }}>Sem pessoas ainda</span>
        </div>
      ) : (
        <div className="coops-av" style={{ display: 'flex', justifyContent: 'center', paddingTop: table.pad }}>
          <div aria-hidden="true" style={{ position: 'relative', width: table.w, height: table.h, flex: 'none' }}>
            <span style={{ position: 'absolute', left: table.left, top: table.top + table.drop, width: table.size, height: table.size, boxSizing: 'border-box', borderRadius: '50%', background: '#8B74F2', border: '2px solid #0E0E12' }} />
            <span style={{ position: 'absolute', left: table.left, top: table.top, width: table.size, height: table.size, boxSizing: 'border-box', borderRadius: '50%', background: '#F5F2EC', border: '2px solid #0E0E12' }} />
            {layout.map(([l, t, sz], i) => {
              const seat = filled[i];
              if (!seat) return null;
              if (big && i === 7) return <span key="rest" style={{ position: 'absolute', left: l, top: t, zIndex: 2, width: 38, height: 38, boxSizing: 'content-box', borderRadius: '50%', background: '#0E0E12', color: '#F5F2EC', border: '2px solid #0E0E12', boxShadow: `0 ${sh}px 0 #4B36B0`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...label(14, '0') }}>+{n - 7}</span>;
              return <div key={i} style={{ position: 'absolute', left: l, top: t, zIndex: 2, lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12', boxShadow: `0 ${sh}px 0 #4B36B0` }}><Avatar {...DEFAULT_AVATAR_CFG} {...(seat.avatar ?? {})} crown={seat.crown} size={sz} label="" /></div>;
            })}
            {cards.lefts.map((l, i) => <span key={l} style={{ position: 'absolute', left: l, top: cards.top, zIndex: 1, width: cards.w, height: cards.h, boxSizing: 'border-box', borderRadius: cards.r, background: CARDS[i], border: '2px solid #0E0E12', transform: `rotate(${[-14, -4, 6, 16][i]}deg)` }} />)}
          </div>
        </div>
      )}
      <div style={{ flex: 1, padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, overflowWrap: 'anywhere' }}>{squad.name}</span>
        {squad.description && <span style={{ fontSize: 14 }}>{squad.description}</span>}
        <span style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#F5F2EC', background: '#0E0E12', borderRadius: 999, padding: '7px 12px' }}>Sentar à mesa<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
      </div>
    </CoopsLink>
  );
}
