import { db } from '@/lib/db';
import { fail, isResponse, json, parse, requireUser } from '@/lib/api/http';
import { figmaTokenSchema } from '@/lib/validation';
import { sealSecret, openSecret } from '@/lib/secret';
import { checkFigmaToken } from '@/lib/figma';

// Token pessoal do Figma (só o próprio manager). É validado no Figma, cifrado e nunca devolvido.
async function me() {
  const u = await requireUser();
  if (isResponse(u)) return u;
  if (u.role !== 'MANAGER') return fail(403, 'Só managers configuram a integração.');
  return u;
}
const state = (token: string | null | undefined) => { const t = openSecret(token); return { configured: !!t, last4: t ? t.slice(-4) : null }; };

export async function PUT(req: Request) {
  const u = await me();
  if (isResponse(u)) return u;
  const body = await parse(req, figmaTokenSchema);
  if (isResponse(body)) return body;
  const ok = await checkFigmaToken(body.token);
  if (!ok.ok) return fail(ok.status === 401 || ok.status === 403 ? 422 : 502, ok.message);
  const next = await db.user.update({ where: { id: u.id }, data: { figmaToken: sealSecret(body.token) } });
  return json(state(next.figmaToken));
}

export async function DELETE() {
  const u = await me();
  if (isResponse(u)) return u;
  const next = await db.user.update({ where: { id: u.id }, data: { figmaToken: null } });
  return json(state(next.figmaToken));
}
