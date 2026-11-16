import { db } from '@/lib/db';
import { fail, isResponse, json } from '@/lib/api/http';
import { initiativeAccess } from '@/lib/initiatives';

type Ctx = { params: Promise<{ id: string }> };

/** "Isso mesmo, abrir a mesa": só com todas as dúvidas resolvidas. */
export async function POST(_: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await initiativeAccess(id, true);
  if (isResponse(ctx)) return ctx;
  const open = await db.agentDoubt.count({ where: { initiativeId: id, resolved: false } });
  if (open) return fail(409, `Faltam resolver ${open} ${open === 1 ? 'dúvida' : 'dúvidas'}.`);
  await db.initiative.update({ where: { id }, data: { tableOpenedAt: new Date() } });
  return json({ ok: true });
}
