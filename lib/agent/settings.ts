import { openSecret } from '@/lib/secret';
import { DEFAULT_MODEL, type StoredSkills } from './catalog';
import { skillStatuses } from './catalog.server';

type Row = { anthropicKey: string | null; anthropicModel: string | null; anthropicSkills: unknown };

/** Estado da integração para a tela de administração. A chave nunca sai daqui inteira: só os 4 últimos caracteres. */
export async function integrationState(u: Row) {
  const key = openSecret(u.anthropicKey);
  return {
    configured: !!key,
    last4: key ? key.slice(-4) : null,
    model: u.anthropicModel ?? DEFAULT_MODEL,
    skills: await skillStatuses(u.anthropicSkills as StoredSkills | null),
  };
}
export type IntegrationState = Awaited<ReturnType<typeof integrationState>>;
