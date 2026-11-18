import { z } from 'zod';
import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { requireManagerOfProject } from '@/lib/team';
import { placeInSquad, squadInProject } from '@/lib/squadMembership';

type Ctx = { params: Promise<{ id: string; squadId: string }> };

// Manager coloca no squad uma pessoa que já está cadastrada no projeto (quem estava em outro squad muda para este).
export async function POST(req: Request, { params }: Ctx) {
  const { id, squadId } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, z.object({ personId: z.string().uuid() }));
  if (isResponse(body)) return body;
  if (!(await squadInProject(id, squadId))) return fail(404, 'Squad não encontrado neste projeto.');
  if (!(await db.person.count({ where: { id: body.personId, projectId: id, deletedAt: null } }))) return fail(404, 'Pessoa não encontrada neste projeto.');
  await db.$transaction((tx) => placeInSquad(tx, id, body.personId, squadId));
  return json({ ok: true });
}
