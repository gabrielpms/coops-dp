import { Avatar, BGS, HAIRS, SHIRTS, SKINS } from '@/components/avatar/Avatar';
import { label } from '@/components/ds/tokens';

const COLORS: [string, string][] = [['lilac-100', '#EEE9FF'], ['lilac-200', '#D9CFFF'], ['lilac-300', '#B7A6FF'], ['lilac-500', '#8B74F2'], ['lilac-700', '#4B36B0'], ['ink-900', '#0E0E12'], ['ink-800', '#17171D'], ['ink-700', '#212129'], ['ink-600', '#2C2C36'], ['ink-400', '#4A4858'], ['ink-300', '#A3A1AD'], ['paper', '#F5F2EC'], ['skills', '#F3D36B'], ['brain gym', '#F5A9D6'], ['jornada', '#FF8A5B'], ['agente', '#8FE3C8'], ['saúde', '#A9D8F5'], ['alavancas', '#C9F0B8']];

// Página interna de conferência visual do DS (PRD §4). Cresce a cada componente novo.
export default function DS() {
  if (process.env.NODE_ENV === 'production') return null;
  return (
    <main style={{ maxWidth: 1216, margin: '0 auto', padding: '48px 32px', display: 'flex', flexDirection: 'column', gap: 40 }}>
      <h1 style={{ margin: 0, fontSize: 64, fontWeight: 800, letterSpacing: '-0.035em' }}>Design System</h1>
      <section><h2 style={{ fontSize: 28 }}>Cores</h2><div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>{COLORS.map(([n, c]) => <div key={n} style={{ width: 120 }}><div style={{ height: 64, borderRadius: 14, background: c, border: '2px solid #2C2C36' }} /><span style={label(11, '0')}>{n}<br />{c}</span></div>)}</div></section>
      <section><h2 style={{ fontSize: 28 }}>Botões</h2><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button style={{ minHeight: 48, padding: '0 20px', borderRadius: 14, border: 0, background: '#B7A6FF', fontWeight: 600, fontSize: 15 }}>Primário</button>
        <button style={{ minHeight: 48, padding: '0 20px', borderRadius: 14, border: 0, background: '#F5F2EC', fontWeight: 600, fontSize: 15 }}>Neutro</button>
        <button style={{ minHeight: 48, padding: '0 20px', borderRadius: 14, border: '1.5px solid #4A4858', background: 'transparent', color: '#F5F2EC', fontWeight: 600, fontSize: 15 }}>Fantasma</button>
      </div></section>
      <section><h2 style={{ fontSize: 28 }}>Avatar</h2><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {HAIRS.map((h, i) => <Avatar key={h} hairStyle={h} skin={SKINS[i % SKINS.length]} bg={BGS[i % BGS.length]} shirtStyle={SHIRTS[i % SHIRTS.length]} crown={i % 4 === 0} glasses={i % 3 === 0} size={96} label={h} />)}
      </div></section>
    </main>
  );
}
