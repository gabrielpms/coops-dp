import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { readDrafts } from '@/lib/drafts';
import { asCycleMonths } from '@/lib/cycles';
import { AdminProjectClient } from './AdminProjectClient';

export const dynamic = 'force-dynamic';

export default async function AdminProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  if (u.role !== 'MANAGER') redirect('/admin');
  // Tudo em paralelo: só o acesso ao projeto decide se os demais dados são usados.
  const projectQuery = db.project.findFirst({
    where: { id: projectId, deletedAt: null, OR: [{ ownerId: u.id }, { persons: { some: { userId: u.id, deletedAt: null } } }] },
    include: { indicators: { orderBy: { position: 'asc' } }, competitors: { orderBy: { position: 'asc' } }, skillCategories: { orderBy: { name: 'asc' }, include: { skills: { orderBy: { position: 'asc' } } } }, skills: { orderBy: { position: 'asc' } } },
  });
  const [project, leaderships, squads, persons, drafts] = await Promise.all([
    projectQuery,
    db.leadership.findMany({ where: { projectId, deletedAt: null }, orderBy: { createdAt: 'asc' }, include: { person: true, members: true, squads: true } }),
    db.squad.findMany({ where: { projectId, deletedAt: null }, orderBy: { createdAt: 'asc' }, include: { members: true, leaderships: { include: { leadership: { include: { person: true } } } } } }),
    db.person.findMany({ where: { projectId, deletedAt: null }, orderBy: { createdAt: 'asc' }, include: { squads: { include: { squad: true } }, reportsTo: { include: { leadership: { include: { person: true } } } }, leads: true } }),
    readDrafts(u.id, [{ scope: 'leadership', entityId: projectId }, { scope: 'category', entityId: projectId }, { scope: 'pdata', entityId: projectId }, { scope: 'udata', entityId: u.id }]),
  ]);
  if (!project) notFound();
  const active = (l: { leadership: { deletedAt: Date | null } }) => !l.leadership.deletedAt;
  return (
    <AdminProjectClient
      user={{ id: u.id, name: u.name, email: u.email, title: u.title ?? '', phone: u.phone ?? '', avatar: u.avatar as any, role: u.role }}
      project={{ id: project.id, name: project.name, segment: project.segment, indicators: project.indicators.map((i) => i.name), competitors: project.competitors.map((c) => c.name), cycleMonths: asCycleMonths(project.cycleMonths) }}
      categories={project.skillCategories.map((c) => ({ id: c.id, name: c.name, skills: c.skills.map((s) => s.name) }))}
      looseSkills={project.skills.filter((s) => !s.categoryId).map((s) => s.name)}
      leaderships={leaderships.map((l) => ({ id: l.id, personId: l.personId, name: l.person.name, title: l.person.title ?? '', email: l.person.email ?? '', avatar: l.person.avatar as any, squadIds: l.squads.map((s) => s.squadId), memberIds: l.members.map((m) => m.personId), invited: !l.person.userId }))}
      squads={squads.map((s) => ({ id: s.id, name: s.name, color: s.color, personIds: s.members.map((m) => m.personId), leader: s.leaderships.filter(active)[0]?.leadership.person.name ?? null }))}
      people={persons.map((p) => ({ id: p.id, name: p.name, title: p.title ?? '', avatar: p.avatar as any, squadNames: p.squads.filter((m) => !m.squad.deletedAt).map((m) => m.squad.name), leader: p.reportsTo.filter(active)[0]?.leadership.person.name ?? null, isLeaderPerson: !!p.leads && !p.leads.deletedAt, isMe: p.userId === u.id }))}
      drafts={{ leadership: drafts[0], category: drafts[1], pdata: drafts[2], udata: drafts[3] }}
    />
  );
}
