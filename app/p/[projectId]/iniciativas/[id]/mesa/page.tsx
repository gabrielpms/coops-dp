import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere } from '@/lib/projects';
import { projectReadiness } from '@/lib/agent/readiness';
import { MesaClient } from './MesaClient';

export const dynamic = 'force-dynamic';

export default async function MesaPage({ params }: { params: Promise<{ projectId: string; id: string }> }) {
  const { projectId, id } = await params;
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  const [readiness, done, project] = await Promise.all([
    projectReadiness(projectId, u.id),
    db.agentRun.findFirst({ where: { initiativeId: id, status: 'DONE' }, select: { id: true } }),
    db.project.findUnique({ where: { id: projectId }, select: { ownerId: true } }),
  ]);
  const i = await db.initiative.findFirst({
    where: { id, projectId, project: accessibleWhere(u.id) },
    include: { contextCards: true, attachments: { where: { uploaded: true }, orderBy: { createdAt: 'asc' } }, doubts: { where: { resolved: true }, orderBy: { position: 'asc' } } },
  });
  if (!i) notFound();
  if (!i.tableOpenedAt) redirect(`/p/${projectId}/iniciativas/${id}`);
  return (
    <MesaClient
      user={{ name: u.name, email: u.email, role: u.role, avatar: u.avatar as any }} projectId={projectId}
      initiative={{ id: i.id, product: i.product, problem: i.problem ?? '', need: i.need || i.deducedNeed || '', status: i.status, moment: i.moment, momentReason: i.momentReason ?? '', closeOutcome: i.closeOutcome, closeNote: i.closeNote ?? '' }}
      readiness={readiness} hasAnalysis={!!done} isOwner={project?.ownerId === u.id}
      cards={i.contextCards.map((c) => ({ kind: c.kind, text: c.text, links: c.links }))}
      attachments={i.attachments.map((a) => ({ id: a.id, kind: a.kind, name: a.name, size: a.size }))}
      resolved={i.doubts.map((d) => ({ question: d.question, summary: d.summary ?? '' }))}
    />
  );
}
