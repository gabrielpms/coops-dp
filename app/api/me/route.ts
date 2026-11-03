import { db } from '@/lib/db';
import { userPatchSchema } from '@/lib/validation';
import { verifyPassword } from '@/lib/password';
import { fail, isResponse, json, parse, requireUser } from '@/lib/api/http';

export async function GET() {
  const u = await requireUser();
  if (isResponse(u)) return u;
  return json({ id: u.id, name: u.name, email: u.email, phone: u.phone, title: u.title, role: u.role, avatar: u.avatar, onboardingStep: u.onboardingStep });
}

// Dados do usuário (M4). Trocar o e-mail muda o login, então exige a senha atual e e-mail ainda livre.
export async function PATCH(req: Request) {
  const u = await requireUser();
  if (isResponse(u)) return u;
  const body = await parse(req, userPatchSchema);
  if (isResponse(body)) return body;
  const { currentPassword, email, ...rest } = body;
  const data: Record<string, unknown> = { ...rest };
  if (email && email !== u.email) {
    if (!currentPassword || !verifyPassword(currentPassword, u.passwordHash)) return fail(403, 'Para trocar o e-mail, confirme sua senha atual.');
    if (await db.user.findUnique({ where: { email } })) return fail(409, 'Esse e-mail já está em uso por outra conta.');
    data.email = email;
  }
  const next = await db.$transaction(async (tx) => {
    const n = await tx.user.update({ where: { id: u.id }, data });
    // "As mudanças aparecem em todos os projetos": cartas ligadas a esta conta acompanham
    await tx.person.updateMany({ where: { userId: u.id }, data: { ...(body.name ? { name: body.name } : {}), ...(body.title !== undefined ? { title: body.title || null } : {}), ...(body.avatar ? { avatar: body.avatar } : {}), ...(data.email ? { email: data.email as string } : {}) } });
    return n;
  });
  return json({ id: next.id, name: next.name, title: next.title, email: next.email, avatar: next.avatar });
}
