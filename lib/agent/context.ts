import { db } from '@/lib/db';
import { CONTEXT_META, CONTEXT_KINDS } from '@/lib/validation';

export type Material = 'tela' | 'documento' | 'planilha' | 'apresentacao' | 'video' | 'outro';
export type RunInput = {
  initiative: { product: string; problem: string; need: string };
  project: { name: string; segment: string; strategy: string; indicators: string[]; competitors: string[] };
  cards: { kind: string; title: string; text: string; links: string[] }[];
  doubts: { question: string; summary: string }[];
  attachments: { id: string; kind: string; name: string; mime: string; size: number; material: Material }[];
};

/** Tipo do material pelo mime: é o que decide quais skills o orquestrador aciona. */
export function materialOf(mime: string): Material {
  if (mime.startsWith('image/')) return 'tela';
  if (mime === 'application/pdf') return 'apresentacao'; // PDF costuma ser deck ou fluxo exportado: o orquestrador trata como telas
  if (/presentationml|ms-powerpoint/.test(mime)) return 'apresentacao';
  if (/spreadsheetml|ms-excel|text\/csv/.test(mime)) return 'planilha';
  if (/wordprocessingml|msword|text\/plain/.test(mime)) return 'documento';
  if (mime.startsWith('video/')) return 'video';
  return 'outro';
}
/** Há telas (imagem, PDF ou apresentação) para as frentes de heurística e métricas? */
export const hasScreens = (i: RunInput) => i.attachments.some((a) => a.material === 'tela' || a.material === 'apresentacao');
/** Arquivos que vão para o container (vídeo fica de fora: a skill não analisa vídeo). */
export const sendable = (i: RunInput) => i.attachments.filter((a) => a.material !== 'video' && a.material !== 'outro').slice(0, 20);

/** Retrato do que o usuário preencheu na plataforma: é a única fonte de contexto do agente (ele não faz perguntas). */
export async function loadRunInput(initiativeId: string): Promise<RunInput | null> {
  const i = await db.initiative.findUnique({
    where: { id: initiativeId },
    include: {
      project: { include: { indicators: { orderBy: { position: 'asc' } }, competitors: { orderBy: { position: 'asc' } } } },
      contextCards: true, doubts: { where: { resolved: true }, orderBy: { position: 'asc' } }, attachments: { where: { uploaded: true }, orderBy: { createdAt: 'asc' } },
    },
  });
  if (!i) return null;
  const order = (k: string) => CONTEXT_KINDS.indexOf(k as (typeof CONTEXT_KINDS)[number]);
  return {
    initiative: { product: i.product, problem: i.problem ?? '', need: i.need || i.deducedNeed || '' },
    project: { name: i.project.name, segment: i.project.segment, strategy: i.project.strategy ?? '', indicators: i.project.indicators.map((x) => x.name), competitors: i.project.competitors.map((x) => x.name) },
    cards: [...i.contextCards].sort((a, b) => order(a.kind) - order(b.kind)).map((c) => ({ kind: c.kind, title: CONTEXT_META[c.kind as keyof typeof CONTEXT_META]?.title ?? c.kind, text: c.text, links: c.links })),
    doubts: i.doubts.map((d) => ({ question: d.question, summary: d.summary ?? '' })),
    attachments: i.attachments.map((a) => ({ id: a.id, kind: a.kind, name: a.name, mime: a.mime, size: a.size, material: materialOf(a.mime) })),
  };
}

/** O contexto como texto para o prompt (o que está vazio é dito, para o agente não inventar). */
export function contextText(i: RunInput): string {
  const cards = i.cards.length ? i.cards.map((c) => `- ${c.title}: ${c.text || '(sem texto)'}${c.links.length ? ` · links: ${c.links.join(', ')}` : ''}`).join('\n') : '- (nenhuma carta de contexto preenchida)';
  const doubts = i.doubts.length ? i.doubts.map((d) => `- ${d.question} → ${d.summary}`).join('\n') : '- (nenhuma)';
  const files = i.attachments.length ? i.attachments.map((a, n) => `- arquivo ${n + 1}: ${a.name} (${a.material}, carta ${a.kind})`).join('\n') : '- (nenhum arquivo anexado)';
  return [
    `PROJETO: ${i.project.name} · segmento ${i.project.segment}${i.project.strategy ? ` · estratégia: ${i.project.strategy}` : ''}`,
    `Indicadores-chave: ${i.project.indicators.join(', ') || '(não informados)'} · Concorrentes: ${i.project.competitors.join(', ') || '(não informados)'}`,
    `INICIATIVA: ${i.initiative.product}`,
    `Problema: ${i.initiative.problem || '(não informado)'}`,
    `Necessidade: ${i.initiative.need || '(não informada)'}`,
    `CARTAS DE CONTEXTO:\n${cards}`,
    `DÚVIDAS RESOLVIDAS COM O AGENTE:\n${doubts}`,
    `MATERIAL ANEXADO:\n${files}`,
  ].join('\n');
}
