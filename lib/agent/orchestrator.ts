import type { ZodType } from 'zod';
import { toolsOf } from '@/lib/tools';
import { converse, uploadFile, type SkillRef } from './anthropic';
import type { EngineSkillKey } from './catalog';
import { hasScreens, sendable, type RunInput } from './context';
import { consolidarPrompt, frontPrompt, routerPrompt, SYSTEM } from './prompts';
import { consolidadoSchema, extractJson, FRONT_SCHEMA, routerSchema, type Frente, type Resultados, type Router } from './schemas';

export type StepId = 'rotear' | Frente | 'consolidar';
export type StepStatus = 'PENDING' | 'DONE' | 'FAILED';
export type StepState = { id: StepId; label: string; status: StepStatus; tokensIn: number; tokensOut: number; error?: string };
export type RunState = { steps: StepState[]; files: Record<string, string>; results: Resultados };

export const LABELS: Record<StepId, string> = {
  rotear: 'Lendo o material e escolhendo as frentes', heuristica: 'Heurística de usabilidade', metricas: 'Métricas e tagueamento', estrategia: 'Leitura estratégica', consolidar: 'Consolidando o parecer',
};
const step = (id: StepId): StepState => ({ id, label: LABELS[id], status: 'PENDING', tokensIn: 0, tokensOut: 0 });
export const initialState = (): RunState => ({ steps: [step('rotear')], files: {}, results: {} });

const FRENTES: Frente[] = ['heuristica', 'metricas', 'estrategia'];
/** A estratégia roda sempre e por último; heurística e métricas só existem com telas. */
export function planFronts(router: Router, input: RunInput): Frente[] {
  const wanted = new Set<Frente>(router.frentes);
  wanted.add('estrategia');
  return FRENTES.filter((f) => wanted.has(f) && (f === 'estrategia' || hasScreens(input)));
}

export type Deps = {
  key: string; model: string; skills: Record<EngineSkillKey, SkillRef>;
  /** Lê o arquivo anexado (do bucket) para enviá-lo à Anthropic. */
  loadFile: (attachmentId: string) => Promise<{ name: string; mime: string; bytes: Uint8Array }>;
  /** Prazo (ms epoch) para a etapa terminar. */
  deadline: number;
};

const STEP_SKILL: Record<StepId, EngineSkillKey> = { rotear: 'integrada', heuristica: 'heuristica', metricas: 'metricas', estrategia: 'estrategia', consolidar: 'integrada' };

async function ensureFiles(state: RunState, input: RunInput, deps: Deps): Promise<string | null> {
  for (const a of sendable(input)) {
    if (state.files[a.id]) continue;
    const f = await deps.loadFile(a.id).catch(() => null);
    if (!f) return `Não consegui ler o arquivo "${a.name}".`;
    const up = await uploadFile(deps.key, f);
    if (!up.ok) return up.message;
    state.files[a.id] = up.data.fileId;
  }
  return null;
}

/** Chama o agente e valida a saída; se o JSON vier inválido, pede uma vez para refazer só o formato. */
async function ask<T>(deps: Deps, id: StepId, prompt: string, files: string[], schema: ZodType<T>): Promise<{ ok: true; value: T; tin: number; tout: number } | { ok: false; message: string; tin: number; tout: number }> {
  const content: unknown[] = [{ type: 'text', text: prompt }, ...files.map((file_id) => ({ type: 'container_upload', file_id }))];
  const skills = [deps.skills[STEP_SKILL[id]]];
  let tin = 0, tout = 0, problem = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await converse(deps.key, { model: deps.model, system: SYSTEM, content: attempt ? [...content, { type: 'text', text: `Sua resposta anterior não passou na validação (${problem}). Refaça e responda SÓ com o bloco json no formato pedido.` }] : content, skills, deadline: deps.deadline });
    if (!r.ok) return { ok: false, message: r.message, tin, tout };
    tin += r.data.tokensIn; tout += r.data.tokensOut;
    try {
      const parsed = schema.safeParse(extractJson(r.data.text));
      if (parsed.success) return { ok: true, value: parsed.data, tin, tout };
      problem = parsed.error.issues.slice(0, 3).map((i) => `${i.path.join('.') || 'raiz'}: ${i.message}`).join('; ');
    } catch (e) { problem = (e as Error).message; }
  }
  return { ok: false, message: `O agente devolveu uma resposta fora do formato (${problem}).`, tin, tout };
}

/** Roteamento sem IA, usado se o agente não devolver um JSON válido: com telas as três frentes, sem telas só a estratégia. */
const fallbackRouter = (input: RunInput): Router => ({ tipoMaterial: hasScreens(input) ? 'telas' : 'texto', frentes: hasScreens(input) ? [...FRENTES] : ['estrategia'], coreAction: '', suposicoes: ['O roteamento automático não respondeu em formato válido; usei a regra padrão pelo tipo de material.'], justificativa: 'Regra padrão.' });

/** Executa o próximo passo pendente (ou refaz o que falhou) e devolve o novo estado. Nunca lança: erros ficam no passo. */
export async function advance(prev: RunState, input: RunInput, deps: Deps): Promise<{ state: RunState; finished: boolean; failed: boolean }> {
  const state: RunState = structuredClone(prev);
  const cur = state.steps.find((s) => s.status !== 'DONE');
  if (!cur) return { state, finished: true, failed: false };
  const fail = (message: string) => { cur.status = 'FAILED'; cur.error = message; return { state, finished: false, failed: true }; };
  delete cur.error;

  if (cur.id === 'rotear') {
    const r = await ask(deps, 'rotear', routerPrompt(input), [], routerSchema);
    cur.tokensIn += r.tin; cur.tokensOut += r.tout;
    if (!r.ok && /Tempo|tempo|demorou|Sem conexão|Limite|chave|permissão|indispon/.test(r.message)) return fail(r.message);
    state.results.rotear = r.ok ? r.value : fallbackRouter(input);
    cur.status = 'DONE';
    state.steps.push(...planFronts(state.results.rotear, input).map(step), step('consolidar'));
    return { state, finished: false, failed: false };
  }

  if (cur.id === 'consolidar') {
    const r = await ask(deps, 'consolidar', consolidarPrompt(input, state.results), [], consolidadoSchema);
    cur.tokensIn += r.tin; cur.tokensOut += r.tout;
    if (!r.ok) return fail(r.message);
    const c = r.value;
    // 4 a 6 ferramentas: completa com as do momento quando o agente trouxe poucas
    const ids = [...c.ferramentas];
    for (const t of toolsOf(c.momento)) if (ids.length < 4 && !ids.includes(t.id)) ids.push(t.id);
    state.results.consolidar = { ...c, ferramentas: ids };
    cur.status = 'DONE';
    return { state, finished: true, failed: false };
  }

  // frentes (heurística, métricas, estratégia)
  const err = await ensureFiles(state, input, deps);
  if (err) return fail(err);
  const files = sendable(input).map((a) => state.files[a.id]).filter(Boolean);
  const r = await ask(deps, cur.id, frontPrompt(cur.id as Frente, input, state.results), files, FRONT_SCHEMA[cur.id as Frente] as ZodType<unknown>);
  cur.tokensIn += r.tin; cur.tokensOut += r.tout;
  if (!r.ok) return fail(r.message);
  (state.results as Record<string, unknown>)[cur.id] = r.value;
  cur.status = 'DONE';
  return { state, finished: false, failed: false };
}

/** Quantos passos já terminaram e o total conhecido (o total cresce depois do roteamento). */
export const progress = (s: RunState) => ({ done: s.steps.filter((x) => x.status === 'DONE').length, total: s.steps.length });
export const tokensOf = (s: RunState) => s.steps.reduce((a, x) => ({ in: a.in + x.tokensIn, out: a.out + x.tokensOut }), { in: 0, out: 0 });
