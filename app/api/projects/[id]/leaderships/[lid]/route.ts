import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { leadershipSchema } from '@/lib/validation';
import { requireManagerOfProject } from '@/lib/team';
import { setLeadershipLinks } from '@/lib/leadership';

type Ctx = { params: Promise<{ id: string; lid: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { id, lid } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  const lead = await db.leadership.findFirst({ where: { id: lid, projectId: id, deletedAt: null } });
  if (!lead) return fail(404, 'Liderança não encontrada');
  const body = await parse(req, leadershipSchema);
  if (isResponse(body)) return body;
  try {
    await db.$transaction(async (tx) => {
      await tx.person.update({ where: { id: lead.personId }, data: { name: body.name, title: body.title || null, ...(body.avatar ? { avatar: { ...body.avatar, crown: true } } : {}) } });
      await setLeadershipLinks(tx, lid, id, body.squadIds, body.memberIds.filter((m) => m !== lead.personId));
    });
  } catch (e) {
    if ((e as Error).message === 'INVALID_LINKS') return fail(400, 'Algum squad ou pessoa escolhido não faz parte deste projeto.');
    throw e;
  }
  return json({ ok: true });
}

// Remover a liderança tira o papel e as associações; a carta da pessoa continua no Time.
export async function DELETE(_: Request, { params }: Ctx) {
  const { id, lid } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  const lead = await db.leadership.findFirst({ where: { id: lid, projectId: id, deletedAt: null } });
  if (!lead) return fail(404, 'Liderança não encontrada');
  await db.$transaction([
    db.leadershipSquad.deleteMany({ where: { leadershipId: lid } }),
    db.leadershipMember.deleteMany({ where: { leadershipId: lid } }),
    db.leadership.update({ where: { id: lid }, data: { deletedAt: new Date() } }),
  ]);
  return json({ ok: true });
}
