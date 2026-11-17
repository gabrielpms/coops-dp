import { z } from 'zod';
import { db } from '@/lib/db';
import { isResponse, json, parse } from '@/lib/api/http';
import { requireManagerOfProject } from '@/lib/team';

type Ctx = { params: Promise<{ id: string }> };
const schema = z.object({ months: z.union([z.literal(3), z.literal(4), z.literal(6)]) });

// Duração dos ciclos do projeto (3, 4 ou 6 meses). Só manager.
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, schema);
  if (isResponse(body)) return body;
  await db.project.update({ where: { id }, data: { cycleMonths: body.months } });
  return json({ ok: true, months: body.months });
}
