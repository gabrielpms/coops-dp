import type { AvatarConfig } from '../avatar/Avatar';

export const ROLE_OPTIONS = [
  { short: 'quem faz design', focus: ['Agente de iniciativas', 'Meu perfil e skills', 'Brain gym e estudos', 'Tudo'], pains: ['Entender o problema antes de desenhar', 'Defender decisões de design', 'Saber em que evoluir', 'Feedback que chega tarde', 'Mostrar meu impacto', 'Organizar meus estudos'] },
  { short: 'lead e manager', focus: ['Gestão do time em cartas', 'Agente de iniciativas', 'Os dois'], pains: ['Acompanhar PDI', 'Feedback e 1:1', 'Saúde do time', 'Amadurecer demandas do squad', 'Onboarding de pessoas', 'Distribuir frentes de trabalho'] },
  { short: 'head e direção', focus: ['Visão de vários times', 'Estratégia e indicadores', 'Desenvolvimento de líderes', 'Tudo'], pains: ['Mostrar impacto do design', 'Padronizar práticas entre squads', 'Planejar skills e headcount', 'Conectar design à estratégia', 'Saúde dos times', 'Desenvolver líderes'] },
  { short: 'produto e outras áreas', focus: ['Agente de iniciativas', 'Colaborar com designers', 'Entender o processo de design'], pains: ['Demandas chegam mal definidas', 'Alinhar com design mais cedo', 'Saber o momento de cada iniciativa', 'Medir resultado das entregas'] },
];

export const MOMENTS = [
  { n: '01', title: 'Entendimento do desafio', bg: '#F5F2EC', rot: -6, y: 16, icon: 'M28 10a18 18 0 1 0 0 36a18 18 0 1 0 0-36zM41 41l13 13' },
  { n: '02', title: 'Soft prepare', bg: '#F5A9D6', rot: -3, y: 4, icon: 'M32 8a16 16 0 0 0-10 28c3 3 4 6 4 10h12c0-4 1-7 4-10A16 16 0 0 0 32 8zM26 52h12M28 58h8' },
  { n: '03', title: 'Explore the solutions', bg: '#B7A6FF', rot: 0, y: -8, icon: 'M16 54V42c0-8 16-8 16-16V10M48 54V42c0-8-16-8-16-16M26 16l6-6 6 6' },
  { n: '04', title: 'Risk mitigation', bg: '#8FE3C8', rot: 3, y: 4, icon: 'M32 6 10 14v16c0 14 10 24 22 28 12-4 22-14 22-28V14zM22 32l7 7 13-14' },
  { n: '05', title: 'Articulando decisões', bg: '#FF8A5B', rot: 6, y: 16, icon: 'M8 14h48v28H28l-12 10V42H8zM18 26h28M18 34h18' },
];

const A = (skin: string, hairStyle: string, shirtStyle: string, facialHair: string, glasses: boolean, lashes: boolean, earrings: boolean, crown: boolean, bg: string): AvatarConfig => ({ skin, hairStyle, shirtStyle, facialHair, glasses, lashes, earrings, crown, bg });

export const MESA_SETS = [
  { c1: 'Check-in de outubro', c2: 'Facilitação · 4', c3: 'Livro · 40%', k4: 'INICIATIVA 07', c4: 'Pessoas desistem no envio do documento', c5: 'Jornada Q4', bubble: 'Essa carta pede mais contexto. Quer ajuda?', rot: [-12, 4, 14, -3, -9], pos: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]], zs: [1, 2, 1, 3, 2],
    av: [A('#8D5A3B', 'blackpower', 'gola-alta', 'nenhum', false, true, true, true, '#B7A6FF'), A('#F2D3BC', 'cacheado', 'listrada', 'nenhum', true, false, false, false, '#F3D36B'), A('#E0B08A', 'careca', 'camisa', 'barba-cheia', true, false, false, false, '#FF8A5B'), A('#C68B5E', 'chanel', 'blazer', 'nenhum', false, true, false, false, '#F5A9D6')] },
  { c1: 'Feedback do review', c2: 'Pesquisa · 5', c3: 'Vídeo · 100%', k4: 'INICIATIVA 05', c4: 'Tarifas pouco claras antes do Pix', c5: 'Sinais 2/3', bubble: 'Quer gerar 4 alternativas de fluxo?', rot: [-6, 9, 8, 2, -14], pos: [[126, 30], [-126, -30], [-10, 40], [50, -14], [-60, -24]], zs: [2, 1, 1, 2, 3],
    av: [A('#5A3825', 'dreads', 'preta', 'barba', false, false, false, false, '#8FE3C8'), A('#EBC9A0', 'longo', 'blazer', 'nenhum', true, true, true, true, '#B7A6FF'), A('#FFFFFF', 'topete', 'camisa', 'bigode', false, false, false, false, '#F5A9D6'), A('#8D5A3B', 'afro-curto', 'clara', 'nenhum', false, true, true, false, '#F3D36B')] },
  { c1: 'Entrega no ar', c2: 'Visual · 3', c3: 'Curso · 70%', k4: 'INICIATIVA 03', c4: 'Cartão virtual pouco usado', c5: 'Objetivo Q1', bubble: 'Sua iniciativa está em Risk mitigation.', rot: [-16, 0, 18, -6, -4], pos: [[230, -10], [14, -44], [-236, 14], [-70, 4], [24, -8]], zs: [1, 2, 2, 3, 1],
    av: [A('#C68B5E', 'trancas', 'clara', 'nenhum', false, true, true, false, '#FF8A5B'), A('#5A3825', 'careca', 'gola-alta', 'cavanhaque', true, false, false, true, '#B7A6FF'), A('#F2D3BC', 'rabo', 'listrada', 'nenhum', true, true, false, false, '#8FE3C8'), A('#E0B08A', 'curto', 'preta', 'barba', false, false, false, false, '#F3D36B')] },
];

const IC = {
  ev: 'M20 22m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0M44 22m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0M6 50c1-9 7-14 14-14s13 5 14 14M30 50c1-9 7-14 14-14s13 5 14 14',
  sk: 'M32 6l7 15 16 2-12 11 3 16-14-8-14 8 3-16L9 23l16-2z',
  ch: 'M8 50 12 18l14 14 6-18 6 18 14-14 4 32z',
  bg: 'M12 14h16a4 4 0 0 1 4 4v36a4 4 0 0 0-4-4H12zM52 14H36a4 4 0 0 0-4 4v36a4 4 0 0 1 4-4h16z',
  jo: 'M8 54c10 0 10-14 20-14s8-14 18-14M46 26V8l10 5-10 5',
  ag: 'M32 6l6 20 20 6-20 6-6 20-6-20-20-6 20-6z',
};
const K = (bg: string, icon: string, label: string, text: string) => ({ bg, icon, label, text });
export const HERO = [
  { size: 160, cw: 128, ch: 96, rot: -8, line: 40, a: { ...A('#F2D3BC', 'ondulado', 'listrada', 'nenhum', false, true, true, false, '#D9CFFF') }, cards: [K('#F5F2EC', IC.ev, 'EVENTOS', 'Ritmo bom'), K('#F3D36B', IC.sk, 'SKILLS', 'Escrita 3 → 4'), K('#8FE3C8', IC.ag, 'AGENTE', 'Check-in pronto'), K('#F5A9D6', IC.bg, 'BRAIN GYM', 'Podcast · 2 ep.')] },
  { size: 170, cw: 128, ch: 96, rot: 6, line: 80, a: A('#5A3825', 'dreads', 'preta', 'barba', false, false, false, false, '#D9CFFF'), cards: [K('#F3D36B', IC.sk, 'SKILLS', 'Facilitação 4/5'), K('#FF8A5B', IC.jo, 'JORNADA', 'Meta: liderar squad'), K('#F5F2EC', IC.ev, 'EVENTOS', 'Feedback recebido'), K('#B7A6FF', IC.ch, 'POWER UP', 'Mentoria +1')] },
  { size: 220, cw: 140, ch: 104, rot: -4, line: 20, a: A('#8D5A3B', 'blackpower', 'gola-alta', 'nenhum', false, true, true, true, '#F3D36B'), cards: [K('#8FE3C8', IC.ch, 'CHAMPION', 'Pesquisa'), K('#F3D36B', IC.sk, 'SKILLS', 'Estratégia 5/5'), K('#F5F2EC', IC.ev, 'EVENTOS', 'Talk interna'), K('#FF8A5B', IC.jo, 'JORNADA', 'Ciclo fechado')] },
  { size: 170, cw: 128, ch: 96, rot: 8, line: 64, a: A('#FFFFFF', 'topete', 'camisa', 'nenhum', true, false, false, false, '#D9CFFF'), cards: [K('#F5A9D6', IC.bg, 'BRAIN GYM', 'Livro · 60%'), K('#8FE3C8', IC.ag, 'AGENTE', '3 cartas novas'), K('#F3D36B', IC.sk, 'SKILLS', 'Craft 3/5'), K('#F5F2EC', IC.ev, 'EVENTOS', '1:1 amanhã')] },
  { size: 160, cw: 128, ch: 96, rot: -6, line: 36, a: { ...A('#EBC9A0', 'chanel', 'blazer', 'nenhum', true, true, false, false, '#D9CFFF'), glassesShape: 'quadrado' }, cards: [K('#FF8A5B', IC.jo, 'JORNADA', 'Objetivo Q4'), K('#F5A9D6', IC.bg, 'BRAIN GYM', 'Curso · 80%'), K('#B7A6FF', IC.ch, 'POWER UP', 'Pix redesenhado'), K('#F3D36B', IC.sk, 'SKILLS', 'Descoberta 4/5')] },
];

export const CROWD: { size: number; cfg: AvatarConfig }[] = [
  { size: 110, cfg: A('#F2D3BC', 'ondulado', 'clara', 'nenhum', false, true, true, false, '#F5A9D6') },
  { size: 130, cfg: A('#5A3825', 'dreads', 'clara', 'barba', false, false, false, false, '#F3D36B') },
  { size: 150, cfg: A('#8D5A3B', 'blackpower', 'clara', 'nenhum', true, true, false, true, '#B7A6FF') },
  { size: 130, cfg: { ...A('#EBC9A0', 'chanel', 'clara', 'nenhum', true, false, false, false, '#8FE3C8'), glassesShape: 'quadrado' } },
  { size: 110, cfg: A('#C68B5E', 'cacheado', 'listrada', 'nenhum', false, false, false, false, '#FF8A5B') },
];
