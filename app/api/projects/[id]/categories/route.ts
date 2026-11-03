import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { categorySchema } from '@/lib/validation';
import { requireManagerOfProject } from '@/lib/team';
import { syncCategorySkills } from '@/lib/categories';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, categorySchema);
  if (isResponse(body)) return body;
  if (await db.skillCategory.findFirst({ where: { projectId: id, name: { equals: body.name, mode: 'insensitive' } } })) return fail(409, 'Já existe uma categoria com esse nome.');
  const cat = await db.$transaction(async (tx) => {
    const c = await tx.skillCategory.create({ data: { projectId: id, name: body.name } });
    await syncCategorySkills(tx, id, c.id, body.skills);
    return c;
  });
  await db.draft.deleteMany({ where: { userId: ctx.user.id, scope: 'category', entityId: id } });
  return json({ category: { id: cat.id } }, 201);
}
