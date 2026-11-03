import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { studyPatchSchema } from '@/lib/validation';
import { ownerAccess } from '@/lib/person';

type Ctx = { params: Promise<{ personId: string; id: string }> };

// Progresso (+/−) e anotações: salvos na hora (PRD 6.2, regra 4).
export async function PATCH(req: Request, { params }: Ctx) {
  const { personId, id } = await params;
  const ctx = await ownerAccess(personId);
  if (isResponse(ctx)) return ctx;
  const cur = await db.studyItem.findFirst({ where: { id, personId, deletedAt: null } });
  if (!cur) return fail(404, 'Conteúdo não encontrado');
  const body = await parse(req, studyPatchSchema);
  if (isResponse(body)) return body;
  await db.studyItem.update({ where: { id }, data: { ...(body.progress !== undefined ? { progress: Math.min(body.progress, cur.total) } : {}), ...(body.notes !== undefined ? { notes: body.notes || null } : {}) } });
  return json({ ok: true });
}

// "Remover do deck": soft delete
export async function DELETE(_: Request, { params }: Ctx) {
  const { personId, id } = await params;
  const ctx = await ownerAccess(personId);
  if (isResponse(ctx)) return ctx;
  const r = await db.studyItem.updateMany({ where: { id, personId, deletedAt: null }, data: { deletedAt: new Date() } });
  return r.count ? json({ ok: true }) : fail(404, 'Conteúdo não encontrado');
}
