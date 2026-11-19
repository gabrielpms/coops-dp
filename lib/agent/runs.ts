import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { openSecret } from '@/lib/secret';
import { presignDownload, storageConfigured } from '@/lib/storage';
import { DEFAULT_MODEL, ENGINE_SKILLS, type StoredSkills } from './catalog';
import { loadRunInput, type RunInput } from './context';
import { advance, initialState, progress, tokensOf, type Deps, type RunState } from './orchestrator';

export const STEP_LOCK_MS = 320_000;
const STEP_BUDGET_MS = 290_000;

type Engine = { ok: true; deps: Omit<Deps, 'deadline'> } | { ok: false; code: 'NO_KEY' | 'NO_SKILLS'; message: string };

/** O motor da iniciativa usa a chave, o modelo e as skills de quem é dono do projeto. */
export async function engineFor(projectId: string): Promise<Engine> {
  const project = await db.project.findUnique({ where: { id: projectId }, select: { owner: { select: { anthropicKey: true, anthropicModel: true, anthropicSkills: true } } } });
  const owner = project?.owner;
  const key = openSecret(owner?.anthropicKey);
  if (!owner || !key) return { ok: false, code: 'NO_KEY', message: 'Conecte a chave da Anthropic em Administração › Integrações para o agente analisar.' };
  const stored = (owner.anthropicSkills as StoredSkills | null) ?? {};
  if (ENGINE_SKILLS.some((s) => !stored[s.key])) return { ok: false, code: 'NO_SKILLS', message: 'Envie as 4 skills do motor em Administração › Integrações.' };
  const skills = Object.fromEntries(ENGINE_SKILLS.map((s) => [s.key, { skillId: stored[s.key]!.skillId }])) as Deps['skills'];
  return { ok: true, deps: { key, model: owner.anthropicModel ?? DEFAULT_MODEL, skills, loadFile: loadAttachment } };
}

async function loadAttachment(id: string) {
  if (!storageConfigured()) throw new Error('Armazenamento de arquivos não configurado.');
  const a = await db.attachment.findUnique({ where: { id }, select: { key: true, name: true, mime: true } });
  if (!a) throw new Error('Arquivo não encontrado.');
  const r = await fetch(await presignDownload(a.key, a.name));
  if (!r.ok) throw new Error('Não deu para ler o arquivo.');
  return { name: a.name, mime: a.mime, bytes: new Uint8Array(await r.arrayBuffer()) };
}

type Run = NonNullable<Awaited<ReturnType<typeof db.agentRun.findUnique>>>;
/** O que a tela recebe: passos, progresso e, quando concluída, o resultado. Nunca devolve prompts, ids de arquivo ou chave. */
export function publicRun(run: Run) {
  const st = run.state as unknown as RunState;
  return {
    id: run.id, status: run.status as 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED', createdAt: run.createdAt.toISOString(), error: run.error,
    steps: st.steps.map((s) => ({ id: s.id, label: s.label, status: s.status, error: s.error ?? null })),
    progress: progress(st),
    result: run.status === 'DONE' ? st.results : null,
  };
}
export type PublicRun = ReturnType<typeof publicRun>;

export const latestRun = (initiativeId: string) => db.agentRun.findFirst({ where: { initiativeId }, orderBy: { createdAt: 'desc' } });

export async function startRun(initiativeId: string, userId: string, model: string): Promise<{ id: string } | null> {
  const input = await loadRunInput(initiativeId);
  if (!input) return null;
  const run = await db.agentRun.create({ data: { initiativeId, createdById: userId, model, state: initialState() as unknown as Prisma.InputJsonValue, input: input as unknown as Prisma.InputJsonValue } });
  return { id: run.id };
}

/** Roda o próximo passo da execução. Só um passo por vez por execução (trava com prazo); devolve o estado atual se outro já está rodando. */
export async function advanceRun(runId: string, initiativeId: string): Promise<{ run: PublicRun } | { error: string; status: number }> {
  const found = await db.agentRun.findFirst({ where: { id: runId, initiativeId }, include: { initiative: { select: { projectId: true } } } });
  if (!found) return { error: 'Execução não encontrada.', status: 404 };
  if (found.status === 'DONE') return { run: publicRun(found) };
  const now = new Date();
  const locked = await db.agentRun.updateMany({ where: { id: runId, OR: [{ lockedAt: null }, { lockedAt: { lt: new Date(now.getTime() - STEP_LOCK_MS) } }] }, data: { lockedAt: now, status: 'RUNNING', error: null } });
  if (locked.count === 0) return { run: publicRun(found) }; // outro passo em andamento
  const engine = await engineFor(found.initiative.projectId);
  if (!engine.ok) {
    const failed = await db.agentRun.update({ where: { id: runId }, data: { status: 'FAILED', error: engine.message, lockedAt: null } });
    return { run: publicRun(failed) };
  }
  const result = await advance(found.state as unknown as RunState, found.input as unknown as RunInput, { ...engine.deps, deadline: Date.now() + STEP_BUDGET_MS });
  const tk = tokensOf(result.state);
  const failedStep = result.state.steps.find((s) => s.status === 'FAILED');
  const status = result.finished ? 'DONE' : failedStep ? 'FAILED' : 'RUNNING';
  const saved = await db.$transaction(async (tx) => {
    const r = await tx.agentRun.update({ where: { id: runId }, data: { state: result.state as unknown as Prisma.InputJsonValue, status, error: failedStep?.error ?? null, tokensIn: tk.in, tokensOut: tk.out, lockedAt: null } });
    const c = result.state.results.consolidar;
    if (result.finished && c) await tx.initiative.update({ where: { id: initiativeId }, data: { moment: c.momento, momentReason: c.motivoMomento || c.resumo.slice(0, 300) } });
    return r;
  });
  return { run: publicRun(saved) };
}
