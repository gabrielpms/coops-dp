import { z } from 'zod';

export const SEGMENTS = ['Fintech', 'Healthtech', 'Varejo', 'Educação', 'Mobilidade', 'SaaS B2B', 'Logística', 'Mídia'] as const;
export const DEFAULT_SKILLS = ['Pesquisa com usuários', 'Interação e protótipo', 'Visual e sistemas', 'Facilitação', 'Visão de negócio'];
export const INDICATOR_SUGGESTIONS = ['Ativação', 'Retenção em 30 dias', 'NPS', 'Conversão', 'Tempo até o primeiro valor', 'Receita recorrente'];
export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const text = (max = 500) => z.string().trim().max(max);
const list = z.array(text(200).min(1)).max(50);

export const avatarSchema = z.object({
  skin: z.string().optional(), bg: z.string().optional(), hairStyle: z.string().optional(), shirtStyle: z.string().optional(),
  facialHair: z.string().optional(), glasses: z.boolean().optional(), glassesShape: z.string().optional(),
  earrings: z.boolean().optional(), lashes: z.boolean().optional(), crown: z.boolean().optional(),
});

export const signupSchema = z.object({
  name: text(120).min(1, 'Escreva seu nome'),
  email: text(200).toLowerCase().regex(EMAIL_RE, 'E-mail inválido'),
  phone: text(40).optional().default(''),
  role: z.enum(['IC', 'MANAGER']),
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres').max(128, 'A senha pode ter no máximo 128 caracteres'),
});
export const loginSchema = z.object({ email: text(200).toLowerCase().regex(EMAIL_RE, 'E-mail inválido'), password: z.string().min(1, 'Digite sua senha').max(128) });

export const projectSchema = z.object({
  name: text(120).min(1, 'Escreva o nome da empresa'),
  // Texto livre: as tags de SEGMENTS são só atalhos.
  segment: text(60).min(1, 'Escolha ou escreva o segmento'),
  tagline: text(200).optional().default(''),
  strategy: text(2000).optional().default(''),
  indicators: list.default([]),
  competitors: list.default([]),
  links: list.default([]),
  skills: list.min(1, 'Escolha ao menos uma skill'),
  invites: z.array(z.object({ name: text(120).min(1), email: text(200).toLowerCase().regex(EMAIL_RE), position: z.enum(['IC', 'MANAGER']) })).max(50).default([]),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const draftSchema = z.object({ scope: text(80).min(1), entityId: text(80).optional().default(''), payload: z.unknown() });

export function hostOf(url: string): string {
  try { return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).host.replace(/^www\./, ''); } catch { return url; }
}

// ---------- Wish list (M1) ----------
export const WISH_ROLES = ['Designer IC', 'Lead / Manager', 'Head / Diretor(a)', 'Produto / Outro'] as const;
export const WISH_TEAM_SIZES = ['Só eu', '2 a 5', '6 a 15', '16 a 40', 'Mais de 40'] as const;
export const WISH_CHANNELS = ['E-mail', 'WhatsApp', 'LinkedIn'] as const;
export const wishlistSchema = z.object({
  name: text(120).optional().default(''),
  email: text(200).toLowerCase().regex(EMAIL_RE, 'Precisamos de um e-mail válido.'),
  role: z.enum(WISH_ROLES),
  teamSize: z.enum(WISH_TEAM_SIZES).optional().default('Só eu'),
  focus: text(120).optional().default(''),
  pains: z.array(text(120)).max(12).default([]),
  channels: z.array(z.enum(WISH_CHANNELS)).max(3).default([]),
  beta: z.boolean().default(false),
  consent: z.literal(true, { message: 'Marque o aceite de comunicações para entrar na lista.' }),
});
export type WishlistInput = z.infer<typeof wishlistSchema>;

// ---------- Time (M5) ----------
const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida');
export const SQUAD_COLORS = ['#B7A6FF', '#F3D36B', '#F5A9D6', '#FF8A5B', '#8FE3C8', '#A9D8F5'] as const;
export const memberSchema = z.object({
  name: text(120).min(1, 'Escreva o nome da pessoa'),
  title: text(120).optional().default(''),
  avatar: avatarSchema.optional(),
  mainSkill: text(80).optional().default(''),
  joinedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').optional().or(z.literal('')).default(''),
  email: text(200).toLowerCase().regex(EMAIL_RE, 'Coloque um e-mail válido para enviar o convite'),
});
export type MemberInput = z.infer<typeof memberSchema>;
export const squadSchema = z.object({
  name: text(80).min(1, 'Escreva o nome do squad'),
  color: hex.default('#B7A6FF'),
  members: z.array(z.object({ personId: z.string().uuid(), crown: z.boolean().default(false) })).max(100).default([]),
});
export type SquadInput = z.infer<typeof squadSchema>;

// ---------- Administração (M4) ----------
export const userPatchSchema = z.object({
  name: text(120).min(1, 'Escreva seu nome').optional(),
  title: text(120).optional(),
  phone: text(40).optional(),
  avatar: avatarSchema.optional(),
  email: text(200).toLowerCase().regex(EMAIL_RE, 'Coloque um e-mail válido para seguir').optional(),
  currentPassword: z.string().max(128).optional(), // exigida só quando o e-mail muda
});
export const projectDataSchema = z.object({
  name: text(120).min(1, 'Escreva o nome da empresa'),
  segment: text(60).min(1, 'Escolha ou escreva o segmento'),
  indicators: list.default([]),
  competitors: list.default([]),
});
const ids = z.array(z.string().uuid()).max(200).default([]);
export const leadershipSchema = z.object({
  name: text(120).min(1, 'Escreva o nome para seguir'),
  title: text(120).optional().default(''),
  email: text(200).toLowerCase().regex(EMAIL_RE, 'Coloque um e-mail válido para enviar o convite').optional(),
  avatar: avatarSchema.optional(),
  squadIds: ids,
  memberIds: ids,
});
export const categorySchema = z.object({
  name: text(80).min(1, 'Escreva o nome da categoria'),
  skills: z.array(text(80).min(1)).min(1, 'Adicione pelo menos uma skill').max(50),
});
export const CATEGORY_SUGGESTIONS = ['Pesquisa e descoberta', 'Interação e prototipação', 'Visual e sistemas', 'Escrita e conteúdo', 'Dados e experimentação', 'Negócio e liderança'];
export const LEADER_TITLES = ['Head de Design', 'Design Manager', 'Design Lead', 'Diretor(a) de Design'];

// ---------- Decks da pessoa (M6) ----------
export const DELIVERY_STATUS = ['ENTREGUE', 'EM_ANDAMENTO', 'PAUSADA'] as const;
export const STUDY_TYPES = ['CURSO', 'LIVRO', 'VIDEO', 'ARTIGO', 'PODCAST', 'LINK'] as const;
export const POWERUP_TYPES = ['MENTORIA', 'CURSO', 'PROJETO'] as const;
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida');
const urlText = text(500).refine((v) => { try { new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`); return /\./.test(v); } catch { return false; } }, 'Esse link não parece válido. Confere e tenta de novo.');
export const deliverySchema = z.object({
  title: text(160).min(1, 'Dê um título à entrega para seguir.'),
  description: text(1000).optional().default(''),
  initiativeId: z.string().uuid().nullable().optional().default(null),
  status: z.enum(DELIVERY_STATUS).default('ENTREGUE'),
  role: text(300).optional().default(''),
  impact: text(1000).optional().default(''),
  date: day.optional(),
  links: z.array(urlText).max(10).default([]),
});
export const deliveryImpactSchema = z.object({ impact: text(1000).min(1, 'Escreva o impacto para salvar.') });
export const studySchema = z.object({
  type: z.enum(STUDY_TYPES),
  title: text(200).min(1, 'Dê um título ao conteúdo para seguir.'),
  url: urlText.optional().or(z.literal('')).default(''),
  skillId: z.string().uuid().nullable().optional().default(null),
  total: z.number().int().min(1).max(60).default(10),
});
export const studyPatchSchema = z.object({ progress: z.number().int().min(0).max(60).optional(), notes: text(2000).optional() });
export const ratingSchema = z.object({ skillId: z.string().uuid(), selfScore: z.number().int().min(1).max(5).nullable().optional(), managerScore: z.number().int().min(1).max(5).nullable().optional() });
export const powerUpSchema = z.object({
  type: z.enum(POWERUP_TYPES, { message: 'Escolha um tipo para seguir.' }),
  name: text(160).min(1, 'Preencha para seguir.'),
  skill: text(80).optional().default(''),
  frequency: text(60).optional().default(''),
  progress: z.number().int().min(0).max(100).default(0),
});

/** Ciclo atual (trimestral por padrão; configurável por projeto é pergunta em aberto do PRD). */
export const currentCycle = (d = new Date()) => `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;

// ---------- Jornada e Saúde (M6) ----------
export const journeySchema = z.object({
  kind: z.enum(['OBJETIVO', 'FOCO']),
  title: text(200).min(1, 'Escreva para seguir.'),
  why: text(1000).optional().default(''),
  signal: text(500).optional().default(''),
  measure: text(200).optional().default(''),
  levelFrom: z.number().int().min(1).max(5).optional(),
  levelTo: z.number().int().min(1).max(5).optional(),
  practice: text(1000).optional().default(''),
}).refine((v) => v.kind !== 'OBJETIVO' || !!v.signal.trim(), { message: 'Escreva o sinal para seguir.', path: ['signal'] })
  .refine((v) => v.kind !== 'FOCO' || (v.levelFrom !== undefined && v.levelTo !== undefined && v.levelTo > v.levelFrom), { message: 'A meta precisa ser maior que o nível de hoje.', path: ['levelTo'] });
export const journeyPatchSchema = z.object({ progress: z.number().int().min(0).max(5) });
const score = z.number().int().min(1, 'Responda as quatro perguntas').max(5);
export const healthSchema = z.object({ saude: score, design: score, produto: score, negocio: score, note: text(1000).optional().default('') });
export const HEALTH_DIMS = [
  { id: 'saude', title: 'Saúde no período', help: 'Energia, carga e bem-estar nas últimas semanas.', lo: 'Esgotada', hi: 'Com energia', tip: 'Sua saúde está baixa. Quer marcar um papo com o manager sobre carga?' },
  { id: 'design', title: 'Estratégia do time de design', help: 'Sabe para onde o time de design está indo?', lo: 'Nada claro', hi: 'Muito claro', tip: 'A estratégia de design ficou pouco clara. Posso sugerir ao manager um ritual de alinhamento.' },
  { id: 'produto', title: 'Estratégia do produto', help: 'Entende as prioridades e o porquê do roadmap?', lo: 'Nada claro', hi: 'Muito claro', tip: 'Que tal pedir ao PM um resumo das prioridades do trimestre?' },
  { id: 'negocio', title: 'Estratégia de negócio', help: 'Conecta o trabalho às metas da empresa?', lo: 'Nada claro', hi: 'Muito claro', tip: 'A estratégia de negócio está pouco clara. Quer levar isso para o próximo 1:1?' },
] as const;

// ---------- Decks do squad (M7) ----------
export const EVIDENCE_TYPES = ['Dado', 'Pesquisa', 'Fala de usuário', 'Link'] as const;
const evidence = z.object({ tipo: z.enum(EVIDENCE_TYPES), texto: text(500).min(1) });
const action = z.object({ texto: text(300).min(1), dono: text(80).optional().default(''), prazo: text(40).optional().default(''), done: z.boolean().optional().default(false) });
const lvl = z.number().int().min(1).max(5);
const nameOf = (msg: string) => text(160).min(1, msg);
export const squadCardSchema = z.discriminatedUnion('deck', [
  z.object({ deck: z.literal('DESAFIO'), title: nameOf('Dê um nome ao desafio para salvar.'), cenario: text(1500).optional().default(''), complexidade: lvl.default(3), evidencias: z.array(evidence).max(20).default([]), abordagem: text(1500).optional().default(''), acoes: z.array(action).max(30).default([]) }),
  z.object({ deck: z.literal('FRENTE'), title: nameOf('Dê um nome à frente para seguir.'), oque: text(1500).optional().default(''), impacto: text(1000).optional().default(''), nivel: lvl.default(1), evidencias: z.array(evidence).max(20).default([]), acoes: z.array(action).max(30).default([]), championPersonId: z.string().uuid().nullable().optional().default(null) }),
  z.object({ deck: z.literal('ESTRATEGIA'), title: nameOf('Dê um título ao item de estratégia.'), texto: text(2000).optional().default('') }),
  z.object({ deck: z.literal('INDICADOR'), title: nameOf('Dê um nome ao indicador.'), valor: text(40).optional().default(''), variacao: z.enum(['sobe', 'desce', 'estavel']).default('estavel'), challengeId: z.string().uuid().nullable().optional().default(null) }),
  z.object({ deck: z.literal('ALAVANCA'), title: nameOf('Dê um nome à alavanca.'), descricao: text(1500).optional().default('') }),
]);
export type SquadCardInput = z.infer<typeof squadCardSchema>;
export const cardStatusSchema = z.object({ status: z.enum(['ABERTA', 'ENCERRADA']) });
export const SQUAD_DECK_SLUGS = { desafios: 'DESAFIO', frentes: 'FRENTE', estrategia: 'ESTRATEGIA', indicadores: 'INDICADOR', alavancas: 'ALAVANCA' } as const;

// ---------- Eventos da pessoa (M6) ----------
const items = z.array(text(300).min(1)).max(20).default([]);
const evBase = { title: text(160).min(1, 'Dê um título ao evento para seguir.'), date: day.optional(), body: text(2000).optional().default('') };
export const eventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('CHECKIN'), ...evBase, pedidos: items, radar: items, combinados: items, proximo: items }),
  z.object({ type: z.literal('FEEDBACK'), ...evBase, autor: text(120).optional().default(''), anexos: z.array(text(300).min(1)).max(10).default([]) }),
  z.object({ type: z.literal('PROMOCAO'), ...evBase, de: text(120).optional().default(''), para: text(120).optional().default(''), msg: text(1000).optional().default('') }),
  z.object({ type: z.literal('MERITO'), ...evBase, msg: text(1000).optional().default('') }),
  z.object({ type: z.literal('MUDANCA_TIME'), ...evBase, de: text(120).optional().default(''), para: text(120).optional().default(''), msg: text(1000).optional().default('') }),
]);
export type EventInput = z.infer<typeof eventSchema>;
export const eventCommentSchema = z.object({ text: text(1000).min(1, 'Escreva o comentário para publicar.') });
export const EVENT_TYPE_LABEL = { CHECKIN: 'Check-in', FEEDBACK: 'Feedback', ENTREGA: 'Entrega', PROMOCAO: 'Promoção', MERITO: 'Mérito', MUDANCA_TIME: 'Mudança de time' } as const;
