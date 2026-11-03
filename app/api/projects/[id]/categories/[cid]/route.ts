import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { categorySchema } from '@/lib/validation';
import { requireManagerOfProject } from '@/lib/team';
import { syncCategorySkills } from '@/lib/categories';

type Ctx = { params: Promise<{ id: string; cid: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { id, cid } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  const cat = await db.skillCategory.findFirst({ where: { id: cid, projectId: id } });
  if (!cat) return fail(404, 'Categoria não encontrada');
  const body = await parse(req, categorySchema);
  if (isResponse(body)) return body;
  if (await db.skillCategory.findFirst({ where: { projectId: id, id: { not: cid }, name: { equals: body.name, mode: 'insensitive' } } })) return fail(409, 'Já existe uma categoria com esse nome.');
  await db.$transaction(async (tx) => {
    await tx.skillCategory.update({ where: { id: cid }, data: { name: body.name } });
    await syncCategorySkills(tx, id, cid, body.skills);
  });
  return json({ ok: true });
}

// Remover a categoria não apaga as skills: elas ficam sem categoria.
export async function DELETE(_: Request, { params }: Ctx) {
  const { id, cid } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  const cat = await db.skillCategory.findFirst({ where: { id: cid, projectId: id } });
  if (!cat) return fail(404, 'Categoria não encontrada');
  await db.skillCategory.delete({ where: { id: cid } });
  return json({ ok: true });
}
