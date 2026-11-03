import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { squadSchema } from '@/lib/validation';
import { requireManagerOfProject } from '@/lib/team';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, squadSchema);
  if (isResponse(body)) return body;
  const ids = [...new Set(body.members.map((m) => m.personId))];
  // Só entram pessoas deste projeto (isolamento por projeto)
  const valid = await db.person.count({ where: { id: { in: ids }, projectId: id, deletedAt: null } });
  if (valid !== ids.length) return fail(400, 'Alguma pessoa escolhida não faz parte deste projeto.');
  if (await db.squad.findFirst({ where: { projectId: id, deletedAt: null, name: { equals: body.name, mode: 'insensitive' } } })) return fail(409, 'Já existe um squad com esse nome.');
  const squad = await db.squad.create({
    data: { projectId: id, name: body.name, color: body.color, members: { create: ids.map((personId) => ({ personId, crown: body.members.find((m) => m.personId === personId)?.crown ?? false })) } },
  });
  await db.draft.deleteMany({ where: { userId: ctx.user.id, scope: 'squad', entityId: id } });
  return json({ squad: { id: squad.id } }, 201);
}
