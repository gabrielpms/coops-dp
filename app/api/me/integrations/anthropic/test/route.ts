import { fail, isResponse, json, requireUser } from '@/lib/api/http';
import { openSecret } from '@/lib/secret';
import { ping } from '@/lib/agent/anthropic';
import { DEFAULT_MODEL, ENGINE_SKILLS, type StoredSkills } from '@/lib/agent/catalog';

export const maxDuration = 120;

// Teste de ponta a ponta: chave, modelo e as 4 skills carregadas no container.
export async function POST() {
  const u = await requireUser();
  if (isResponse(u)) return u;
  if (u.role !== 'MANAGER') return fail(403, 'Só managers configuram a integração.');
  const key = openSecret(u.anthropicKey);
  if (!key) return fail(409, 'Cadastre a chave da Anthropic antes de testar.');
  const stored = (u.anthropicSkills as StoredSkills | null) ?? {};
  const on = ENGINE_SKILLS.filter((s) => !u.anthropicSkillsOff.includes(s.key));
  const missing = on.filter((s) => !stored[s.key]);
  if (missing.length) return fail(409, `Envie as skills ligadas antes de testar (faltam: ${missing.map((m) => m.title).join(', ')}).`);
  const r = await ping(key, u.anthropicModel ?? DEFAULT_MODEL, on.map((s) => ({ skillId: stored[s.key]!.skillId })));
  if (!r.ok) return fail(502, r.message);
  return json({ ok: true, reply: r.data.text.slice(0, 80), skills: on.length });
}
