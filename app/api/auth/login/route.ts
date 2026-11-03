import { createHash, randomBytes } from 'node:crypto';
import { db } from '@/lib/db';
import { json, parse, isResponse } from '@/lib/api/http';
import { loginSchema } from '@/lib/validation';
import { sendMail } from '@/lib/mail';

export const hashToken = (t: string) => createHash('sha256').update(t).digest('hex');

// Link mágico. A resposta é sempre a mesma, exista a conta ou não (não vaza quem tem conta).
export async function POST(req: Request) {
  const body = await parse(req, loginSchema);
  if (isResponse(body)) return body;
  const user = await db.user.findUnique({ where: { email: body.email } });
  let devLink: string | undefined;
  if (user) {
    const token = randomBytes(32).toString('base64url');
    await db.loginToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 15 * 60_000) } });
    const link = `${process.env.APP_URL ?? 'http://localhost:3000'}/api/auth/verify?token=${token}`;
    await sendMail(user.email, 'Seu link de acesso à Coops', `Entre por aqui (vale por 15 minutos):\n${link}`);
    if (process.env.NODE_ENV !== 'production') devLink = link;
  }
  return json({ ok: true, devLink });
}
