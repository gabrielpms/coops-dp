import { db } from './db';
import type { SquadCardInput } from './validation';

/** Separa o que vira coluna (título, nível, champion) do que fica em `data`. */
export function splitCard(b: SquadCardInput) {
  const { deck, title, ...rest } = b as any;
  const level = deck === 'DESAFIO' ? rest.complexidade : deck === 'FRENTE' ? rest.nivel : null;
  const championPersonId = deck === 'FRENTE' ? rest.championPersonId ?? null : null;
  const { championPersonId: _c, ...data } = rest;
  return { deck, title, level, championPersonId, data };
}

/** Confere que champion e desafio citados pertencem ao projeto/squad (isolamento por projeto). */
export async function checkRefs(squadId: string, projectId: string, b: SquadCardInput): Promise<string | null> {
  if (b.deck === 'FRENTE' && b.championPersonId && !(await db.person.findFirst({ where: { id: b.championPersonId, projectId, deletedAt: null } }))) return 'A pessoa escolhida não faz parte deste projeto.';
  if (b.deck === 'INDICADOR' && b.challengeId && !(await db.squadCard.findFirst({ where: { id: b.challengeId, squadId, deck: 'DESAFIO', deletedAt: null } }))) return 'Desafio não encontrado neste squad.';
  return null;
}
