import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { personSquadSchema } from '@/lib/validation';
import { requireManagerOfProject } from '@/lib/team';
import { placeInSquad, squadInProject } from '@/lib/squadMembership';

type Ctx = { params: Promise<{ id: string; personId: string }> };

// Manager coloca uma pessoa do projeto em um squad (quem estava em outro muda para este) ou a tira de todos (`squadId: null`).
export async function PUT(req: Request, { params }: Ctx) {
  const { id, personId } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, personSquadSchema);
  if (isResponse(body)) return body;
  if (!(await db.person.count({ where: { id: personId, projectId: id, deletedAt: null } }))) return fail(404, 'Pessoa não encontrada neste projeto.');
  if (body.squadId && !(await squadInProject(id, body.squadId))) return fail(400, 'Esse squad não existe neste projeto.');
  await db.$transaction((tx) => placeInSquad(tx, id, personId, body.squadId));
  return json({ ok: true });
}
