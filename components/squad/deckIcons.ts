export type Part = [string, string];
export type DeckDef = { key: string; href: string; title: string; sub: string; bg: string; b1: string; b2: string; parts: Part[]; kicker: string };
export const ICP: Record<string, Part[]> = {
  desafios: [['ic-mount', 'M8 50 26 16l10 18 6-8 14 24z'], ['', 'M26 16v-8'], ['ic-flag', 'M26 8l8 3-8 3']],
  frentes: [['ic-fb ic-fb1', 'M8 14h48v10H8z'], ['ic-fb ic-fb2', 'M8 30h32v10H8z'], ['ic-fb ic-fb3', 'M8 46h20v10H8z']],
  estrategia: [['ic-ring', 'M32 6a26 26 0 1 0 0 52a26 26 0 1 0 0-52zM32 18a14 14 0 1 0 0 28a14 14 0 1 0 0-28z'], ['ic-sweep', 'M32 32 49 15'], ['ic-blip', 'M43 22h.01'], ['', 'M32 32h.01']],
  indicadores: [['', 'M8 56h48'], ['ic-ib ic-ib1', 'M14 48V34'], ['ic-ib ic-ib2', 'M26 48V24'], ['ic-ib ic-ib3', 'M38 48V30'], ['ic-ib ic-ib4', 'M50 48V12']],
  saude: [['ic-heart', 'M32 54S8 40 8 24a12 12 0 0 1 24-4 12 12 0 0 1 24 4c0 16-24 30-24 30z'], ['ic-ecg', 'M14 30h10l4-8 6 16 4-8h12']],
  alavancas: [['', 'M26 34l-7 16h14z'], ['ic-arm', 'M6 42 58 22'], ['ic-w', 'M48 8h10v12H48z']],
};
export const SUB: Record<string, string> = { desafios: 'O que trava o squad agora', frentes: 'Onde o squad está jogando as cartas', estrategia: 'Para onde o squad está indo', indicadores: 'Como o squad sabe que está indo bem', alavancas: 'O que acelera o squad', saude: 'Como o squad está se sentindo' };
export const COL: Record<string, [string, string]> = { desafios: ['#E06A3C', '#B84F26'], frentes: ['#D987B8', '#B0668F'], estrategia: ['#8B74F2', '#4B36B0'], indicadores: ['#D9B84B', '#B8962F'], saude: ['#7FB8DD', '#4F8DB3'], alavancas: ['#9FD68A', '#74B35E'] };
