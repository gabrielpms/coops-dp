import { db } from '@/lib/db';
import { fail, isResponse, json } from '@/lib/api/http';
import { initiativeAccess } from '@/lib/initiatives';
import { identifyMoment } from '@/lib/agentStub';

type Ctx = { params: Promise<{ id: string }> };

/** "Identificar o momento" (análise fixa por enquanto; salva o resultado para não recalcular). */
export async function POST(_: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await initiativeAccess(id, true);
  if (isResponse(ctx)) return ctx;
  if (!ctx.initiative.tableOpenedAt) return fail(409, 'Abra a mesa antes de identificar o momento.');
  const [cards, doubts] = await Promise.all([db.contextCard.count({ where: { initiativeId: id } }), db.agentDoubt.count({ where: { initiativeId: id, resolved: true } })]);
  const r = identifyMoment(cards, doubts);
  await db.initiative.update({ where: { id }, data: { moment: r.moment, momentReason: r.reason } });
  return json(r);
}
