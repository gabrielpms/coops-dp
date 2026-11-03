import { db } from './db';
import { accessibleWhere } from './projects';
import { fail, requireUser, isResponse } from './api/http';
import type { SessionUser } from './session';
import type { NextResponse } from 'next/server';
import { notFound, redirect } from 'next/navigation';
import { currentUser } from './session';

export type SquadCtx = { user: SessionUser; squad: { id: string; projectId: string; name: string; color: string }; isManager: boolean; isMember: boolean };

async function find(userId: string, squadId: string) {
  return db.squad.findFirst({ where: { id: squadId, deletedAt: null, project: accessibleWhere(userId) }, select: { id: true, projectId: true, name: true, color: true, members: { select: { person: { select: { userId: true } } } } } });
}

/** Ver o squad: manager do projeto ou pessoa que faz parte do squad ("Você está vendo como time"). */
export async function squadAccess(squadId: string, write = false): Promise<SquadCtx | NextResponse> {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const s = await find(user.id, squadId);
  if (!s) return fail(404, 'Squad não encontrado');
  const isManager = user.role === 'MANAGER', isMember = s.members.some((m) => m.person.userId === user.id);
  if (!isManager && !isMember) return fail(403, 'Você só vê os squads dos quais faz parte');
  if (write && !isManager) return fail(403, 'Só o manager edita os decks do squad');
  return { user, squad: { id: s.id, projectId: s.projectId, name: s.name, color: s.color }, isManager, isMember };
}

export async function loadSquadPage(projectId: string, squadId: string) {
  const user = await currentUser();
  if (!user) redirect('/cadastro');
  const s = await find(user.id, squadId);
  if (!s || s.projectId !== projectId) notFound();
  const isManager = user.role === 'MANAGER', isMember = s.members.some((m) => m.person.userId === user.id);
  if (!isManager && !isMember) redirect('/hub');
  return { user, squad: { id: s.id, projectId: s.projectId, name: s.name, color: s.color }, isManager };
}
