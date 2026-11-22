import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere, projectInclude, serializeProject } from '@/lib/projects';
import { readProjectDraft } from '@/lib/drafts';
import { resolveProjectManager } from '@/lib/manager';
import { HubClient } from './HubClient';

export const dynamic = 'force-dynamic';

export default async function HubPage() {
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  const [rows, draft] = await Promise.all([
    db.project.findMany({ where: accessibleWhere(u.id), include: { ...projectInclude, owner: { select: { name: true } } }, orderBy: { createdAt: 'asc' } }),
    u.role === 'MANAGER' ? readProjectDraft(u.id) : null,
  ]);
  if (!rows.length && u.role === 'MANAGER' && u.onboardingStep < 3) redirect('/primeiro-acesso');
  const managers = await Promise.all(rows.map((r) => resolveProjectManager(r, u.id)));
  return <HubClient user={{ name: u.name, email: u.email, role: u.role, avatar: u.avatar as any }} projects={rows.map((r, i) => ({ ...serializeProject(r), manager: managers[i] }))} draft={draft} />;
}
