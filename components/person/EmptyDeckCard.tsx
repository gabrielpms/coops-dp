import { CoopsLink } from '../nav/useCoopsRouter';
import { mono } from '../ds/tokens';

export type EmptyDeckKind = 'eventos' | 'skills' | 'gym' | 'jornada';

const ICONS: Record<EmptyDeckKind, string[]> = {
  eventos: ['M10 14h44v40H10z', 'M10 24h44M22 8v10M42 8v10'],
  skills: ['M32 6l7 15 16 2-12 11 3 16-14-8-14 8 3-16L9 23l16-2z'],
  gym: ['M12 14h16a4 4 0 0 1 4 4v36a4 4 0 0 0-4-4H12zM52 14H36a4 4 0 0 0-4 4v36a4 4 0 0 1 4-4h16z'],
  jornada: ['M8 54c10 0 10-14 20-14s8-14 18-14', 'M46 26V8l10 5-10 5'],
};

/** Estado vazio de um deck (Coops16): mesmo formato e cor do deck, em contorno tracejado, com a primeira ação. */
export function EmptyDeckCard({ kind, asManager, skillCount, href }: { kind: EmptyDeckKind; asManager: boolean; skillCount: number; href: string }) {
  const m = asManager;
  const d = {
    eventos: { label: 'EVENTOS', color: '#B7A6FF', tint: 'rgba(183,166,255,0.06)', title: m ? 'Nenhum check-in ainda' : 'Nenhum evento ainda', hint: m ? 'Registre o primeiro check-in. Feedbacks e entregas também moram aqui.' : 'Adicione feedbacks recebidos e entregas de destaque. Check-ins vêm do manager.', cta: m ? '+ Primeiro check-in' : '+ Feedback ou entrega' },
    skills: { label: 'SKILLS', color: '#F3D36B', tint: 'rgba(243,211,107,0.06)', title: 'Skills ainda sem nota', hint: m ? `${skillCount} skills do projeto esperando sua avaliação.` : `Faça sua autoavaliação nas ${skillCount} skills do projeto.`, cta: m ? 'Avaliar skills' : 'Fazer autoavaliação' },
    gym: { label: 'BRAIN GYM', color: '#F5A9D6', tint: 'rgba(245,169,214,0.06)', title: 'Nada em estudo', hint: 'Livros, vídeos, artigos e cursos, com o progresso de cada um.', cta: m ? 'Sugerir conteúdo' : '+ Primeiro estudo' },
    jornada: { label: 'JORNADA', color: '#FF8A5B', tint: 'rgba(255,138,91,0.06)', title: 'Sem objetivo no ciclo', hint: m ? 'Defina com a pessoa o objetivo, os sinais e o foco do ciclo.' : 'O objetivo é definido junto com seu manager no próximo check-in.', cta: 'Definir objetivo' },
  }[kind];
  const locked = kind === 'jornada' && !m;
  return (
    <article className="coops-card" aria-label={`Deck de ${d.label.toLowerCase()} vazio`} style={{ minHeight: 360, boxSizing: 'border-box', borderRadius: 22, background: d.tint, border: `2px dashed ${d.color}`, padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', ...mono, fontSize: 11, letterSpacing: '0.06em', color: d.color }}><span>{d.label}</span><span>0 CARTAS</span></span>
      <span style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
        <svg width="84" height="84" viewBox="0 0 64 64" fill="none" stroke={d.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" aria-hidden="true">{ICONS[kind].map((p) => <path key={p} d={p} />)}</svg>
      </span>
      <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{d.title}</span>
      <span style={{ fontSize: 14, lineHeight: 1.45, color: '#A3A1AD' }}>{d.hint}</span>
      {locked
        ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, fontSize: 14, color: '#A3A1AD', border: '1.5px dashed #4A4858', borderRadius: 12 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>Vem do seu manager</span>
        : <CoopsLink href={href} style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#0E0E12', background: d.color, border: 0, borderRadius: 12, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>{d.cta}</CoopsLink>}
    </article>
  );
}
