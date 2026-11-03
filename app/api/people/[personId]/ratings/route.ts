import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { currentCycle, ratingSchema } from '@/lib/validation';
import { personAccess } from '@/lib/person';

type Ctx = { params: Promise<{ personId: string }> };

// Autoavaliação: só a própria pessoa. Nota do manager: só manager (e não na própria carta).
export async function PUT(req: Request, { params }: Ctx) {
  const { personId } = await params;
  const ctx = await personAccess(personId);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, ratingSchema);
  if (isResponse(body)) return body;
  const self = body.selfScore !== undefined, mgr = body.managerScore !== undefined;
  if (self && !ctx.isOwn) return fail(403, 'Só a própria pessoa faz a autoavaliação');
  if (mgr && (!ctx.isManager || ctx.isOwn)) return fail(403, 'A nota do manager é dada por outro manager');
  if (!self && !mgr) return fail(400, 'Nada para salvar');
  if (!(await db.skill.findFirst({ where: { id: body.skillId, projectId: ctx.person.projectId } }))) return fail(400, 'Skill não encontrada neste projeto.');
  const cycle = currentCycle();
  const data = { ...(self ? { selfScore: body.selfScore } : {}), ...(mgr ? { managerScore: body.managerScore } : {}), updatedById: ctx.user.id };
  await db.skillRating.upsert({ where: { personId_skillId_cycle: { personId, skillId: body.skillId, cycle } }, create: { personId, skillId: body.skillId, cycle, ...data }, update: data });
  return json({ ok: true });
}
