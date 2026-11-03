import { db } from '@/lib/db';
import { draftSchema } from '@/lib/validation';
import { isResponse, json, parse, requireUser } from '@/lib/api/http';
import { Prisma } from '@prisma/client';

const key = (u: string, url: URL) => ({ userId_scope_entityId: { userId: u, scope: url.searchParams.get('scope') ?? '', entityId: url.searchParams.get('entityId') ?? '' } });

export async function GET(req: Request) {
  const u = await requireUser();
  if (isResponse(u)) return u;
  const d = await db.draft.findUnique({ where: key(u.id, new URL(req.url)) });
  return json({ draft: d ? { payload: d.payload, updatedAt: d.updatedAt } : null });
}

export async function PUT(req: Request) {
  const u = await requireUser();
  if (isResponse(u)) return u;
  const b = await parse(req, draftSchema);
  if (isResponse(b)) return b;
  const payload = b.payload as Prisma.InputJsonValue;
  await db.draft.upsert({
    where: { userId_scope_entityId: { userId: u.id, scope: b.scope, entityId: b.entityId } },
    create: { userId: u.id, scope: b.scope, entityId: b.entityId, payload }, update: { payload },
  });
  return json({ ok: true });
}

export async function DELETE(req: Request) {
  const u = await requireUser();
  if (isResponse(u)) return u;
  await db.draft.deleteMany({ where: { userId: u.id, scope: new URL(req.url).searchParams.get('scope') ?? '', entityId: new URL(req.url).searchParams.get('entityId') ?? '' } });
  return json({ ok: true });
}
