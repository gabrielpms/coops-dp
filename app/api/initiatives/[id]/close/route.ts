import { db } from '@/lib/db';
import { isResponse, json, parse } from '@/lib/api/http';
import { initiativeAccess } from '@/lib/initiatives';
import { closeSchema } from '@/lib/validation';

type Ctx = { params: Promise<{ id: string }> };

/** "Finalizar e registrar no perfil". */
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await initiativeAccess(id, true);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, closeSchema);
  if (isResponse(body)) return body;
  await db.initiative.update({ where: { id }, data: { status: 'ENCERRADA', closeOutcome: body.outcome, closeNote: body.note || null, closedAt: new Date() } });
  return json({ ok: true });
}

/** "Reabrir". */
export async function DELETE(_: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await initiativeAccess(id, true);
  if (isResponse(ctx)) return ctx;
  await db.initiative.update({ where: { id }, data: { status: 'ABERTA', closeOutcome: null, closeNote: null, closedAt: null } });
  return json({ ok: true });
}
