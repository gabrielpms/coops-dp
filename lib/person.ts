import { db } from './db';
import { accessibleWhere } from './projects';
import { fail, requireUser, isResponse } from './api/http';
import type { SessionUser } from './session';
import type { NextResponse } from 'next/server';

export type PersonCtx = { user: SessionUser; person: { id: string; projectId: string; userId: string | null; name: string }; isOwn: boolean; isManager: boolean };

/** Quem pode ver os decks de uma pessoa: a própria pessoa ou um manager do projeto (PRD §7). */
export async function personAccess(personId: string): Promise<PersonCtx | NextResponse> {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const person = await db.person.findFirst({ where: { id: personId, deletedAt: null, project: accessibleWhere(user.id) }, select: { id: true, projectId: true, userId: true, name: true } });
  if (!person) return fail(404, 'Pessoa não encontrada');
  const isOwn = person.userId === user.id, isManager = user.role === 'MANAGER';
  if (!isOwn && !isManager) return fail(403, 'Você só vê os seus próprios decks');
  return { user, person, isOwn, isManager };
}

/** Escrita nos decks da própria pessoa (o manager só lê; exceção: nota de skill e power up). */
export async function ownerAccess(personId: string): Promise<PersonCtx | NextResponse> {
  const ctx = await personAccess(personId);
  if (isResponse(ctx)) return ctx;
  if (!ctx.isOwn) return fail(403, 'Só a própria pessoa edita este deck');
  return ctx;
}

import { notFound, redirect } from 'next/navigation';
import { currentUser } from './session';

/** Carrega a pessoa para as páginas de deck: login, acesso ao projeto e regra "IC só vê o próprio". */
export async function loadPersonPage(projectId: string, personId: string) {
  const user = await currentUser();
  if (!user) redirect('/cadastro');
  const person = await db.person.findFirst({
    where: { id: personId, projectId, deletedAt: null, project: accessibleWhere(user.id) },
    include: { squads: { include: { squad: true } } },
  });
  if (!person) notFound();
  const isOwn = person.userId === user.id, isManager = user.role === 'MANAGER';
  if (!isOwn && !isManager) redirect('/hub');
  return { user, person, isOwn, isManager };
}
