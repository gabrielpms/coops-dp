import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { eventCommentSchema } from '@/lib/validation';
import { personAccess } from '@/lib/person';

type Ctx = { params: Promise<{ personId: string; id: string }> };

// Comentários: a pessoa e o manager conversam no evento.
export async function POST(req: Request, { params }: Ctx) {
  const { personId, id } = await params;
  const ctx = await personAccess(personId);
  if (isResponse(ctx)) return ctx;
  if (!(await db.personEvent.findFirst({ where: { id, personId } }))) return fail(404, 'Evento não encontrado');
  const b = await parse(req, eventCommentSchema);
  if (isResponse(b)) return b;
  const c = await db.eventComment.create({ data: { eventId: id, authorId: ctx.user.id, authorName: ctx.user.name, text: b.text } });
  return json({ comment: { id: c.id, authorName: c.authorName, text: c.text, createdAt: c.createdAt.toISOString() } }, 201);
}
