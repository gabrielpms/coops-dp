import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession } from '@/lib/session';
import { hashToken } from '@/lib/tokens';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token') ?? '';
  const row = token ? await db.loginToken.findUnique({ where: { tokenHash: hashToken(token) } }) : null;
  if (!row || row.usedAt || row.expiresAt < new Date()) return NextResponse.redirect(new URL('/entrar?erro=link', url));
  await db.loginToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  await createSession(row.userId);
  return NextResponse.redirect(new URL('/', url));
}
