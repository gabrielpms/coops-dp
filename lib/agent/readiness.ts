import { db } from '@/lib/db';
import { openSecret } from '@/lib/secret';
import { ENGINE_SKILLS, FRONT_KEYS, type StoredSkills } from './catalog';

export type Readiness = {
  /** a Anthropic está pronta para o agente analisar (chave + skills ligadas enviadas + ao menos uma frente) */
  agent: { ok: boolean; reason: string | null };
  /** o Figma está conectado para importar telas por link */
  figma: { ok: boolean };
  /** quem está vendo é o dono do projeto (só ele mexe em Integrações) */
  isOwner: boolean;
  ownerName: string;
};

/** Estado das integrações do projeto, que são as do dono. Alimenta os avisos nas telas de iniciativas. */
export async function projectReadiness(projectId: string, userId: string): Promise<Readiness> {
  const p = await db.project.findUnique({ where: { id: projectId }, select: { ownerId: true, owner: { select: { name: true, anthropicKey: true, anthropicSkills: true, anthropicSkillsOff: true, figmaToken: true } } } });
  const o = p?.owner;
  let reason: string | null = null;
  if (!o || !openSecret(o.anthropicKey)) reason = 'A chave da Anthropic ainda não foi cadastrada.';
  else if (FRONT_KEYS.every((k) => o.anthropicSkillsOff.includes(k))) reason = 'Todas as frentes de análise estão desligadas.';
  else {
    const stored = (o.anthropicSkills as StoredSkills | null) ?? {};
    if (ENGINE_SKILLS.some((s) => !o.anthropicSkillsOff.includes(s.key) && !stored[s.key])) reason = 'As skills do agente ainda não foram enviadas para a Anthropic.';
  }
  return { agent: { ok: !reason, reason }, figma: { ok: !!openSecret(o?.figmaToken) }, isOwner: p?.ownerId === userId, ownerName: o?.name ?? 'o dono do projeto' };
}
