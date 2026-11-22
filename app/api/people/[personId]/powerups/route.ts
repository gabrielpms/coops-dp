import { db } from '@/lib/db';
import { isResponse, json, parse } from '@/lib/api/http';
import { powerUpSchema } from '@/lib/validation';
import { personAccess } from '@/lib/person';

type Ctx = { params: Promise<{ personId: string }> };

// Power up: a pessoa e o manager veem o resultado; os dois podem cadastrar.
export async function POST(req: Request, { params }: Ctx) {
  const { personId } = await params;
  const ctx = await personAccess(personId);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, powerUpSchema);
  if (isResponse(body)) return body;
  const p = await db.powerUp.create({ data: { personId, type: body.type, name: body.name, skill: body.skill || null, frequency: body.type === 'MENTORIA' ? body.frequency || null : null, progress: body.type === 'MENTORIA' ? 0 : body.progress, createdById: ctx.user.id } });
  // Curso de power up também vira conteúdo do Brain gym (tipo Curso), para os dois mostrarem o mesmo andamento.
  if (body.type === 'CURSO') {
    const skill = body.skill ? await db.skill.findFirst({ where: { projectId: ctx.person.projectId, name: body.skill }, select: { id: true } }) : null;
    await db.studyItem.create({ data: { personId, type: 'CURSO', title: body.name, skillId: skill?.id ?? null, total: 10, progress: Math.round(body.progress / 10), powerUpId: p.id } });
  }
  await db.draft.deleteMany({ where: { userId: ctx.user.id, scope: 'powerup', entityId: personId } });
  return json({ powerUp: { id: p.id } }, 201);
}
