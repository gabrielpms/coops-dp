import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { eventSchema } from '@/lib/validation';
import { personAccess } from '@/lib/person';

type Ctx = { params: Promise<{ personId: string }> };

// O manager registra os eventos (check-in, promoção, mérito, mudança); feedback: manager ou a própria pessoa.
export async function POST(req: Request, { params }: Ctx) {
  const { personId } = await params;
  const ctx = await personAccess(personId);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, eventSchema);
  if (isResponse(body)) return body;
  if (!ctx.isManager && !(ctx.isOwn && body.type === 'FEEDBACK')) return fail(403, 'Só o manager registra este tipo de evento');
  const { type, title, date, ...data } = body;
  const e = await db.personEvent.create({ data: { personId, type, title, date: date ? new Date(date) : new Date(), data, createdById: ctx.user.id } });
  await db.draft.deleteMany({ where: { userId: ctx.user.id, scope: `event:${type}`, entityId: personId } });
  return json({ event: { id: e.id } }, 201);
}
