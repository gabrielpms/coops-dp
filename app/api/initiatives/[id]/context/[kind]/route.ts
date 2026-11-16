import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { initiativeAccess } from '@/lib/initiatives';
import { removeObject, storageConfigured } from '@/lib/storage';
import { CONTEXT_KINDS, contextCardSchema } from '@/lib/validation';

type Ctx = { params: Promise<{ id: string; kind: string }> };
const valid = (k: string) => (CONTEXT_KINDS as readonly string[]).includes(k);

export async function PUT(req: Request, { params }: Ctx) {
  const { id, kind } = await params;
  if (!valid(kind)) return fail(404, 'Carta de contexto desconhecida');
  const ctx = await initiativeAccess(id, true);
  if (isResponse(ctx)) return ctx;
  if (!ctx.initiative.tableOpenedAt) return fail(409, 'Abra a mesa antes de adicionar cartas.');
  const body = await parse(req, contextCardSchema);
  if (isResponse(body)) return body;
  await db.contextCard.upsert({ where: { initiativeId_kind: { initiativeId: id, kind } }, create: { initiativeId: id, kind, ...body }, update: body });
  return json({ ok: true });
}

/** "Tirar da mesa". */
export async function DELETE(_: Request, { params }: Ctx) {
  const { id, kind } = await params;
  const ctx = await initiativeAccess(id, true);
  if (isResponse(ctx)) return ctx;
  const files = await db.attachment.findMany({ where: { initiativeId: id, kind } });
  if (storageConfigured()) await Promise.all(files.map((f) => removeObject(f.key).catch(() => {})));
  await db.attachment.deleteMany({ where: { initiativeId: id, kind } });
  await db.contextCard.deleteMany({ where: { initiativeId: id, kind } });
  return json({ ok: true });
}
