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
