import { db } from '@/lib/db';
import { createSession } from '@/lib/session';
import { fail, json, parse, isResponse } from '@/lib/api/http';
import { signupSchema } from '@/lib/validation';

export async function POST(req: Request) {
  const body = await parse(req, signupSchema);
  if (isResponse(body)) return body;
  const exists = await db.user.findUnique({ where: { email: body.email } });
  if (exists) return fail(409, 'Já existe uma conta com esse e-mail. Use "Entrar".');
  // Convidado: se há convite pendente, o papel segue o convite e já vincula à pessoa/projeto.
  const invites = await db.invite.findMany({ where: { email: body.email, status: 'PENDING' } });
  const user = await db.user.create({
    data: { name: body.name, email: body.email, phone: body.phone || null, role: invites[0]?.position ?? body.role, onboardingStep: invites.length ? 3 : 2 },
  });
  for (const inv of invites) {
    await db.$transaction([
      db.person.create({ data: { projectId: inv.projectId, userId: user.id, name: user.name } }),
      db.invite.update({ where: { id: inv.id }, data: { status: 'ACCEPTED' } }),
    ]);
  }
  await createSession(user.id);
  return json({ ok: true, next: invites.length ? '/hub' : '/primeiro-acesso' }, 201);
}
