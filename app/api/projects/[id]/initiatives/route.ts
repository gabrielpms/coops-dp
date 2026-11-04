import { db } from '@/lib/db';
import { isResponse, json, parse } from '@/lib/api/http';
import { initiativeSchema } from '@/lib/validation';
import { requireManagerOfProject } from '@/lib/team';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, initiativeSchema);
  if (isResponse(body)) return body;
  const i = await db.initiative.create({ data: { projectId: id, product: body.product, problem: body.problem || null, need: body.need || null } });
  await db.draft.deleteMany({ where: { userId: ctx.user.id, scope: 'initiative', entityId: id } });
  return json({ initiative: { id: i.id } }, 201);
}
