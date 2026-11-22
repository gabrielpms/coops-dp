import { db } from './db';

export type ProjectManager = { name: string; isMe: boolean };

/**
 * Quem é o "seu manager" neste projeto, para exibir o nome na interface.
 * 1) o usuário é o dono do projeto → ele mesmo; 2) a liderança à qual a pessoa está ligada (Time › Lideranças);
 * 3) sem liderança definida, o dono (manager) do projeto.
 */
export async function resolveProjectManager(project: { id: string; ownerId: string; owner: { name: string } }, userId: string): Promise<ProjectManager> {
  if (project.ownerId === userId) return { name: project.owner.name, isMe: true };
  const me = await db.person.findFirst({
    where: { projectId: project.id, userId, deletedAt: null },
    select: { reportsTo: { where: { leadership: { deletedAt: null } }, select: { leadership: { select: { person: { select: { name: true, userId: true, deletedAt: true } } } } } } },
  });
  const lead = me?.reportsTo.map((r) => r.leadership.person).find((p) => !p.deletedAt);
  if (lead) return { name: lead.name, isMe: lead.userId === userId };
  return { name: project.owner.name, isMe: false };
}
