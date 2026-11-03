import { db } from '@/lib/db';
import { isResponse, json, parse } from '@/lib/api/http';
import { currentCycle, journeySchema } from '@/lib/validation';
import { ownerAccess } from '@/lib/person';

type Ctx = { params: Promise<{ personId: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { personId } = await params;
  const ctx = await ownerAccess(personId);
  if (isResponse(ctx)) return ctx;
  const b = await parse(req, journeySchema);
  if (isResponse(b)) return b;
  const g = await db.journeyGoal.create({ data: { personId, cycle: currentCycle(), kind: b.kind, title: b.title, why: b.why || null, signal: b.kind === 'OBJETIVO' ? b.signal || null : null, measure: b.kind === 'OBJETIVO' ? b.measure || null : null, levelFrom: b.kind === 'FOCO' ? b.levelFrom : null, levelTo: b.kind === 'FOCO' ? b.levelTo : null, practice: b.kind === 'FOCO' ? b.practice || null : null, createdById: ctx.user.id } });
  await db.draft.deleteMany({ where: { userId: ctx.user.id, scope: `journey:${b.kind}`, entityId: personId } });
  return json({ goal: { id: g.id } }, 201);
}
