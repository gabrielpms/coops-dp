import { z } from 'zod';
import { TOOLS } from '@/lib/tools';

// Saída de cada passo do motor. Tudo é validado antes de ser guardado; o que falta vira texto "[CONFIRMAR …]", nunca número inventado.
// Texto do modelo: se passar do limite, corta em vez de rejeitar o parecer inteiro.
const txt = (n = 600) => z.string().trim().transform((s) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s));
const score = z.coerce.number().min(0).max(100).transform((n) => Math.round(n));
const sev = z.enum(['CRITICO', 'ALTO', 'MEDIO', 'BAIXO']).catch('MEDIO');
const lvl = z.enum(['ALTO', 'MEDIO', 'BAIXO']).catch('MEDIO');
const FRENTES = ['heuristica', 'metricas', 'estrategia'] as const;
export type Frente = (typeof FRENTES)[number];

export const routerSchema = z.object({
  tipoMaterial: txt(120).default(''),
  frentes: z.array(z.enum(FRENTES)).min(1).max(3),
  coreAction: txt(300).default(''),
  suposicoes: z.array(txt(300)).max(8).default([]),
  justificativa: txt(500).default(''),
});
export type Router = z.infer<typeof routerSchema>;

export const heuristicaSchema = z.object({
  score,
  resumo: txt(800),
  achados: z.array(z.object({ tela: txt(80).default(''), titulo: txt(160), severidade: sev, principio: txt(160).default(''), descricao: txt(700), recomendacao: txt(700).default('') })).max(15).default([]),
});
export const metricasSchema = z.object({
  coreAction: txt(300),
  confirmada: z.boolean().catch(false),
  pontos: z.array(z.object({ tela: txt(80).default(''), camada: z.enum(['NEGOCIO', 'PRODUTO', 'EXPERIENCIA']).catch('PRODUTO'), evento: txt(200), porque: txt(500).default('') })).max(25).default([]),
  lacunas: z.array(txt(300)).max(10).default([]),
});
export const estrategiaSchema = z.object({
  score,
  problema: z.object({ veredito: z.enum(['CLARO', 'PARCIAL', 'AUSENTE']).catch('PARCIAL'), justificativa: txt(600) }),
  gaps: z.array(z.object({ titulo: txt(160), severidade: sev, descricao: txt(600) })).max(12).default([]),
  cenarios: z.array(z.object({ titulo: txt(160), plausibilidade: z.enum(['PROVAVEL', 'PLAUSIVEL', 'POSSIVEL', 'SURPRESA']).catch('POSSIVEL'), sinalAlerta: txt(300).default(''), mitigacao: txt(400).default('') })).max(8).default([]),
  horizontes: z.object({ h1: txt(500).default(''), h2: txt(500).default(''), h3: txt(500).default('') }).default({ h1: '', h2: '', h3: '' }),
  dicas: z.object({ quick: z.array(txt(300)).max(8).default([]), estruturantes: z.array(txt(300)).max(8).default([]) }).default({ quick: [], estruturantes: [] }),
  provocacoes: z.array(txt(300)).max(12).default([]),
});
const TOOL_IDS = TOOLS.map((t) => t.id);
export const consolidadoSchema = z.object({
  resumo: txt(900),
  scoreUsabilidade: score.nullable().catch(null),
  scoreEstrategico: score.nullable().catch(null),
  coreAction: txt(300).default(''),
  maiorRisco: txt(400).default(''),
  recomendacao: txt(500).default(''),
  prioridades: z.array(z.object({ item: txt(300), frentes: z.array(z.enum(FRENTES)).max(3).default([]), impacto: lvl, esforco: lvl, tela: txt(80).default('') })).max(10).default([]),
  proximosPassos: z.array(z.object({ acao: txt(300), dono: z.enum(['DESIGN', 'PRODUTO', 'DADOS', 'ENGENHARIA']).catch('PRODUTO') })).max(6).default([]),
  momento: z.coerce.number().int().min(1).max(5),
  motivoMomento: txt(500).default(''),
  ferramentas: z.array(z.string()).max(12).default([]).transform((ids) => ids.filter((i) => TOOL_IDS.includes(i)).slice(0, 6)),
});
export type Consolidado = z.infer<typeof consolidadoSchema>;

export type Resultados = Partial<{ rotear: Router; heuristica: z.infer<typeof heuristicaSchema>; metricas: z.infer<typeof metricasSchema>; estrategia: z.infer<typeof estrategiaSchema>; consolidar: Consolidado }>;
export const FRONT_SCHEMA = { heuristica: heuristicaSchema, metricas: metricasSchema, estrategia: estrategiaSchema } as const;

/** Extrai o último bloco JSON da resposta (cerca ```json ou o último objeto {...}) e o devolve já interpretado. */
export function extractJson(text: string): unknown {
  const fences = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)].map((m) => m[1].trim()).filter((x) => x.startsWith('{') || x.startsWith('['));
  const candidates = fences.length ? fences : [text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)];
  for (const c of candidates.reverse()) { try { return JSON.parse(c); } catch { /* tenta o anterior */ } }
  throw new Error('A resposta do agente não trouxe um JSON válido.');
}
