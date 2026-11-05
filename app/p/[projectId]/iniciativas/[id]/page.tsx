import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere } from '@/lib/projects';
import { ConfereClient } from './ConfereClient';

export const dynamic = 'force-dynamic';

export default async function ConferePage({ params }: { params: Promise<{ projectId: string; id: string }> }) {
  const { projectId, id } = await params;
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  const i = await db.initiative.findFirst({
    where: { id, projectId, project: accessibleWhere(u.id) },
    include: { doubts: { orderBy: { position: 'asc' }, include: { messages: { orderBy: { createdAt: 'asc' } } } } },
  });
  if (!i) notFound();
  return (
    <ConfereClient
      user={{ name: u.name, email: u.email, role: u.role, avatar: u.avatar as any }} projectId={projectId}
      initiative={{ id: i.id, product: i.product, problem: i.problem ?? '', need: i.need ?? '', deducedNeed: i.deducedNeed ?? '', tableOpened: !!i.tableOpenedAt }}
      doubts={i.doubts.map((d) => ({ id: d.id, question: d.question, resolved: d.resolved, summary: d.summary ?? '', messages: d.messages.map((m) => ({ id: m.id, role: m.role as 'USER' | 'AGENT', text: m.text })) }))}
    />
  );
}
