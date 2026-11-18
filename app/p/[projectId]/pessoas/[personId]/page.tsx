import { db } from '@/lib/db';
import { loadPersonPage } from '@/lib/person';
import { readDraft } from '@/lib/drafts';
import { projectCycle } from '@/lib/projectCycle';
import { ProfileClient } from './ProfileClient';

export const dynamic = 'force-dynamic';

export default async function PessoaPage({ params }: { params: Promise<{ projectId: string; personId: string }> }) {
  const { projectId, personId } = await params;
  const { user, person, isOwn, isManager } = await loadPersonPage(projectId, personId);
  const { cycle } = await projectCycle(projectId);
  const [squadOptions, project, powerUps, deliveries, study, ratings, draft, goalsAll, healthRows, eventsByType, lastEvent, focos, champFrentes] = await Promise.all([
    isManager && !isOwn ? db.squad.findMany({ where: { projectId, deletedAt: null }, orderBy: { createdAt: 'asc' }, select: { id: true, name: true, color: true } }) : Promise.resolve([] as { id: string; name: string; color: string }[]),
    db.project.findUniqueOrThrow({ where: { id: projectId }, include: { skills: { orderBy: { position: 'asc' } } } }),
    db.powerUp.findMany({ where: { personId, deletedAt: null }, orderBy: { createdAt: 'desc' } }),
    db.delivery.findMany({ where: { personId, deletedAt: null }, orderBy: { date: 'desc' }, select: { title: true, status: true } }),
    db.studyItem.findMany({ where: { personId, deletedAt: null }, orderBy: { createdAt: 'desc' }, select: { title: true, type: true, progress: true, total: true } }),
    db.skillRating.findMany({ where: { personId, cycle } }),
    readDraft<any>(user.id, 'powerup', personId),
    db.journeyGoal.findMany({ where: { personId, deletedAt: null, cycle }, select: { kind: true, title: true, progress: true } }),
    db.healthCheckin.findMany({ where: { personId }, orderBy: { createdAt: 'desc' }, take: 8 }),
    db.personEvent.groupBy({ by: ['type'], where: { personId, archivedAt: null }, _count: { _all: true } }),
    db.personEvent.findFirst({ where: { personId, archivedAt: null }, orderBy: { date: 'desc' }, select: { title: true, type: true, date: true } }),
    db.journeyGoal.findMany({ where: { personId, deletedAt: null, cycle, kind: 'FOCO' }, select: { title: true } }),
    db.squadCard.findMany({ where: { deck: 'FRENTE', championPersonId: personId, deletedAt: null, status: 'ABERTA', squad: { projectId, deletedAt: null } }, orderBy: { createdAt: 'asc' }, select: { id: true, title: true, level: true, squad: { select: { id: true, name: true } } } }),
  ]);
  const eventCount = eventsByType.reduce((a, g) => a + g._count._all, 0);
  const nEv = (t: string) => eventsByType.find((g) => g.type === t)?._count._all ?? 0;
  const avgH = (h: { saude: number; design: number; produto: number; negocio: number }) => (h.saude + h.design + h.produto + h.negocio) / 4;
  const healthLast = healthRows[0] ?? null;
  const healthPrev = healthLast ? healthRows.find((h) => h.cycle !== healthLast.cycle) ?? null : null;
  const DIM_LOW: Record<string, string> = { saude: 'Saúde em baixa', design: 'Clareza de design em baixa', produto: 'Clareza de produto em baixa', negocio: 'Clareza de negócio em baixa' };
  const lowDim = healthLast ? (['saude', 'design', 'produto', 'negocio'] as const).filter((d) => healthLast[d] <= 2).sort((a, b) => healthLast[a] - healthLast[b])[0] : null;
  const skills = project.skills.map((s) => ({ name: s.name, self: ratings.find((r) => r.skillId === s.id)?.selfScore ?? 0 }));
  const rated = skills.filter((s) => s.self > 0);
  return (
    <ProfileClient
      user={{ name: user.name, email: user.email, role: user.role, avatar: user.avatar as any }}
      project={{ id: projectId, name: project.name, skills: project.skills.map((s) => s.name) }}
      person={{ id: person.id, name: person.name, title: person.title ?? '', avatar: (person.avatar as any) ?? null, mainSkill: person.mainSkill ?? '', joinedAt: person.joinedAt ? person.joinedAt.toISOString() : null, createdAt: person.createdAt.toISOString(), squads: person.squads.filter((m) => !m.squad.deletedAt).map((m) => ({ id: m.squad.id, name: m.squad.name, color: m.squad.color, crown: m.crown })) }}
      champions={champFrentes.map((c) => ({ id: c.id, title: c.title, pct: (c.level ?? 1) * 20, squadId: c.squad.id, squadName: c.squad.name }))}
      isOwn={isOwn} isManager={isManager} squadOptions={squadOptions}
      powerUps={powerUps.map((p) => ({ id: p.id, type: p.type, name: p.name, skill: p.skill ?? '', frequency: p.frequency ?? '', progress: p.progress }))}
      skillsSummary={{ cycle, total: skills.length, top: rated.slice(0, 3), avg: rated.length ? rated.reduce((a, s) => a + s.self, 0) / rated.length : 0, rated: rated.length }}
      studySummary={{ total: study.length, active: study.filter((s) => s.progress < s.total).length, latest: study[0] ? { title: study[0].title, type: study[0].type, pct: Math.round((study[0].progress / study[0].total) * 100) } : null }}
      deliverySummary={{ total: deliveries.length, delivered: deliveries.filter((d) => d.status === 'ENTREGUE').length, paused: deliveries.filter((d) => d.status === 'PAUSADA').length, latest: deliveries[0] ? { title: deliveries[0].title } : null }}
      journeySummary={{ done: goalsAll.filter((g) => g.kind === 'OBJETIVO' && g.progress >= 5).length, focos: focos.map((x) => x.title),  total: goalsAll.length, goals: goalsAll.filter((g) => g.kind === 'OBJETIVO').length, avg: goalsAll.filter((g) => g.kind === 'OBJETIVO').length ? Math.round((goalsAll.filter((g) => g.kind === 'OBJETIVO').reduce((a, g) => a + g.progress, 0) / (goalsAll.filter((g) => g.kind === 'OBJETIVO').length * 5)) * 100) : 0, first: goalsAll[0]?.title ?? null }}
      healthSummary={healthLast ? { avg: avgH(healthLast), cycle: healthLast.cycle, current: healthLast.cycle === cycle, low: lowDim ? DIM_LOW[lowDim] : null, delta: healthPrev ? avgH(healthLast) - avgH(healthPrev) : null, prevCycle: healthPrev?.cycle ?? null } : null}
      eventSummary={{ total: eventCount + deliveries.filter((d) => d.status === 'ENTREGUE').length, last: lastEvent ? { title: lastEvent.title, type: lastEvent.type, date: lastEvent.date.toISOString().slice(0, 10) } : null, checkins: nEv('CHECKIN'), feedbacks: nEv('FEEDBACK') }}
      draft={draft}
    />
  );
}
