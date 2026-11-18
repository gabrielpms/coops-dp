import type { Prisma } from '@prisma/client';
import { db } from './db';

/** O squad existe neste projeto e não foi excluído? */
export async function squadInProject(projectId: string, squadId: string): Promise<boolean> {
  return (await db.squad.count({ where: { id: squadId, projectId, deletedAt: null } })) > 0;
}

/** Coloca a pessoa em um squad do projeto (ou tira de todos com `null`). Quem estava em outro squad muda para este; a coroa só é mantida se já estava no squad. */
export async function placeInSquad(tx: Prisma.TransactionClient, projectId: string, personId: string, squadId: string | null, crown = false): Promise<void> {
  await tx.squadMembership.deleteMany({ where: { personId, squad: { projectId }, ...(squadId ? { NOT: { squadId } } : {}) } });
  if (squadId) await tx.squadMembership.upsert({ where: { squadId_personId: { squadId, personId } }, create: { squadId, personId, crown }, update: {} });
}
