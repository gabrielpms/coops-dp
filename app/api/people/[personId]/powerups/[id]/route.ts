import { db } from '@/lib/db';
import { fail, isResponse, json } from '@/lib/api/http';
import { personAccess } from '@/lib/person';

type Ctx = { params: Promise<{ personId: string; id: string }> };

export async function DELETE(_: Request, { params }: Ctx) {
  const { personId, id } = await params;
  const ctx = await personAccess(personId);
  if (isResponse(ctx)) return ctx;
  const now = new Date();
  const r = await db.powerUp.updateMany({ where: { id, personId, deletedAt: null }, data: { deletedAt: now } });
  if (r.count) await db.studyItem.updateMany({ where: { powerUpId: id, personId, deletedAt: null }, data: { deletedAt: now } });
  return r.count ? json({ ok: true }) : fail(404, 'Power up não encontrado');
}
