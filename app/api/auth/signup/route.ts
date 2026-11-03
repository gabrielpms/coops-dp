import { db } from '@/lib/db';
import { createSession } from '@/lib/session';
import { fail, json, parse, isResponse } from '@/lib/api/http';
import { hashPassword } from '@/lib/password';
import { signupSchema } from '@/lib/validation';

export async function POST(req: Request) {
  const body = await parse(req, signupSchema);
  if (isResponse(body)) return body;
  const exists = await db.user.findUnique({ where: { email: body.email } });
  if (exists) return fail(409, 'Já existe uma conta com esse e-mail. Use "Entrar".');
  // Convidado: se há convite pendente, o papel segue o convite e já vincula à pessoa/projeto.
  const invites = await db.invite.findMany({ where: { email: body.email, status: 'PENDING' } });
  const user = await db.user.create({
    data: { name: body.name, email: body.email, phone: body.phone || null, passwordHash: hashPassword(body.password), role: invites[0]?.position ?? body.role, onboardingStep: invites.length ? 3 : 2 },
  });
  for (const inv of invites) {
    // A pessoa já existe como carta (criada ao convidar): só vincula à conta. Convites do deck de projeto não criam carta.
    const linked = await db.person.updateMany({ where: { projectId: inv.projectId, email: inv.email, userId: null }, data: { userId: user.id } });
    await db.$transaction([
      ...(linked.count ? [] : [db.person.create({ data: { projectId: inv.projectId, userId: user.id, name: user.name, email: inv.email } })]),
      db.invite.update({ where: { id: inv.id }, data: { status: 'ACCEPTED' } }),
    ]);
  }
  await createSession(user.id);
  return json({ ok: true, next: invites.length ? '/hub' : '/primeiro-acesso' }, 201);
}
