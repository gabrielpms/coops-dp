import { db } from '@/lib/db';
import { hostOf, projectDataSchema } from '@/lib/validation';
import { isResponse, json, parse } from '@/lib/api/http';
import { requireManagerOfProject } from '@/lib/team';

type Ctx = { params: Promise<{ id: string }> };

// Dados do projeto (M4): empresa, segmento, indicadores-chave e concorrentes.
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, projectDataSchema);
  if (isResponse(body)) return body;
  await db.$transaction([
    db.project.update({ where: { id }, data: { name: body.name, segment: body.segment } }),
    db.keyIndicator.deleteMany({ where: { projectId: id } }),
    db.competitor.deleteMany({ where: { projectId: id } }),
    db.keyIndicator.createMany({ data: body.indicators.map((name, position) => ({ projectId: id, name, position })) }),
    db.competitor.createMany({ data: body.competitors.map((name, position) => ({ projectId: id, name, position })) }),
  ]);
  await db.draft.deleteMany({ where: { userId: ctx.user.id, scope: 'pdata', entityId: id } });
  return json({ ok: true });
}
void hostOf;
