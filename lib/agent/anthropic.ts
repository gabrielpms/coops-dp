import { DEFAULT_MODEL } from './catalog';

const BASE = 'https://api.anthropic.com';
const VERSION = '2023-06-01';
const BETA_SKILLS = 'skills-2025-10-02';
const BETA_CODE = 'code-execution-2025-08-25';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

/** Erros da API em português, sem vazar detalhes internos. */
function explain(status: number, body: any): string {
  const raw: string = body?.error?.message ?? '';
  if (status === 401) return 'A chave da Anthropic foi recusada. Confira se ela foi copiada inteira.';
  if (status === 403) return 'A chave não tem permissão para esse recurso (Skills ou execução de código). Verifique o workspace da chave.';
  if (status === 404) return 'Recurso não encontrado na conta da Anthropic.';
  if (status === 429) return 'Limite de uso da Anthropic atingido. Tente de novo em instantes.';
  if (status === 400 && /display_title/i.test(raw)) return 'Já existe uma skill com esse nome no workspace da Anthropic.';
  if (status === 400) return `A Anthropic recusou o pedido${raw ? `: ${raw.slice(0, 200)}` : '.'}`;
  if (status >= 500) return 'A Anthropic está indisponível agora. Tente de novo em instantes.';
  return 'Não deu para falar com a Anthropic. Tente de novo.';
}

async function request<T>(key: string, path: string, init: RequestInit & { beta?: string[] } = {}): Promise<ApiResult<T>> {
  const { beta, headers, ...rest } = init;
  try {
    const r = await fetch(`${BASE}${path}`, {
      ...rest,
      headers: { 'x-api-key': key, 'anthropic-version': VERSION, ...(beta?.length ? { 'anthropic-beta': beta.join(',') } : {}), ...(headers as Record<string, string> | undefined) },
      signal: AbortSignal.timeout(120_000),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, status: r.status, message: explain(r.status, body) };
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, status: 0, message: 'Sem conexão com a Anthropic. Tente de novo.' };
  }
}

/** Confere se a chave é válida com uma chamada leve. */
export const checkKey = (key: string) => request<unknown>(key, '/v1/models?limit=1');

type SkillRow = { id: string; display_title: string | null; latest_version?: string | null };
/** Skills próprias do workspace (para reaproveitar a mesma skill ao atualizar). */
export const listCustomSkills = (key: string) => request<{ data: SkillRow[] }>(key, '/v1/skills?source=custom&limit=100', { beta: [BETA_SKILLS] });

/** Envia uma skill: cria se não existe no workspace; se existe, publica uma nova versão. */
export async function uploadSkill(key: string, s: { displayTitle: string; dir: string; content: string }, existingId?: string): Promise<ApiResult<{ skillId: string }>> {
  const form = () => {
    const f = new FormData();
    f.append('files[]', new Blob([s.content], { type: 'text/markdown' }), `${s.dir}/SKILL.md`); // a pasta de topo precisa ter o nome da skill
    return f;
  };
  let id = existingId;
  if (!id) {
    const list = await listCustomSkills(key);
    if (!list.ok) return list;
    id = list.data.data.find((x) => x.display_title === s.displayTitle)?.id;
  }
  if (id) {
    const v = await request<unknown>(key, `/v1/skills/${id}/versions`, { method: 'POST', body: form(), beta: [BETA_SKILLS] });
    return v.ok ? { ok: true, data: { skillId: id } } : v;
  }
  const f = form();
  f.append('display_title', s.displayTitle);
  const c = await request<{ id: string }>(key, '/v1/skills', { method: 'POST', body: f, beta: [BETA_SKILLS] });
  return c.ok ? { ok: true, data: { skillId: c.data.id } } : c;
}

export type SkillRef = { skillId: string };
export type Block = { type: string; text?: string; [k: string]: unknown };
export type MessageResult = { id: string; stop_reason: string | null; content: Block[]; container?: { id: string } | null; usage?: { input_tokens?: number; output_tokens?: number } };

/** Uma chamada à Messages API, opcionalmente com skills no container de execução de código. */
export function message(key: string, body: { model?: string; system?: string; maxTokens?: number; prompt: unknown; skills?: SkillRef[]; containerId?: string | null }) {
  const payload: Record<string, unknown> = {
    model: body.model || DEFAULT_MODEL,
    max_tokens: body.maxTokens ?? 4096,
    ...(body.system ? { system: body.system } : {}),
    messages: [{ role: 'user', content: body.prompt }],
  };
  if (body.skills?.length) {
    payload.container = { ...(body.containerId ? { id: body.containerId } : {}), skills: body.skills.map((k) => ({ type: 'custom', skill_id: k.skillId, version: 'latest' })) };
    payload.tools = [{ type: 'code_execution_20250825', name: 'code_execution' }];
  }
  return request<MessageResult>(key, '/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), beta: body.skills?.length ? [BETA_CODE, BETA_SKILLS] : [] });
}

/** Chamada mínima de ponta a ponta: chave, modelo e skills carregadas no container. */
export async function ping(key: string, model: string, skills: SkillRef[]): Promise<ApiResult<{ text: string }>> {
  const r = await message(key, { model, maxTokens: 64, prompt: 'Responda apenas com a palavra: ok', skills });
  if (!r.ok) return r;
  const text = r.data.content.filter((b) => b.type === 'text').map((b) => b.text ?? '').join('').trim();
  return { ok: true, data: { text } };
}
