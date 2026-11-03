import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere } from '@/lib/projects';
import { readDraft } from '@/lib/drafts';
import { TimeClient, type TimePerson, type TimeSquad } from './TimeClient';
import type { MemberDraft } from '@/components/team/MemberDeck';
import type { SquadDraft } from '@/components/team/SquadDeck';

export const dynamic = 'force-dynamic';

export default async function TimePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  if (u.role !== 'MANAGER') redirect('/hub'); // IC vê só os próprios decks
  const project = await db.project.findFirst({ where: { id: projectId, ...accessibleWhere(u.id) }, include: { skills: { orderBy: { position: 'asc' } } } });
  if (!project) notFound();

  const [persons, squads, memberDraft, squadDraft] = await Promise.all([
    db.person.findMany({ where: { projectId, deletedAt: null }, orderBy: { createdAt: 'asc' }, include: { squads: { include: { squad: { select: { id: true, name: true, color: true, deletedAt: true } } } } } }),
    db.squad.findMany({ where: { projectId, deletedAt: null }, orderBy: { createdAt: 'asc' }, include: { members: { include: { person: true } } } }),
    readDraft<any>(u.id, 'member', projectId),
    readDraft<any>(u.id, 'squad', projectId),
  ]);

  const people: TimePerson[] = persons.map((p) => ({
    id: p.id, name: p.name, title: p.title ?? '', avatar: (p.avatar as any) ?? null, mainSkill: p.mainSkill ?? '', joinedAt: p.joinedAt ? p.joinedAt.toISOString() : null,
    isMe: p.userId === u.id, invited: !p.userId && !!p.email,
    squadIds: p.squads.filter((m) => !m.squad.deletedAt).map((m) => m.squad.id),
  }));
  const squadList: TimeSquad[] = squads.map((s) => ({
    id: s.id, name: s.name, color: s.color,
    members: s.members.filter((m) => !m.person.deletedAt).map((m) => ({ personId: m.personId, crown: m.crown })),
  }));
  return (
    <TimeClient
      user={{ id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar as any }}
      project={{ id: project.id, name: project.name, skills: project.skills.map((s) => s.name) }}
      persons={people} squads={squadList} memberDraft={memberDraft as MemberDraft | null} squadDraft={squadDraft as SquadDraft | null}
    />
  );
}
