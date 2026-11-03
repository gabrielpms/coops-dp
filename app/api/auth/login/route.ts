import { db } from '@/lib/db';
import { createSession } from '@/lib/session';
import { verifyPassword } from '@/lib/password';
import { fail, json, parse, isResponse } from '@/lib/api/http';
import { loginSchema } from '@/lib/validation';

export async function POST(req: Request) {
  const body = await parse(req, loginSchema);
  if (isResponse(body)) return body;
  const user = await db.user.findUnique({ where: { email: body.email } });
  // Mesma resposta (e mesmo custo de tempo) para e-mail inexistente e senha errada.
  const ok = verifyPassword(body.password, user?.passwordHash);
  if (!user || !ok) return fail(401, 'E-mail ou senha incorretos.');
  await createSession(user.id);
  return json({ ok: true, next: '/hub' });
}
