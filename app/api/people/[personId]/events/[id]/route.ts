import { db } from '@/lib/db';
import { fail, isResponse, json } from '@/lib/api/http';
import { personAccess } from '@/lib/person';

type Ctx = { params: Promise<{ personId: string; id: string }> };

// Arquivar (e desarquivar): o manager, ou quem criou o evento.
export async function PATCH(req: Request, { params }: Ctx) {
  const { personId, id } = await params;
  const ctx = await personAccess(personId);
  if (isResponse(ctx)) return ctx;
  const ev = await db.personEvent.findFirst({ where: { id, personId } });
  if (!ev) return fail(404, 'Evento não encontrado');
  if (!ctx.isManager && ev.createdById !== ctx.user.id) return fail(403, 'Só quem registrou ou o manager arquiva');
  const raw = await req.json().catch(() => null);
  if (typeof raw?.archived !== 'boolean') return fail(400, 'Dados inválidos');
  await db.personEvent.update({ where: { id }, data: { archivedAt: raw.archived ? new Date() : null } });
  return json({ ok: true });
}
