import type { Prisma } from '@prisma/client';

/** Deixa na categoria exatamente as skills pedidas: reaproveita as do projeto (mesmo nome), cria as que faltam e solta as que saíram. */
export async function syncCategorySkills(tx: Prisma.TransactionClient, projectId: string, categoryId: string, names: string[]) {
  const unique = names.filter((n, i, a) => a.findIndex((x) => x.toLowerCase() === n.toLowerCase()) === i);
  const existing = await tx.skill.findMany({ where: { projectId } });
  let next = existing.reduce((m, s) => Math.max(m, s.position), -1) + 1;
  const keep: string[] = [];
  for (const name of unique) {
    const hit = existing.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (hit) { await tx.skill.update({ where: { id: hit.id }, data: { categoryId } }); keep.push(hit.id); }
    else { const c = await tx.skill.create({ data: { projectId, categoryId, name, position: next++ } }); keep.push(c.id); }
  }
  await tx.skill.updateMany({ where: { projectId, categoryId, id: { notIn: keep } }, data: { categoryId: null } });
}
