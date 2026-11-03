import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere, projectInclude, serializeProject } from '@/lib/projects';
import { readDraft, readProjectDraft } from '@/lib/drafts';
import { AdminClient } from './AdminClient';
import type { UserDraft } from '@/components/admin/UserDeck';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  const isManager = u.role === 'MANAGER';
  const rows = isManager ? await db.project.findMany({ where: { ...accessibleWhere(u.id), ownerId: u.id }, include: projectInclude, orderBy: { createdAt: 'asc' } }) : [];
  const ids = rows.map((r) => r.id);
  const [leads, cats, projectDraft, userDraft] = await Promise.all([
    ids.length ? db.leadership.groupBy({ by: ['projectId'], where: { projectId: { in: ids }, deletedAt: null }, _count: true }) : [],
    ids.length ? db.skillCategory.groupBy({ by: ['projectId'], where: { projectId: { in: ids } }, _count: true }) : [],
    isManager ? readProjectDraft(u.id) : null,
    readDraft<any>(u.id, 'udata', u.id),
  ]);
  const projects = rows.map((r) => ({ ...serializeProject(r), leaderships: leads.find((l) => l.projectId === r.id)?._count ?? 0, categories: cats.find((c) => c.projectId === r.id)?._count ?? 0 }));
  return (
    <AdminClient
      user={{ id: u.id, name: u.name, email: u.email, title: u.title ?? '', phone: u.phone ?? '', avatar: u.avatar as any, role: u.role }}
      projects={projects} projectDraft={projectDraft} userDraft={userDraft as UserDraft | null}
    />
  );
}
