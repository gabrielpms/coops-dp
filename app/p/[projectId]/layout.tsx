import type { ReactNode } from 'react';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere } from '@/lib/projects';
import { resolveProjectManager } from '@/lib/manager';
import { syncPersonAvatar } from '@/lib/avatarSync';
import { ProjectProvider } from '@/components/ds/ProjectContext';

export default async function ProjectLayout({ children, params }: { children: ReactNode; params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const u = await currentUser();
  if (!u) return <>{children}</>; // a página redireciona para o cadastro
  const [project, me] = await Promise.all([
    db.project.findFirst({ where: { id: projectId, ...accessibleWhere(u.id) }, select: { id: true, name: true, ownerId: true, owner: { select: { name: true } } } }),
    db.person.findFirst({ where: { projectId, userId: u.id, deletedAt: null }, select: { id: true } }),
  ]);
  if (!project) return <>{children}</>; // a página responde 404
  if (me) await syncPersonAvatar(u.id, projectId, u.avatar as Record<string, unknown> | null).catch(() => {});
  const manager = await resolveProjectManager(project, u.id);
  return <ProjectProvider value={{ id: project.id, name: project.name, mePersonId: me?.id ?? null, manager }}>{children}</ProjectProvider>;
}
