import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere, projectInclude, serializeProject } from '@/lib/projects';
import { readDraft, readProjectDraft } from '@/lib/drafts';
import { AdminClient } from './AdminClient';
import { integrationState } from '@/lib/agent/settings';
import type { UserDraft } from '@/components/admin/UserDeck';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  const isManager = u.role === 'MANAGER';
  const [rows, projectDraft, userDraft] = await Promise.all([
    isManager ? db.project.findMany({ where: { ...accessibleWhere(u.id), ownerId: u.id }, include: { ...projectInclude, _count: { select: { ...projectInclude._count.select, leaderships: { where: { deletedAt: null } }, skillCategories: true } } }, orderBy: { createdAt: 'asc' } }) : [],
    isManager ? readProjectDraft(u.id) : null,
    readDraft<any>(u.id, 'udata', u.id),
  ]);
  const integ = isManager ? await integrationState(u) : null;
  const projects = rows.map((r) => ({ ...serializeProject(r), leaderships: r._count.leaderships, categories: r._count.skillCategories }));
  return (
    <AdminClient
      user={{ id: u.id, name: u.name, email: u.email, title: u.title ?? '', phone: u.phone ?? '', avatar: u.avatar as any, role: u.role }}
      integration={integ ? { configured: integ.configured, ready: integ.configured && integ.skills.every((s) => s.status === 'ENVIADA') } : null} projects={projects} projectDraft={projectDraft} userDraft={userDraft as UserDraft | null}
    />
  );
}
