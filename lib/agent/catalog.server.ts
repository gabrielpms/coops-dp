import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ENGINE_SKILLS, type SkillStatus, type StoredSkills } from './catalog';

/** Conteúdo do SKILL.md versionado no repositório e seu hash (para saber se a skill enviada ficou desatualizada). */
export async function readSkill(dir: string): Promise<{ content: string; hash: string }> {
  const content = await readFile(path.join(process.cwd(), 'skills', dir, 'SKILL.md'), 'utf8');
  return { content, hash: createHash('sha256').update(content).digest('hex').slice(0, 16) };
}

export async function skillStatuses(stored: StoredSkills | null | undefined, off: readonly string[] = []) {
  return Promise.all(ENGINE_SKILLS.map(async (s) => {
    const cur = await readSkill(s.dir).catch(() => null);
    const st = stored?.[s.key];
    const status: SkillStatus = !st ? 'PENDENTE' : cur && cur.hash !== st.hash ? 'DESATUALIZADA' : 'ENVIADA';
    return { key: s.key, title: s.title, sub: s.sub, status, uploadedAt: st?.uploadedAt ?? null, enabled: !off.includes(s.key) };
  }));
}
