import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { squadCardSchema } from '@/lib/validation';
import { squadAccess } from '@/lib/squad';
import { checkRefs, splitCard } from '@/lib/squadCards';

type Ctx = { params: Promise<{ squadId: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { squadId } = await params;
  const ctx = await squadAccess(squadId, true);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, squadCardSchema);
  if (isResponse(body)) return body;
  const bad = await checkRefs(ctx.squad.id, ctx.squad.projectId, body);
  if (bad) return fail(400, bad);
  const c = await db.squadCard.create({ data: { squadId, ...splitCard(body), createdById: ctx.user.id, updatedById: ctx.user.id } });
  await db.draft.deleteMany({ where: { userId: ctx.user.id, scope: `squad:${body.deck}`, entityId: squadId } });
  return json({ card: { id: c.id } }, 201);
}
