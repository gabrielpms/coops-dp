import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere } from '@/lib/projects';
import { toolsOf } from '@/lib/tools';
import { MomentoClient } from './MomentoClient';

export const dynamic = 'force-dynamic';

export default async function MomentoPage({ params }: { params: Promise<{ projectId: string; id: string }> }) {
  const { projectId, id } = await params;
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  const i = await db.initiative.findFirst({
    where: { id, projectId, project: accessibleWhere(u.id) },
    include: { plays: { include: { cards: { orderBy: { position: 'asc' } } } } },
  });
  if (!i) notFound();
  if (!i.tableOpenedAt || !i.moment) redirect(`/p/${projectId}/iniciativas/${id}/mesa`);
  return (
    <MomentoClient
      user={{ name: u.name, email: u.email, role: u.role, avatar: u.avatar as any }} projectId={projectId}
      initiative={{ id: i.id, product: i.product, moment: i.moment, reason: i.momentReason ?? '', closed: i.status === 'ENCERRADA' }}
      tools={toolsOf(i.moment)}
      plays={i.plays.map((p) => ({ id: p.id, toolId: p.toolId, cards: p.cards.map((c) => ({ id: c.id, title: c.title, tag: c.tag, description: c.description, impact: c.impact, effort: c.effort, metric: c.metric, nextStep: c.nextStep, decision: c.decision as 'KEPT' | 'DISCARDED' | null, note: c.note ?? '' })) }))}
    />
  );
}
