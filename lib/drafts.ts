import { db } from './db';
import type { ProjectDraft } from '@/components/wizard/ProjectDeck';

/** Rascunho de deck de perguntas, lido junto com a página para o deck abrir sem esperar. */
export async function readDraft<T>(userId: string, scope: string, entityId = ''): Promise<{ form: T; step: number } | null> {
  const d = await db.draft.findUnique({ where: { userId_scope_entityId: { userId, scope, entityId } } });
  const p = d?.payload as { form?: T; step?: number } | null | undefined;
  return p?.form ? { form: p.form, step: p.step ?? 0 } : null;
}

export const readProjectDraft = (userId: string, entityId = ''): Promise<ProjectDraft | null> => readDraft(userId, 'project', entityId);
