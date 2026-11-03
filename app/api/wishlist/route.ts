import { createHash, randomBytes } from 'node:crypto';
import { db } from '@/lib/db';
import { fail, json, parse, isResponse } from '@/lib/api/http';
import { wishlistSchema } from '@/lib/validation';

const hash = (t: string) => createHash('sha256').update(t).digest('hex');
const view = (e: { name: string; email: string; role: string; teamSize: string | null; focus: string | null; pains: string[]; channels: string[]; beta: boolean }) =>
  ({ name: e.name, email: e.email, role: e.role, teamSize: e.teamSize ?? 'Só eu', focus: e.focus ?? '', pains: e.pains, channels: e.channels, beta: e.beta });

// Inscrição pública. Cada inscrição devolve um token que fica no navegador: é ele que libera ler e editar as respostas depois.
export async function POST(req: Request) {
  const body = await parse(req, wishlistSchema);
  if (isResponse(body)) return body;
  const token = randomBytes(24).toString('base64url');
  const data = { name: body.name, role: body.role, teamSize: body.teamSize, focus: body.focus, pains: body.pains, channels: body.channels, beta: body.beta, consent: body.consent };
  const existing = await db.wishlistEntry.findUnique({ where: { email: body.email } });
  // Mesmo e-mail: só atualiza quem apresentar o token anterior (ou se a entrada nunca teve um).
  const given = req.headers.get('x-wishlist-token') ?? '';
  if (existing?.editToken && hash(given) !== existing.editToken) return fail(409, 'Esse e-mail já está na lista. Abra a wish list no navegador em que você se inscreveu para editar.');
  await db.wishlistEntry.upsert({ where: { email: body.email }, create: { email: body.email, ...data, editToken: hash(token) }, update: { ...data, editToken: hash(token) } });
  return json({ ok: true, token }, existing ? 200 : 201);
}

// Reabrir com o mesmo e-mail traz as respostas, desde que o token confira.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = (url.searchParams.get('email') ?? '').trim().toLowerCase();
  const token = req.headers.get('x-wishlist-token') ?? '';
  const e = email && token ? await db.wishlistEntry.findUnique({ where: { email } }) : null;
  if (!e?.editToken || hash(token) !== e.editToken) return fail(404, 'Não encontramos essa inscrição');
  return json({ entry: view(e) });
}
