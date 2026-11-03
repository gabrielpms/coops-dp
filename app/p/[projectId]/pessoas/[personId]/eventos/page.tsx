import { db } from '@/lib/db';
import { loadPersonPage } from '@/lib/person';
import { readDraft } from '@/lib/drafts';
import { EventosClient, type EventView } from './EventosClient';

export const dynamic = 'force-dynamic';
const KINDS = ['CHECKIN', 'FEEDBACK', 'PROMOCAO', 'MERITO', 'MUDANCA_TIME'] as const;

export default async function EventosPage({ params }: { params: Promise<{ projectId: string; personId: string }> }) {
  const { projectId, personId } = await params;
  const { user, person, isOwn, isManager } = await loadPersonPage(projectId, personId);
  const [events, deliveries, drafts] = await Promise.all([
    db.personEvent.findMany({ where: { personId }, orderBy: { date: 'desc' }, include: { comments: { orderBy: { createdAt: 'asc' } } } }),
    db.delivery.findMany({ where: { personId, deletedAt: null, status: 'ENTREGUE' }, orderBy: { date: 'desc' }, select: { id: true, title: true, description: true, date: true } }),
    isManager ? Promise.all(KINDS.map((k) => readDraft<any>(user.id, `event:${k}`, personId))) : isOwn ? Promise.all([null, null, null, null, null].map((_, i) => (i === 1 ? readDraft<any>(user.id, 'event:FEEDBACK', personId) : null))) : [null, null, null, null, null],
  ]);
  // Entregas aparecem como eventos (derivados: não são gravados aqui)
  const list: EventView[] = [
    ...events.map((e) => ({ id: e.id, type: e.type as EventView['type'], title: e.title, date: e.date.toISOString().slice(0, 10), data: (e.data as any) ?? {}, archived: !!e.archivedAt, mine: e.createdById === user.id, comments: e.comments.map((c) => ({ id: c.id, authorName: c.authorName, text: c.text, createdAt: c.createdAt.toISOString() })) })),
    ...deliveries.map((d) => ({ id: `d-${d.id}`, type: 'ENTREGA' as const, title: d.title, date: d.date.toISOString().slice(0, 10), data: { body: d.description ?? '' }, archived: false, mine: false, comments: [] })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <EventosClient
      user={{ name: user.name, email: user.email, role: user.role, avatar: user.avatar as any }}
      person={{ id: person.id, name: person.name, avatar: (person.avatar as any) ?? null }} projectId={projectId} isOwn={isOwn} isManager={isManager} events={list}
      drafts={Object.fromEntries(KINDS.map((k, i) => [k, (drafts as any[])[i] ?? null]))}
    />
  );
}
