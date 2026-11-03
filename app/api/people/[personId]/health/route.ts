import { db } from '@/lib/db';
import { isResponse, json, parse } from '@/lib/api/http';
import { currentCycle, healthSchema } from '@/lib/validation';
import { ownerAccess } from '@/lib/person';

type Ctx = { params: Promise<{ personId: string }> };

// Check-in de saúde: só a própria pessoa responde; ela e o manager veem.
export async function POST(req: Request, { params }: Ctx) {
  const { personId } = await params;
  const ctx = await ownerAccess(personId);
  if (isResponse(ctx)) return ctx;
  const b = await parse(req, healthSchema);
  if (isResponse(b)) return b;
  const c = await db.healthCheckin.create({ data: { personId, cycle: currentCycle(), saude: b.saude, design: b.design, produto: b.produto, negocio: b.negocio, note: b.note || null } });
  return json({ checkin: { id: c.id } }, 201);
}
