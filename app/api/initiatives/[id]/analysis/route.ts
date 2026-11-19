import { fail, isResponse, json } from '@/lib/api/http';
import { initiativeAccess } from '@/lib/initiatives';
import { engineFor, latestRun, publicRun, startRun } from '@/lib/agent/runs';

type Ctx = { params: Promise<{ id: string }> };

/** Última análise da iniciativa (ou null). */
export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await initiativeAccess(id, false);
  if (isResponse(ctx)) return ctx;
  const run = await latestRun(id);
  return json({ run: run ? publicRun(run) : null });
}

/** Cria uma análise com as skills. Sem chave ou sem skills (409 com `code`), a tela cai no agente fixo de antes. */
export async function POST(_: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await initiativeAccess(id, true);
  if (isResponse(ctx)) return ctx;
  if (!ctx.initiative.tableOpenedAt) return fail(409, 'Abra a mesa antes de analisar.', { code: 'NO_TABLE' });
  const engine = await engineFor(ctx.initiative.projectId);
  if (!engine.ok) return fail(409, engine.message, { code: engine.code });
  const run = await startRun(id, ctx.user.id, engine.deps.model);
  if (!run) return fail(404, 'Iniciativa não encontrada.');
  return json(run, 201);
}
