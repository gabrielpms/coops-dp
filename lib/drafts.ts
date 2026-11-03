import { db } from './db';
import type { ProjectDraft } from '@/components/wizard/ProjectDeck';

/** Rascunho do deck de projeto, lido junto com a página para o deck abrir sem esperar. */
export async function readProjectDraft(userId: string, entityId = ''): Promise<ProjectDraft | null> {
  const d = await db.draft.findUnique({ where: { userId_scope_entityId: { userId, scope: 'project', entityId } } });
  const p = d?.payload as { form?: ProjectDraft['form']; step?: number } | null | undefined;
  return p?.form ? { form: p.form, step: p.step ?? 0 } : null;
}
