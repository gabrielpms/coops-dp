import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { adminAccountSchema } from '@/lib/validation';
import { requireManagerOfProject } from '@/lib/team';
import { hashPassword } from '@/lib/password';

type Ctx = { params: Promise<{ id: string; personId: string }> };

async function pending(projectId: string, personId: string) {
  return db.person.findFirst({ where: { id: personId, projectId, userId: null, deletedAt: null }, select: { id: true } });
}

// Cria o acesso (conta + senha) de uma pessoa do projeto que ainda não tinha conta.
export async function POST(req: Request, { params }: Ctx) {
  const { id, personId } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  if (!(await pending(id, personId))) return fail(404, 'Pessoa não encontrada ou já tem acesso.');
  const body = await parse(req, adminAccountSchema);
  if (isResponse(body)) return body;
  if (await db.user.findUnique({ where: { email: body.email } })) return fail(409, 'Esse e-mail já tem uma conta no Coops.');
  if (await db.person.findFirst({ where: { projectId: id, email: body.email, deletedAt: null, NOT: { id: personId } } })) return fail(409, 'Já existe uma pessoa com esse e-mail neste projeto.');
  await db.$transaction(async (tx) => {
    const u = await tx.user.create({ data: { name: body.name, email: body.email, passwordHash: hashPassword(body.password), role: body.role, onboardingStep: 3, title: body.title || null, avatar: body.avatar ?? undefined } });
    await tx.person.update({ where: { id: personId }, data: { userId: u.id, name: body.name, title: body.title || null, email: body.email, avatar: body.avatar ?? undefined } });
  });
  return json({ ok: true });
}

// Exclui do projeto uma pessoa que ainda não tem conta.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id, personId } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  if (!(await pending(id, personId))) return fail(404, 'Pessoa não encontrada.');
  await db.$transaction([
    db.leadership.updateMany({ where: { personId }, data: { deletedAt: new Date() } }),
    db.person.update({ where: { id: personId }, data: { deletedAt: new Date() } }),
  ]);
  return json({ ok: true });
}
