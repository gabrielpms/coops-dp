import { db } from '@/lib/db';
import { fail, isResponse, json, requireUser } from '@/lib/api/http';
import { accessibleWhere } from '@/lib/projects';

/** "Revisar de novo": volta todas as cartas do deck para pendentes (notas ficam). */
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  if (user.role !== 'MANAGER') return fail(403, 'Só o manager conduz a iniciativa');
  const { id } = await params;
  const play = await db.toolPlay.findFirst({ where: { id, initiative: { project: accessibleWhere(user.id) } } });
  if (!play) return fail(404, 'Deck não encontrado');
  await db.responseCard.updateMany({ where: { playId: id }, data: { decision: null } });
  return json({ ok: true });
}
