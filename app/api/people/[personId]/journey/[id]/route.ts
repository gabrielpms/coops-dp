import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { journeyPatchSchema } from '@/lib/validation';
import { ownerAccess } from '@/lib/person';

type Ctx = { params: Promise<{ personId: string; id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { personId, id } = await params;
  const ctx = await ownerAccess(personId);
  if (isResponse(ctx)) return ctx;
  const b = await parse(req, journeyPatchSchema);
  if (isResponse(b)) return b;
  const r = await db.journeyGoal.updateMany({ where: { id, personId, deletedAt: null }, data: { progress: b.progress } });
  return r.count ? json({ ok: true }) : fail(404, 'Carta não encontrada');
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { personId, id } = await params;
  const ctx = await ownerAccess(personId);
  if (isResponse(ctx)) return ctx;
  const r = await db.journeyGoal.updateMany({ where: { id, personId, deletedAt: null }, data: { deletedAt: new Date() } });
  return r.count ? json({ ok: true }) : fail(404, 'Carta não encontrada');
}
