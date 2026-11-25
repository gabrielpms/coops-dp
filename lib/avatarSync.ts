import { db } from './db';

type Av = Record<string, unknown> | null | undefined;
const norm = (a: Av) => JSON.stringify(Object.entries(a ?? {}).filter(([k]) => k !== 'crown').sort(([x], [y]) => x.localeCompare(y)));

/** A conta é a fonte do avatar: ao abrir um projeto, a carta da pessoa passa a ser igual (a coroa continua só em quem é liderança). */
export async function syncPersonAvatar(userId: string, projectId: string, userAvatar: Av) {
  if (!userAvatar) return;
  const me = await db.person.findFirst({ where: { projectId, userId, deletedAt: null }, select: { id: true, avatar: true, leads: { select: { deletedAt: true } } } });
  if (!me) return;
  const leader = !!me.leads && !me.leads.deletedAt;
  const same = norm(me.avatar as Av) === norm(userAvatar) && (!leader || (me.avatar as Av & { crown?: boolean })?.crown === true);
  if (same) return;
  await db.person.update({ where: { id: me.id }, data: { avatar: leader ? { ...userAvatar, crown: true } : (userAvatar as object) } });
}
