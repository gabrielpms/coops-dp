import { db } from '@/lib/db';
import { fail, isResponse, json } from '@/lib/api/http';
import { personAccess } from '@/lib/person';

type Ctx = { params: Promise<{ personId: string; id: string }> };

export async function DELETE(_: Request, { params }: Ctx) {
  const { personId, id } = await params;
  const ctx = await personAccess(personId);
  if (isResponse(ctx)) return ctx;
  const r = await db.powerUp.updateMany({ where: { id, personId, deletedAt: null }, data: { deletedAt: new Date() } });
  return r.count ? json({ ok: true }) : fail(404, 'Power up não encontrado');
}
