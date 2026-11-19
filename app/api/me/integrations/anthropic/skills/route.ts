import { db } from '@/lib/db';
import { fail, isResponse, json, requireUser } from '@/lib/api/http';
import { openSecret } from '@/lib/secret';
import { uploadSkill } from '@/lib/agent/anthropic';
import { ENGINE_SKILLS, FRONT_KEYS, isSkillKey, type StoredSkills } from '@/lib/agent/catalog';
import { readSkill } from '@/lib/agent/catalog.server';
import { integrationState } from '@/lib/agent/settings';

export const maxDuration = 120;

// Envia (ou atualiza) as skills do motor para o workspace da API da chave cadastrada e guarda os ids.
export async function POST(req: Request) {
  const u = await requireUser();
  if (isResponse(u)) return u;
  if (u.role !== 'MANAGER') return fail(403, 'Só managers configuram a integração.');
  const key = openSecret(u.anthropicKey);
  if (!key) return fail(409, 'Cadastre a chave da Anthropic antes de enviar as skills.');
  // opcional: { keys: ['estrategia'] } envia só algumas; sem corpo, envia as 4
  const only = ((await req.json().catch(() => ({})))?.keys ?? []) as unknown[];
  const wanted = only.filter((k): k is string => typeof k === 'string' && isSkillKey(k));
  const stored: StoredSkills = { ...((u.anthropicSkills as StoredSkills | null) ?? {}) };
  for (const s of ENGINE_SKILLS.filter((x) => !wanted.length || wanted.includes(x.key))) {
    const file = await readSkill(s.dir).catch(() => null);
    if (!file) return fail(500, `O arquivo da skill "${s.title}" não está no servidor.`);
    const r = await uploadSkill(key, { displayTitle: s.display, dir: s.dir, content: file.content }, stored[s.key]?.skillId);
    if (!r.ok) {
      // grava o que já subiu e explica qual falhou
      await db.user.update({ where: { id: u.id }, data: { anthropicSkills: stored as object } });
      return fail(r.status === 401 || r.status === 403 ? 422 : 502, `Skill "${s.title}": ${r.message}`);
    }
    stored[s.key] = { skillId: r.data.skillId, displayTitle: s.display, hash: file.hash, uploadedAt: new Date().toISOString() };
  }
  const next = await db.user.update({ where: { id: u.id }, data: { anthropicSkills: stored as object } });
  return json(await integrationState(next));
}

// Liga ou desliga uma skill do motor (a desligada fica enviada, mas não entra nas análises).
export async function PATCH(req: Request) {
  const u = await requireUser();
  if (isResponse(u)) return u;
  if (u.role !== 'MANAGER') return fail(403, 'Só managers configuram a integração.');
  const body = (await req.json().catch(() => null)) as { key?: unknown; enabled?: unknown } | null;
  if (!body || typeof body.key !== 'string' || !isSkillKey(body.key) || typeof body.enabled !== 'boolean') return fail(400, 'Escolha a skill e se ela fica ligada ou desligada.');
  const off = new Set(u.anthropicSkillsOff);
  if (body.enabled) off.delete(body.key); else off.add(body.key);
  if (FRONT_KEYS.every((k) => off.has(k))) return fail(409, 'Deixe ao menos uma frente ligada: heurística, métricas ou estratégia.');
  const next = await db.user.update({ where: { id: u.id }, data: { anthropicSkillsOff: [...off] } });
  return json(await integrationState(next));
}
