import { db } from './db';
import { accessibleWhere } from './projects';
import { fail, requireUser, isResponse } from './api/http';
import type { SessionUser } from './session';
import type { NextResponse } from 'next/server';

/** Garante: logado, manager e dono de acesso ao projeto. Devolve o usuário e o projeto, ou a resposta de erro. */
export async function requireManagerOfProject(id: string): Promise<{ user: SessionUser; project: { id: string; name: string } } | NextResponse> {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const project = await db.project.findFirst({ where: { id, ...accessibleWhere(user.id) }, select: { id: true, name: true } });
  if (!project) return fail(404, 'Projeto não encontrado');
  if (user.role !== 'MANAGER') return fail(403, 'Só managers montam o time');
  return { user, project };
}
