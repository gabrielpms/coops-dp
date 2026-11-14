import { db } from '@/lib/db';
import { fail, isResponse, json } from '@/lib/api/http';
import { initiativeAccess } from '@/lib/initiatives';
import { responseFor, toolById } from '@/lib/tools';

type Ctx = { params: Promise<{ id: string }> };

/** "Jogar uma carta": cria o deck de resposta (uma vez só por ferramenta; jogar de novo reabre o mesmo, com as decisões). */
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await initiativeAccess(id, true);
  if (isResponse(ctx)) return ctx;
  const { toolId } = await req.json().catch(() => ({}));
  const tool = typeof toolId === 'string' ? toolById(toolId) : undefined;
  if (!tool) return fail(400, 'Ferramenta desconhecida.');
  const existing = await db.toolPlay.findUnique({ where: { initiativeId_toolId: { initiativeId: id, toolId: tool.id } } });
  if (existing) return json({ play: { id: existing.id } });
  const play = await db.toolPlay.create({ data: { initiativeId: id, toolId: tool.id, cards: { create: responseFor(tool, ctx.initiative.product).map((c, position) => ({ ...c, position })) } } });
  return json({ play: { id: play.id } }, 201);
}
