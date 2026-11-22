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
  const progress = body.progress !== undefined ? Math.min(body.progress, cur.total) : undefined;
  await db.studyItem.update({ where: { id }, data: { ...(progress !== undefined ? { progress } : {}), ...(body.notes !== undefined ? { notes: body.notes || null } : {}) } });
  // conteúdo que veio de um power up: o power up acompanha o progresso (em %)
  if (progress !== undefined && cur.powerUpId) await db.powerUp.updateMany({ where: { id: cur.powerUpId, deletedAt: null }, data: { progress: Math.round((progress / cur.total) * 100) } });
  return json({ ok: true });
}

// "Remover do deck": soft delete
export async function DELETE(_: Request, { params }: Ctx) {
  const { personId, id } = await params;
  const ctx = await ownerAccess(personId);
  if (isResponse(ctx)) return ctx;
  const now = new Date();
  const item = await db.studyItem.findFirst({ where: { id, personId, deletedAt: null }, select: { powerUpId: true } });
  const r = await db.studyItem.updateMany({ where: { id, personId, deletedAt: null }, data: { deletedAt: now } });
  if (r.count && item?.powerUpId) await db.powerUp.updateMany({ where: { id: item.powerUpId, personId, deletedAt: null }, data: { deletedAt: now } });
  return r.count ? json({ ok: true }) : fail(404, 'Conteúdo não encontrado');
}
