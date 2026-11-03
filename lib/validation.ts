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
