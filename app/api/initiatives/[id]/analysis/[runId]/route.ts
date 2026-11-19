import { db } from '@/lib/db';
import { fail, isResponse, json } from '@/lib/api/http';
import { initiativeAccess } from '@/lib/initiatives';
import { publicRun } from '@/lib/agent/runs';

type Ctx = { params: Promise<{ id: string; runId: string }> };

export async function GET(_: Request, { params }: Ctx) {
  const { id, runId } = await params;
  const ctx = await initiativeAccess(id, false);
  if (isResponse(ctx)) return ctx;
  const run = await db.agentRun.findFirst({ where: { id: runId, initiativeId: id } });
  if (!run) return fail(404, 'Execução não encontrada.');
  return json({ run: publicRun(run) });
}
