import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { studySchema } from '@/lib/validation';
import { ownerAccess } from '@/lib/person';

type Ctx = { params: Promise<{ personId: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { personId } = await params;
  const ctx = await ownerAccess(personId);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, studySchema);
  if (isResponse(body)) return body;
  if (body.skillId && !(await db.skill.findFirst({ where: { id: body.skillId, projectId: ctx.person.projectId } }))) return fail(400, 'Skill não encontrada neste projeto.');
  const s = await db.studyItem.create({ data: { personId, type: body.type, title: body.title, url: body.url || null, skillId: body.skillId, total: body.total } });
  await db.draft.deleteMany({ where: { userId: ctx.user.id, scope: 'study', entityId: personId } });
  return json({ item: { id: s.id } }, 201);
}
