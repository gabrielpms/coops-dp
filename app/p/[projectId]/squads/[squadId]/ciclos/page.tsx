import { db } from '@/lib/db';
import { loadSquadPage } from '@/lib/squad';
import { projectCycle } from '@/lib/projectCycle';
import { cycleRange, cyclesSince } from '@/lib/cycles';
import { CycleHistory, type HistSection } from '@/components/ds/CycleHistory';
import { DECK_META, type SquadDeckId } from '@/components/squad/types';
import { HEALTH_DIMS } from '@/lib/validation';

export const dynamic = 'force-dynamic';
const MIN_ANSWERS = 3; // abaixo disso o agregado poderia identificar quem respondeu
const dec = (n: number) => n.toFixed(1).replace('.', ',');
const ORDER: SquadDeckId[] = ['DESAFIO', 'FRENTE', 'ESTRATEGIA', 'INDICADOR', 'ALAVANCA'];
const BG: Record<SquadDeckId, string> = { DESAFIO: '#FF8A5B', FRENTE: '#F5A9D6', ESTRATEGIA: '#B7A6FF', INDICADOR: '#F3D36B', ALAVANCA: '#C9F0B8' };

export default async function SquadCiclos({ params, searchParams }: { params: Promise<{ projectId: string; squadId: string }>; searchParams: Promise<{ c?: string }> }) {
  const { projectId, squadId } = await params;
  const { c } = await searchParams;
  const { user, squad } = await loadSquadPage(projectId, squadId);
  const { months, cycle: current } = await projectCycle(projectId);
  const project = await db.project.findUniqueOrThrow({ where: { id: projectId }, select: { createdAt: true } });
  const members = await db.squadMembership.findMany({ where: { squadId }, select: { personId: true } });
  const ids = members.map((m) => m.personId);
  const hCycles = await db.healthCheckin.findMany({ where: { personId: { in: ids } }, distinct: ['cycle'], select: { cycle: true } });
  const all = [...new Set([...cyclesSince(project.createdAt, months), ...hCycles.map((x) => x.cycle)])].filter((id) => cycleRange(id)).sort((a, b) => cycleRange(b)!.start.getTime() - cycleRange(a)!.start.getTime() || (a < b ? 1 : -1));
  const cycles = all.includes(current) ? all : [current, ...all];
  const selected = c && cycles.includes(c) ? c : cycles.find((x) => x !== current) ?? current;
  const range = cycleRange(selected)!;

  const [cards, checkins] = await Promise.all([
    // cartas que existiam no ciclo: criadas antes do fim e não encerradas antes do início
    db.squadCard.findMany({ where: { squadId, deletedAt: null, createdAt: { lt: range.end }, OR: [{ closedAt: null }, { closedAt: { gte: range.start } }] }, orderBy: { createdAt: 'asc' } }),
    db.healthCheckin.findMany({ where: { personId: { in: ids }, cycle: selected }, orderBy: { createdAt: 'desc' } }),
  ]);
  const latest = [...new Map(checkins.map((h) => [h.personId, h])).values()];
  const avg = (k: 'saude' | 'design' | 'produto' | 'negocio') => latest.reduce((a, h) => a + h[k], 0) / (latest.length || 1);
  const base = `/p/${projectId}/squads/${squadId}`;
  const sections: HistSection[] = [
    ...ORDER.map((d) => {
      const m = DECK_META[d];
      return { id: d, title: m.title, kicker: m.kicker, bg: BG[d], href: `${base}/${m.slug}`, empty: `Nenhum registro de ${m.title.toLowerCase()} neste ciclo.`,
        items: cards.filter((x) => x.deck === d).map((x) => {
          const data = (x.data as any) ?? {};
          const acoes: { done: boolean }[] = data.acoes ?? [];
          return { title: x.title, big: d === 'DESAFIO' || d === 'FRENTE' ? `${x.level ?? 1}/5` : d === 'INDICADOR' && data.progresso ? `${data.progresso}%` : undefined, bigLabel: d === 'DESAFIO' ? 'COMPLEXIDADE' : d === 'FRENTE' ? 'PROGRESSO' : d === 'INDICADOR' && data.progresso ? 'DA META' : undefined,
            meta: data.cenario || data.oque || data.texto || data.descricao || data.porque || undefined,
            foot: [x.status === 'ENCERRADA' ? 'Encerrada' : 'Ativa', acoes.length ? `${acoes.filter((a) => a.done).length}/${acoes.length} ações` : ''].filter(Boolean).join(' · ') };
        }) } satisfies HistSection;
    }),
    { id: 'saude', title: 'Saúde do time', kicker: 'SAÚDE', bg: '#A9D8F5', href: `${base}/saude`, empty: latest.length ? `Só ${latest.length} ${latest.length === 1 ? 'resposta' : 'respostas'} neste ciclo: o agregado aparece a partir de ${MIN_ANSWERS}, para não identificar ninguém.` : 'Nenhum check-in de saúde neste ciclo.',
      items: latest.length >= MIN_ANSWERS ? HEALTH_DIMS.map((d) => ({ title: d.title, big: dec(avg(d.id as 'saude')), bigLabel: 'MÉDIA DO TIME', foot: `${latest.length} ${latest.length === 1 ? 'resposta' : 'respostas'}` })) : [] },
  ];
  return (
    <CycleHistory user={{ name: user.name, email: user.email, role: user.role, avatar: user.avatar as any }} title="Histórico de ciclos"
      desc={`O que o ${squad.name} tinha em cada ciclo: desafios, frentes, estratégia, indicadores, alavancas e a saúde do time. Só para consulta.`}
      back={{ href: base, label: `← ${squad.name}` }} cycles={cycles} current={current} selected={selected} hrefFor={(x) => `${base}/ciclos?c=${x}`} sections={sections} accent="#B7A6FF"
      note={<span style={{ color: '#A3A1AD', fontSize: 14 }}>As cartas aparecem no ciclo em que existiam. A saúde é a média das respostas do ciclo, só com 3 ou mais respostas.</span>} />
  );
}
