import { db } from '@/lib/db';
import { loadPersonPage } from '@/lib/person';
import { readDraft } from '@/lib/drafts';
import { EntregasClient } from './EntregasClient';

export const dynamic = 'force-dynamic';

export default async function EntregasPage({ params }: { params: Promise<{ projectId: string; personId: string }> }) {
  const { projectId, personId } = await params;
  const { user, person, isOwn } = await loadPersonPage(projectId, personId);
  const [deliveries, initiatives, draft] = await Promise.all([
    db.delivery.findMany({ where: { personId, deletedAt: null }, orderBy: { date: 'desc' }, include: { links: true, initiative: { select: { id: true, product: true } } } }),
    db.initiative.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' }, select: { id: true, product: true } }),
    isOwn ? readDraft<any>(user.id, 'delivery', personId) : null,
  ]);
  return (
    <EntregasClient
      user={{ name: user.name, email: user.email, role: user.role, avatar: user.avatar as any }}
      person={{ id: person.id, name: person.name, avatar: (person.avatar as any) ?? null, squad: person.squads.find((m) => !m.squad.deletedAt)?.squad.name ?? '' }}
      projectId={projectId} isOwn={isOwn}
      initiatives={initiatives.map((i) => ({ id: i.id, title: i.product }))}
      deliveries={deliveries.map((d) => ({ id: d.id, title: d.title, description: d.description ?? '', initiativeId: d.initiativeId ?? '', initiativeTitle: d.initiative?.product ?? null, status: d.status, role: d.role ?? '', impact: d.impact ?? '', date: d.date.toISOString().slice(0, 10), links: d.links.map((l) => l.url) }))}
      draft={draft}
    />
  );
}
