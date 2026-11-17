import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { memberSchema } from '@/lib/validation';
import { requireManagerOfProject } from '@/lib/team';
import { hashPassword } from '@/lib/password';

type Ctx = { params: Promise<{ id: string }> };

// Nova pessoa: cria a conta (e-mail + senha definida por quem cadastra) e a carta no Time, já vinculadas. Sem convite por e-mail.
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, memberSchema);
  if (isResponse(body)) return body;
  const dupe = await db.person.findFirst({ where: { projectId: id, email: body.email, deletedAt: null } });
  if (dupe) return fail(409, 'Já existe uma pessoa com esse e-mail neste projeto.');
  if (await db.user.findUnique({ where: { email: body.email } })) return fail(409, 'Esse e-mail já tem uma conta no Coops. Use outro e-mail ou peça para a pessoa entrar com a conta dela.');
  const person = await db.$transaction(async (tx) => {
    const u = await tx.user.create({ data: { name: body.name, email: body.email, passwordHash: hashPassword(body.password), role: 'IC', onboardingStep: 3, title: body.title || null, avatar: body.avatar ?? undefined } });
    const p = await tx.person.create({ data: { projectId: id, userId: u.id, name: body.name, title: body.title || null, email: body.email, mainSkill: body.mainSkill || null, joinedAt: body.joinedAt ? new Date(body.joinedAt) : null, avatar: body.avatar ?? undefined } });
    await tx.invite.updateMany({ where: { projectId: id, email: body.email, status: 'PENDING' }, data: { status: 'ACCEPTED' } });
    return p;
  });
  await db.draft.deleteMany({ where: { userId: ctx.user.id, scope: 'member', entityId: id } });
  return json({ person: { id: person.id } }, 201);
}
