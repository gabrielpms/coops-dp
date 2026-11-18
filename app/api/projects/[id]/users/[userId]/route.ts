import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { adminUserPatchSchema } from '@/lib/validation';
import { requireManagerOfProject } from '@/lib/team';
import { hashPassword } from '@/lib/password';
import { sealSecret } from '@/lib/secret';

type Ctx = { params: Promise<{ id: string; userId: string }> };

/** Quem pode ser gerida: pessoa com conta neste projeto, que não seja a própria pessoa logada nem a dona do projeto. */
async function target(projectId: string, userId: string, meId: string) {
  const person = await db.person.findFirst({ where: { projectId, userId, deletedAt: null }, include: { user: true, project: { select: { ownerId: true } } } });
  if (!person || !person.user) return { error: fail(404, 'Usuário não encontrado neste projeto.') } as const;
  if (userId === meId) return { error: fail(400, 'Edite os seus próprios dados pelo seu avatar.') } as const;
  if (person.project.ownerId === userId) return { error: fail(403, 'A conta de quem criou o projeto não pode ser alterada por aqui.') } as const;
  return { person, user: person.user } as const;
}

// Manager edita tudo de um usuário: nome, e-mail, cargo, avatar, papel, senha e bloqueio.
export async function PATCH(req: Request, { params }: Ctx) {
  const { id, userId } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  const t = await target(id, userId, ctx.user.id);
  if ('error' in t) return t.error;
  const body = await parse(req, adminUserPatchSchema);
  if (isResponse(body)) return body;
  if (body.email && body.email !== t.user.email && (await db.user.findUnique({ where: { email: body.email } }))) return fail(409, 'Esse e-mail já tem uma conta no Coops.');
  if (body.email && body.email !== t.person.email && (await db.person.findFirst({ where: { projectId: id, email: body.email, deletedAt: null, NOT: { id: t.person.id } } }))) return fail(409, 'Já existe uma pessoa com esse e-mail neste projeto.');
  await db.$transaction([
    db.user.update({ where: { id: userId }, data: {
      ...(body.name !== undefined ? { name: body.name } : {}), ...(body.title !== undefined ? { title: body.title || null } : {}), ...(body.phone !== undefined ? { phone: body.phone || null } : {}),
      ...(body.email ? { email: body.email } : {}), ...(body.role ? { role: body.role } : {}), ...(body.avatar ? { avatar: body.avatar } : {}),
      ...(body.password ? { passwordHash: hashPassword(body.password), accessPassword: sealSecret(body.password) } : {}), ...(body.blocked !== undefined ? { blockedAt: body.blocked ? new Date() : null } : {}),
    } }),
    // a carta da pessoa neste projeto acompanha
    db.person.update({ where: { id: t.person.id }, data: { ...(body.name !== undefined ? { name: body.name } : {}), ...(body.title !== undefined ? { title: body.title || null } : {}), ...(body.email ? { email: body.email } : {}), ...(body.avatar ? { avatar: body.avatar } : {}) } }),
  ]);
  return json({ ok: true });
}

// Exclui o usuário do projeto. A conta some junto se não for de outros projetos; senão, a pessoa só sai deste.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id, userId } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  const t = await target(id, userId, ctx.user.id);
  if ('error' in t) return t.error;
  const otherProjects = await db.person.count({ where: { userId, deletedAt: null, NOT: { projectId: id } } });
  const owns = await db.project.count({ where: { ownerId: userId, deletedAt: null } });
  await db.$transaction(async (tx) => {
    await tx.leadership.updateMany({ where: { personId: t.person.id }, data: { deletedAt: new Date() } });
    await tx.person.update({ where: { id: t.person.id }, data: { deletedAt: new Date() } });
    if (!otherProjects && !owns) await tx.user.delete({ where: { id: userId } });
  });
  return json({ ok: true, accountDeleted: !otherProjects && !owns });
}
