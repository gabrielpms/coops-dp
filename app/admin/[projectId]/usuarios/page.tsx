import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { loadManagedUsers } from '@/lib/adminUsers';
import { UsuariosClient } from './UsuariosClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsuariosPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  if (u.role !== 'MANAGER') redirect('/admin');
  const project = await db.project.findFirst({ where: { id: projectId, deletedAt: null, OR: [{ ownerId: u.id }, { persons: { some: { userId: u.id, deletedAt: null } } }] }, select: { id: true, name: true, ownerId: true } });
  if (!project) notFound();
  const [users, squads] = await Promise.all([loadManagedUsers(projectId, u.id, project.ownerId), db.squad.findMany({ where: { projectId, deletedAt: null }, orderBy: { createdAt: 'asc' }, select: { id: true, name: true, color: true } })]);
  return <UsuariosClient user={{ name: u.name, email: u.email, role: u.role, avatar: u.avatar as any }} project={{ id: project.id, name: project.name }} users={users} squads={squads} />;
}
