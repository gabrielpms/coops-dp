import { db } from '@/lib/db';
import { isResponse, json, parse } from '@/lib/api/http';
import { deliverySchema, hostOf } from '@/lib/validation';
import { ownerAccess } from '@/lib/person';
import { fail } from '@/lib/api/http';

type Ctx = { params: Promise<{ personId: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { personId } = await params;
  const ctx = await ownerAccess(personId);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, deliverySchema);
  if (isResponse(body)) return body;
  if (body.initiativeId && !(await db.initiative.findFirst({ where: { id: body.initiativeId, projectId: ctx.person.projectId } }))) return fail(400, 'Iniciativa não encontrada neste projeto.');
  const d = await db.delivery.create({
    data: { personId, title: body.title, description: body.description || null, initiativeId: body.initiativeId, status: body.status, role: body.role || null, impact: body.impact || null, date: body.date ? new Date(body.date) : new Date(), createdById: ctx.user.id, updatedById: ctx.user.id,
      links: { create: body.links.map((url) => ({ url, host: hostOf(url) })) } },
  });
  await db.draft.deleteMany({ where: { userId: ctx.user.id, scope: 'delivery', entityId: personId } });
  return json({ delivery: { id: d.id } }, 201);
}
