import { db } from './db';
import { openSecret } from './secret';
import type { ManagedUser } from '@/components/admin/AdminUserDeck';

/** Usuários que o admin gerencia num projeto: contas com carta ativa (menos a própria e a da dona do projeto) e pessoas que ainda não têm acesso. */
export async function loadManagedUsers(projectId: string, meId: string, ownerId: string): Promise<ManagedUser[]> {
  const [accounts, loose] = await Promise.all([
    db.user.findMany({ where: { persons: { some: { projectId, deletedAt: null } } }, orderBy: { createdAt: 'asc' }, select: { id: true, name: true, email: true, title: true, phone: true, role: true, avatar: true, blockedAt: true, accessPassword: true } }),
    db.person.findMany({ where: { projectId, deletedAt: null, userId: null }, orderBy: { createdAt: 'asc' }, include: { leads: true } }),
  ]);
  return [
    ...accounts.filter((a) => a.id !== meId && a.id !== ownerId).map((a) => ({ id: a.id, name: a.name, email: a.email, title: a.title ?? '', phone: a.phone ?? '', role: a.role, avatar: a.avatar as any, blocked: !!a.blockedAt, pending: false, password: openSecret(a.accessPassword) ?? '' })),
    ...loose.map((p) => ({ id: p.id, name: p.name, email: p.email ?? '', title: p.title ?? '', phone: '', role: (p.leads && !p.leads.deletedAt ? 'MANAGER' : 'IC') as 'IC' | 'MANAGER', avatar: p.avatar as any, blocked: false, pending: true, password: '' })),
  ];
}
