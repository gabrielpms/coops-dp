import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere, projectInclude, serializeProject } from '@/lib/projects';
import { HubClient } from './HubClient';

export const dynamic = 'force-dynamic';

export default async function HubPage() {
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  const rows = await db.project.findMany({ where: accessibleWhere(u.id), include: projectInclude, orderBy: { createdAt: 'asc' } });
  if (!rows.length && u.role === 'MANAGER' && u.onboardingStep < 3) redirect('/primeiro-acesso');
  return <HubClient user={{ name: u.name, email: u.email, role: u.role, avatar: u.avatar as any }} projects={rows.map(serializeProject)} />;
}
