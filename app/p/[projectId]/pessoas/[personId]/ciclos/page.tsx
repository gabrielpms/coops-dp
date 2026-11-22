import { db } from '@/lib/db';
import { loadPersonPage } from '@/lib/person';
import { projectCycle } from '@/lib/projectCycle';
import { cycleRange, cyclesSince } from '@/lib/cycles';
import { CycleHistory, type HistSection } from '@/components/ds/CycleHistory';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { EVENT_TYPE_LABEL, HEALTH_DIMS } from '@/lib/validation';
import { firstName } from '@/lib/format';

export const dynamic = 'force-dynamic';
const STATUS = { ENTREGUE: 'Entregue', EM_ANDAMENTO: 'Em andamento', PAUSADA: 'Pausada' } as const;
const dec = (n: number) => n.toFixed(1).replace('.', ',');
const day = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

export default async function PessoaCiclos({ params, searchParams }: { params: Promise<{ projectId: string; personId: string }>; searchParams: Promise<{ c?: string }> }) {
  const { projectId, personId } = await params;
  const { c } = await searchParams;
  const { user, person, isOwn } = await loadPersonPage(projectId, personId);
  const { months, cycle: current } = await projectCycle(projectId);
  const project = await db.project.findUniqueOrThrow({ where: { id: projectId }, select: { createdAt: true } });

  // Ciclos da duração atual desde a criação do projeto + qualquer ciclo com registros (inclusive de outra duração).
  const [rCycles, hCycles, gCycles] = await Promise.all([
    db.skillRating.findMany({ where: { personId }, distinct: ['cycle'], select: { cycle: true } }),
    db.healthCheckin.findMany({ where: { personId }, distinct: ['cycle'], select: { cycle: true } }),
    db.journeyGoal.findMany({ where: { personId, deletedAt: null }, distinct: ['cycle'], select: { cycle: true } }),
  ]);
  const all = [...new Set([...cyclesSince(project.createdAt, months), ...rCycles.map((x) => x.cycle), ...hCycles.map((x) => x.cycle), ...gCycles.map((x) => x.cycle)])].filter((id) => cycleRange(id)).sort((a, b) => cycleRange(b)!.start.getTime() - cycleRange(a)!.start.getTime() || (a < b ? 1 : -1));
  const cycles = all.includes(current) ? all : [current, ...all];
  const selected = c && cycles.includes(c) ? c : cycles.find((x) => x !== current) ?? current;
  const range = cycleRange(selected)!;
  const inRange = { gte: range.start, lt: range.end };

  const [ratings, skills, health, goals, events, deliveries, study] = await Promise.all([
    db.skillRating.findMany({ where: { personId, cycle: selected } }),
    db.skill.findMany({ where: { projectId }, orderBy: { position: 'asc' } }),
    db.healthCheckin.findFirst({ where: { personId, cycle: selected }, orderBy: { createdAt: 'desc' } }),
    db.journeyGoal.findMany({ where: { personId, cycle: selected, deletedAt: null }, orderBy: { createdAt: 'asc' } }),
    db.personEvent.findMany({ where: { personId, archivedAt: null, date: inRange }, orderBy: { date: 'desc' } }),
    db.delivery.findMany({ where: { personId, deletedAt: null, date: inRange }, orderBy: { date: 'desc' } }),
    db.studyItem.findMany({ where: { personId, deletedAt: null, updatedAt: inRange }, orderBy: { updatedAt: 'desc' }, include: { skill: { select: { name: true } } } }),
  ]);
  const base = `/p/${projectId}/pessoas/${personId}`;
  const fn = firstName(person.name);
  const rated = skills.map((s) => ({ s, r: ratings.find((x) => x.skillId === s.id) })).filter((x) => x.r && (x.r.selfScore || x.r.managerScore));
  const sections: HistSection[] = [
    { id: 'saude', title: 'Saúde', kicker: 'SAÚDE · CHECK-IN', bg: '#A9D8F5', href: `${base}/saude`, empty: 'Nenhum check-in de saúde neste ciclo.',
      items: health ? [{ title: 'Check-in do ciclo', big: dec((health.saude + health.design + health.produto + health.negocio) / 4), bigLabel: 'MÉDIA / 5', meta: HEALTH_DIMS.map((d) => `${d.title}: ${health[d.id as 'saude' | 'design' | 'produto' | 'negocio']}`).join(' · '), foot: health.note ? `“${health.note}”` : undefined }] : [] },
    { id: 'skills', title: 'Skills', kicker: 'SKILL', bg: '#F3D36B', href: `${base}/skills`, empty: 'Nenhuma skill avaliada neste ciclo.',
      items: rated.map(({ s, r }) => ({ title: s.name, big: r!.selfScore ? String(r!.selfScore) : '—', bigLabel: isOwn ? 'SUA NOTA' : `NOTA DE ${fn.toUpperCase()}`, foot: `Manager: ${r!.managerScore ?? '—'}` })) },
    { id: 'jornada', title: 'Jornada', kicker: 'JORNADA', bg: '#FF8A5B', href: `${base}/jornada`, empty: 'Nenhum objetivo ou foco neste ciclo.',
      items: goals.map((g) => ({ title: g.title, big: g.kind === 'OBJETIVO' ? `${g.progress}/5` : `${g.levelFrom ?? 0}→${g.levelTo ?? 0}`, bigLabel: g.kind === 'OBJETIVO' ? (g.progress >= 5 ? 'ATINGIDO' : 'PROGRESSO') : 'NÍVEL', meta: g.kind === 'OBJETIVO' ? g.signal ?? undefined : g.practice ?? undefined, foot: g.kind === 'OBJETIVO' ? 'Objetivo' : 'Foco de desenvolvimento' })) },
    { id: 'eventos', title: 'Registros', kicker: 'REGISTRO', bg: '#B7A6FF', href: `${base}/eventos`, empty: 'Nenhum registro neste ciclo.',
      items: events.map((e) => ({ title: e.title, big: day(e.date), bigLabel: EVENT_TYPE_LABEL[e.type as keyof typeof EVENT_TYPE_LABEL]?.toUpperCase() })) },
    { id: 'entregas', title: 'Entregas', kicker: 'ENTREGA', bg: '#8FE3C8', href: `${base}/entregas`, empty: 'Nenhuma entrega neste ciclo.',
      items: deliveries.map((d) => ({ title: d.title, big: day(d.date), bigLabel: STATUS[d.status as keyof typeof STATUS]?.toUpperCase(), meta: d.description ?? undefined, foot: d.impact ? `Impacto: ${d.impact}` : 'Impacto pendente' })) },
    { id: 'brain', title: 'Brain gym', kicker: 'BRAIN GYM', bg: '#F5A9D6', href: `${base}/brain-gym`, empty: 'Nada estudado neste ciclo.',
      items: study.map((s) => ({ title: s.title, big: `${Math.round((s.progress / s.total) * 100)}%`, bigLabel: s.type, foot: s.skill?.name ? `Ligado a ${s.skill.name}` : undefined })) },
  ];
  return (
    <CycleHistory user={{ name: user.name, email: user.email, role: user.role, avatar: user.avatar as any }} title="Histórico de ciclos"
      desc={`Tudo o que ${isOwn ? 'você registrou' : `${fn} registrou`} em cada ciclo, só para consulta: saúde, skills, jornada, registros, entregas e estudos.`}
      back={{ href: base, label: `${isOwn ? 'Meu perfil' : person.name}` }} avatar={{ ...DEFAULT_AVATAR_CFG, ...((person.avatar as any) ?? {}) }}
      cycles={cycles} current={current} selected={selected} hrefFor={(x) => `${base}/ciclos?c=${x}`} sections={sections} />
  );
}
