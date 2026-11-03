import { db } from '@/lib/db';
import { loadPersonPage } from '@/lib/person';
import { readDraft } from '@/lib/drafts';
import { currentCycle } from '@/lib/validation';
import { ProfileClient } from './ProfileClient';

export const dynamic = 'force-dynamic';

export default async function PessoaPage({ params }: { params: Promise<{ projectId: string; personId: string }> }) {
  const { projectId, personId } = await params;
  const { user, person, isOwn, isManager } = await loadPersonPage(projectId, personId);
  const cycle = currentCycle();
  const [project, powerUps, deliveries, study, ratings, draft, goalsAll, healthLast, eventCount, lastEvent] = await Promise.all([
    db.project.findUniqueOrThrow({ where: { id: projectId }, include: { skills: { orderBy: { position: 'asc' } } } }),
    db.powerUp.findMany({ where: { personId, deletedAt: null }, orderBy: { createdAt: 'desc' } }),
    db.delivery.findMany({ where: { personId, deletedAt: null }, orderBy: { date: 'desc' }, select: { title: true, status: true } }),
    db.studyItem.findMany({ where: { personId, deletedAt: null }, orderBy: { createdAt: 'desc' }, select: { title: true, type: true, progress: true, total: true } }),
    db.skillRating.findMany({ where: { personId, cycle } }),
    readDraft<any>(user.id, 'powerup', personId),
    db.journeyGoal.findMany({ where: { personId, deletedAt: null, cycle }, select: { kind: true, title: true, progress: true } }),
    db.healthCheckin.findFirst({ where: { personId }, orderBy: { createdAt: 'desc' } }),
    db.personEvent.count({ where: { personId, archivedAt: null } }),
    db.personEvent.findFirst({ where: { personId, archivedAt: null }, orderBy: { date: 'desc' }, select: { title: true, type: true } }),
  ]);
  const skills = project.skills.map((s) => ({ name: s.name, self: ratings.find((r) => r.skillId === s.id)?.selfScore ?? 0 }));
  const rated = skills.filter((s) => s.self > 0);
  return (
    <ProfileClient
      user={{ name: user.name, email: user.email, role: user.role, avatar: user.avatar as any }}
      project={{ id: projectId, name: project.name, skills: project.skills.map((s) => s.name) }}
      person={{ id: person.id, name: person.name, title: person.title ?? '', avatar: (person.avatar as any) ?? null, mainSkill: person.mainSkill ?? '', joinedAt: person.joinedAt ? person.joinedAt.toISOString() : null, squads: person.squads.filter((m) => !m.squad.deletedAt).map((m) => ({ id: m.squad.id, name: m.squad.name, color: m.squad.color })) }}
      isOwn={isOwn} isManager={isManager}
      powerUps={powerUps.map((p) => ({ id: p.id, type: p.type, name: p.name, skill: p.skill ?? '', frequency: p.frequency ?? '', progress: p.progress }))}
      skillsSummary={{ total: skills.length, top: rated.slice(0, 3), avg: rated.length ? rated.reduce((a, s) => a + s.self, 0) / rated.length : 0, rated: rated.length }}
      studySummary={{ total: study.length, active: study.filter((s) => s.progress < s.total).length, latest: study[0] ? { title: study[0].title, type: study[0].type, pct: Math.round((study[0].progress / study[0].total) * 100) } : null }}
      deliverySummary={{ total: deliveries.length, delivered: deliveries.filter((d) => d.status === 'ENTREGUE').length, paused: deliveries.filter((d) => d.status === 'PAUSADA').length, latest: deliveries[0] ? { title: deliveries[0].title } : null }}
      journeySummary={{ total: goalsAll.length, goals: goalsAll.filter((g) => g.kind === 'OBJETIVO').length, avg: goalsAll.filter((g) => g.kind === 'OBJETIVO').length ? Math.round((goalsAll.filter((g) => g.kind === 'OBJETIVO').reduce((a, g) => a + g.progress, 0) / (goalsAll.filter((g) => g.kind === 'OBJETIVO').length * 5)) * 100) : 0, first: goalsAll[0]?.title ?? null }}
      healthSummary={healthLast ? { avg: (healthLast.saude + healthLast.design + healthLast.produto + healthLast.negocio) / 4, cycle: healthLast.cycle } : null}
      eventSummary={{ total: eventCount + deliveries.filter((d) => d.status === 'ENTREGUE').length, last: lastEvent ? { title: lastEvent.title, type: lastEvent.type } : null }}
      draft={draft}
    />
  );
}
