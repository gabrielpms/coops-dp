import { z } from 'zod';
import { db } from '@/lib/db';
import { fail, isResponse, json, parse, requireUser } from '@/lib/api/http';
import { accessibleWhere } from '@/lib/projects';

const schema = z.object({ decision: z.enum(['KEPT', 'DISCARDED']).nullable().optional(), note: z.string().trim().max(1000).optional() });

/** Salva a decisão ("Para a mesa" / "Descartar") e as notas na hora: fechar no meio mantém o progresso. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  if (user.role !== 'MANAGER') return fail(403, 'Só o manager conduz a iniciativa');
  const { id } = await params;
  const body = await parse(req, schema);
  if (isResponse(body)) return body;
  const card = await db.responseCard.findFirst({ where: { id, play: { initiative: { project: accessibleWhere(user.id) } } } });
  if (!card) return fail(404, 'Carta não encontrada');
  await db.responseCard.update({ where: { id }, data: { ...(body.decision !== undefined && { decision: body.decision }), ...(body.note !== undefined && { note: body.note || null }) } });
  return json({ ok: true });
}
