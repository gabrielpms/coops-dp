import { fail, isResponse, json } from '@/lib/api/http';
import { initiativeAccess } from '@/lib/initiatives';
import { advanceRun } from '@/lib/agent/runs';

// Cada passo roda numa requisição própria; a tela chama de novo até a análise terminar (uma skill pode levar minutos).
export const maxDuration = 300;

type Ctx = { params: Promise<{ id: string; runId: string }> };

export async function POST(_: Request, { params }: Ctx) {
  const { id, runId } = await params;
  const ctx = await initiativeAccess(id, true);
  if (isResponse(ctx)) return ctx;
  const r = await advanceRun(runId, id);
  return 'error' in r ? fail(r.status, r.error) : json({ run: r.run });
}
