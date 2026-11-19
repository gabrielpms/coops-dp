import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { fail, isResponse, json, parse, requireUser } from '@/lib/api/http';
import { anthropicSettingsSchema } from '@/lib/validation';
import { sealSecret } from '@/lib/secret';
import { checkKey } from '@/lib/agent/anthropic';
import { integrationState } from '@/lib/agent/settings';

// Integração com a Anthropic da conta (só o próprio manager). A chave é validada, cifrada e nunca devolvida.
async function me() {
  const u = await requireUser();
  if (isResponse(u)) return u;
  if (u.role !== 'MANAGER') return fail(403, 'Só managers configuram a integração.');
  return u;
}

export async function GET() {
  const u = await me();
  if (isResponse(u)) return u;
  return json(await integrationState(u));
}

export async function PUT(req: Request) {
  const u = await me();
  if (isResponse(u)) return u;
  const body = await parse(req, anthropicSettingsSchema);
  if (isResponse(body)) return body;
  const data: Prisma.UserUpdateInput = {};
  if (body.apiKey) {
    const ok = await checkKey(body.apiKey);
    if (!ok.ok) return fail(ok.status === 401 || ok.status === 403 ? 422 : 502, ok.message);
    data.anthropicKey = sealSecret(body.apiKey);
    if (u.anthropicKey) data.anthropicSkills = Prisma.DbNull; // outra chave, outro workspace: as skills precisam ser enviadas de novo
  }
  if (body.model) data.anthropicModel = body.model;
  const next = await db.user.update({ where: { id: u.id }, data });
  return json(await integrationState(next));
}

export async function DELETE() {
  const u = await me();
  if (isResponse(u)) return u;
  const next = await db.user.update({ where: { id: u.id }, data: { anthropicKey: null, anthropicSkills: Prisma.DbNull } });
  return json(await integrationState(next));
}
