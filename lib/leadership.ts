import type { Prisma } from '@prisma/client';

/** Squads e pessoas pertencem a uma única liderança: ao associar, saem da anterior. */
export async function setLeadershipLinks(tx: Prisma.TransactionClient, leadershipId: string, projectId: string, squadIds: string[], memberIds: string[]) {
  const [squads, people] = await Promise.all([
    tx.squad.count({ where: { id: { in: squadIds }, projectId, deletedAt: null } }),
    tx.person.count({ where: { id: { in: memberIds }, projectId, deletedAt: null } }),
  ]);
  if (squads !== squadIds.length || people !== memberIds.length) throw new Error('INVALID_LINKS');
  await tx.leadershipSquad.deleteMany({ where: { OR: [{ leadershipId }, { squadId: { in: squadIds } }] } });
  await tx.leadershipMember.deleteMany({ where: { OR: [{ leadershipId }, { personId: { in: memberIds } }] } });
  await tx.leadershipSquad.createMany({ data: squadIds.map((squadId) => ({ leadershipId, squadId })) });
  await tx.leadershipMember.createMany({ data: memberIds.map((personId) => ({ leadershipId, personId })) });
}
