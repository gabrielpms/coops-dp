import { db } from './db';
import { accessibleWhere } from './projects';
import { fail, requireUser, isResponse } from './api/http';
import type { SessionUser } from './session';
import type { NextResponse } from 'next/server';

/** Iniciativa do projeto a que a pessoa tem acesso; `write` exige manager. */
export async function initiativeAccess(id: string, write = false): Promise<{ user: SessionUser; initiative: { id: string; projectId: string; product: string; tableOpenedAt: Date | null } } | NextResponse> {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const initiative = await db.initiative.findFirst({ where: { id, project: accessibleWhere(user.id) }, select: { id: true, projectId: true, product: true, tableOpenedAt: true } });
  if (!initiative) return fail(404, 'Iniciativa não encontrada');
  if (write && user.role !== 'MANAGER') return fail(403, 'Só o manager conduz a iniciativa');
  return { user, initiative };
}
