import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { deliveryImpactSchema, deliverySchema, hostOf } from '@/lib/validation';
import { ownerAccess } from '@/lib/person';

type Ctx = { params: Promise<{ personId: string; id: string }> };

// Edição completa (deck) ou só do impacto (carta em foco): o corpo decide pelo schema.
export async function PATCH(req: Request, { params }: Ctx) {
  const { personId, id } = await params;
  const ctx = await ownerAccess(personId);
  if (isResponse(ctx)) return ctx;
  const cur = await db.delivery.findFirst({ where: { id, personId, deletedAt: null } });
  if (!cur) return fail(404, 'Entrega não encontrada');
  const raw = await req.json().catch(() => null);
  if (raw && Object.keys(raw).length === 1 && 'impact' in raw) {
    const p = deliveryImpactSchema.safeParse(raw);
    if (!p.success) return fail(400, p.error.issues[0]?.message ?? 'Dados inválidos');
    await db.delivery.update({ where: { id }, data: { impact: p.data.impact, updatedById: ctx.user.id } });
    return json({ ok: true });
  }
  const p = deliverySchema.safeParse(raw);
  if (!p.success) return fail(400, p.error.issues[0]?.message ?? 'Dados inválidos');
  const b = p.data;
  if (b.initiativeId && !(await db.initiative.findFirst({ where: { id: b.initiativeId, projectId: ctx.person.projectId } }))) return fail(400, 'Iniciativa não encontrada neste projeto.');
  await db.$transaction([
    db.deliveryLink.deleteMany({ where: { deliveryId: id } }),
    db.delivery.update({ where: { id }, data: { title: b.title, description: b.description || null, initiativeId: b.initiativeId, status: b.status, role: b.role || null, impact: b.impact || cur.impact, ...(b.date ? { date: new Date(b.date) } : {}), updatedById: ctx.user.id, links: { create: b.links.map((url) => ({ url, host: hostOf(url) })) } } }),
  ]);
  return json({ ok: true });
}
