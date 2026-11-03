import type { AvatarConfig } from '../avatar/Avatar';

export type SquadDeckId = 'DESAFIO' | 'FRENTE' | 'ESTRATEGIA' | 'INDICADOR' | 'ALAVANCA';
export type Evidence = { tipo: string; texto: string };
export type Action = { texto: string; dono: string; prazo: string; done: boolean };
export type SquadCardView = { id: string; deck: SquadDeckId; title: string; status: 'ABERTA' | 'ENCERRADA'; closedAt: string | null; level: number | null; championPersonId: string | null; data: Record<string, any> };
export type SquadPerson = { id: string; name: string; avatar: AvatarConfig | null };

export const DECK_META: Record<SquadDeckId, { slug: string; title: string; one: string; color: string; kicker: string; desc: string; empty: string; addLabel: string }> = {
  DESAFIO: { slug: 'desafios', title: 'Desafios de time', one: 'desafio', color: '#FF8A5B', kicker: 'DESAFIO', desc: 'Os desafios do squad, com cenário, evidências e a lista de ações.', empty: 'Nenhum desafio ainda', addLabel: '+ Desafio' },
  FRENTE: { slug: 'frentes', title: 'Frentes de trabalho', one: 'frente', color: '#F5A9D6', kicker: 'FRENTE', desc: 'As frentes em que o squad trabalha e quem é o champion de cada uma.', empty: 'Nenhuma frente ainda', addLabel: '+ Frente' },
  ESTRATEGIA: { slug: 'estrategia', title: 'Estratégia de time', one: 'item de estratégia', color: '#B7A6FF', kicker: 'ESTRATÉGIA', desc: 'Para onde o squad está indo e como o design contribui.', empty: 'Nenhum item de estratégia ainda', addLabel: '+ Item' },
  INDICADOR: { slug: 'indicadores', title: 'Indicadores de sucesso', one: 'indicador', color: '#F3D36B', kicker: 'INDICADOR', desc: 'Os números que mostram se o squad está indo bem.', empty: 'Nenhum indicador ainda', addLabel: '+ Indicador' },
  ALAVANCA: { slug: 'alavancas', title: 'Alavancas de time', one: 'alavanca', color: '#C9F0B8', kicker: 'ALAVANCA', desc: 'O que o squad pode mexer para mudar o resultado.', empty: 'Nenhuma alavanca ainda', addLabel: '+ Alavanca' },
};
export const SLUG_TO_DECK: Record<string, SquadDeckId> = Object.fromEntries(Object.entries(DECK_META).map(([k, v]) => [v.slug, k as SquadDeckId]));
