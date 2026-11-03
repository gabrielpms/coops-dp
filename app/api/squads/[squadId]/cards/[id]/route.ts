import { db } from '@/lib/db';
import { fail, isResponse, json } from '@/lib/api/http';
import { cardStatusSchema, squadCardSchema } from '@/lib/validation';
import { squadAccess } from '@/lib/squad';
import { checkRefs, splitCard } from '@/lib/squadCards';

type Ctx = { params: Promise<{ squadId: string; id: string }> };

// Encerrar/reabrir (só o status) ou editar a carta inteira.
export async function PATCH(req: Request, { params }: Ctx) {
  const { squadId, id } = await params;
  const ctx = await squadAccess(squadId, true);
  if (isResponse(ctx)) return ctx;
  const cur = await db.squadCard.findFirst({ where: { id, squadId, deletedAt: null } });
  if (!cur) return fail(404, 'Carta não encontrada');
  const raw = await req.json().catch(() => null);
  if (raw && Object.keys(raw).length === 1 && 'status' in raw) {
    const s = cardStatusSchema.safeParse(raw);
    if (!s.success) return fail(400, 'Status inválido');
    await db.squadCard.update({ where: { id }, data: { status: s.data.status, closedAt: s.data.status === 'ENCERRADA' ? new Date() : null, updatedById: ctx.user.id } });
    return json({ ok: true });
  }
  const p = squadCardSchema.safeParse(raw);
  if (!p.success) return fail(400, p.error.issues[0]?.message ?? 'Dados inválidos');
  if (p.data.deck !== cur.deck) return fail(400, 'O tipo da carta não pode mudar.');
  const bad = await checkRefs(squadId, ctx.squad.projectId, p.data);
  if (bad) return fail(400, bad);
  const { deck: _d, ...cols } = splitCard(p.data);
  await db.squadCard.update({ where: { id }, data: { ...cols, updatedById: ctx.user.id } });
  return json({ ok: true });
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { squadId, id } = await params;
  const ctx = await squadAccess(squadId, true);
  if (isResponse(ctx)) return ctx;
  const r = await db.squadCard.updateMany({ where: { id, squadId, deletedAt: null }, data: { deletedAt: new Date() } });
  return r.count ? json({ ok: true }) : fail(404, 'Carta não encontrada');
}
