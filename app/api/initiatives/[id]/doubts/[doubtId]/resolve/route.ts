import { db } from '@/lib/db';
import { fail, isResponse, json } from '@/lib/api/http';
import { initiativeAccess } from '@/lib/initiatives';
import { understoodSummary } from '@/lib/agentStub';

type Ctx = { params: Promise<{ id: string; doubtId: string }> };

/** POST: "Sim, resolver dúvida" (usa a última resposta do agente). DELETE: "Reabrir dúvida". */
export async function POST(_: Request, { params }: Ctx) {
  const { id, doubtId } = await params;
  const ctx = await initiativeAccess(id, true);
  if (isResponse(ctx)) return ctx;
  const last = await db.agentMessage.findFirst({ where: { doubtId, role: 'AGENT', doubt: { initiativeId: id } }, orderBy: { createdAt: 'desc' } });
  if (!last) return fail(400, 'Responda a dúvida antes de resolver.');
  await db.agentDoubt.update({ where: { id: doubtId }, data: { resolved: true, summary: understoodSummary(last.text) } });
  return json({ ok: true });
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { id, doubtId } = await params;
  const ctx = await initiativeAccess(id, true);
  if (isResponse(ctx)) return ctx;
  const r = await db.agentDoubt.updateMany({ where: { id: doubtId, initiativeId: id }, data: { resolved: false, summary: null } });
  if (!r.count) return fail(404, 'Dúvida não encontrada');
  await db.initiative.update({ where: { id }, data: { tableOpenedAt: null } });
  return json({ ok: true });
}
