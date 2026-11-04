import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere } from '@/lib/projects';
import { readDraft } from '@/lib/drafts';
import { IniciativasClient } from './IniciativasClient';
import type { InitiativeDraft } from '@/components/initiative/InitiativeDeck';

export const dynamic = 'force-dynamic';

export default async function IniciativasPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  const project = await db.project.findFirst({ where: { id: projectId, ...accessibleWhere(u.id) }, select: { id: true, name: true } });
  if (!project) notFound();
  const [items, draft] = await Promise.all([
    db.initiative.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } }),
    u.role === 'MANAGER' ? readDraft<InitiativeDraft['form']>(u.id, 'initiative', projectId) : null,
  ]);
  return (
    <IniciativasClient
      user={{ name: u.name, email: u.email, role: u.role, avatar: u.avatar as any }} project={project}
      items={items.map((i) => ({ id: i.id, product: i.product, problem: i.problem ?? '', status: i.status, moment: i.moment, createdAt: i.createdAt.toISOString() }))}
      draft={draft as InitiativeDraft | null}
    />
  );
}
